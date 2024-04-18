//last update : 23/07/2018 hau
var fileUpload = function ($q, $timeout, CommonFactory, $localstorage, ApiHelper) {
    return {
        restrict: 'A',
        transclude: true,

        scope: {
            root: "=",
            isMultipleFile: "=",
            isLoading: "=",
            accept: "="
        },
        template: '<ng-transclude></ng-transclude>',

        link: function (scope, element, attrs) {
            function objFile() {
                this.IsDeleted = false,
                    this.Base64 = '',
                    this.Src = '',
                    this.DataType = '',
                    this.Http = new XMLHttpRequest(),
                    this.FileInput = {},
                    this.Percent = 0,
                    this.FileName = ''
            };
            if (!scope.root) {
                scope.root = {};
            }
            scope.root.LstFile = [];
            scope.btnOpenDialog = element[0].querySelector('.btnOpenDialog');
            scope.input = element[0].querySelector('.files');

            scope.root.ActionUpload = "/Directives/UploadFile/";

            if (scope.btnOpenDialog) {
                scope.btnOpenDialog.addEventListener('click', function (e) {
                    $timeout(() => {
                        angular.element(scope.input).trigger('click');
                    });
                });
            }

            scope.input.addEventListener('change', function (e) {
                //if (!ApiHelper.CheckLogin()) {
                //    UtilJS.Loading.Hide();
                //    return;
                //};
                $timeout(() => {
                    var files = e.target.files;
                    if (files.length == 0) {
                        return;
                    }

                    var size = files[0].size;
                    let totalSize = size;
                    scope.root.LstFile.filter((x) => totalSize += x.FileInput.size);

                    if (size > MasterData.MaxSizeUpload * 1024 * 1024) {
                        jAlert.Warning("Đính kèm không vượt quá 25 MB.");
                        return;
                    }
                    if (!scope.root.IsMultipleFile) {
                        if (files.length > 1) {
                            jAlert.Warning("Vui lòng up 1 file");
                            return;
                        }
                    }

                    for (var i = 0; i < files.length; i++) {
                        var objFileNew = new objFile();
                        objFileNew.FileInput = files[i];

                        objFileNew.FileName = files[i].name.normalize();
                        objFileNew.FileName = UtilJS.String.RemoveUnicode(objFileNew.FileName);
                        objFileNew.FileName = objFileNew.FileName.replace(",", "");
                        if (scope.root.IsListenProgress) {
                            objFileNew.AlertNotFoundTimeout = false;
                            ListenProgress(objFileNew);
                            ListenStateChange(objFileNew);
                        }
                        scope.root.LstFile.push(objFileNew);

                        UtilJS.Loading.Show();
                        //objFileNew.Http.open("POST", scope.root.ActionUpload, true);
                        //objFileNew.Http.setRequestHeader("Content-Type", "multipart/form-data");
                        //objFileNew.Http.setRequestHeader("FileName", objFileNew.FileName);
                        //objFileNew.Http.setRequestHeader("FileSize", objFileNew.FileInput.size);
                        //objFileNew.Http.setRequestHeader("FileType", objFileNew.FileInput.type);
                        //objFileNew.Http.setRequestHeader("isUploadDocument", scope.root.isUploadDocument);
                        //objFileNew.Http.setRequestHeader("Authorization", 'Bearer ' + scope.strToken);
                        //objFileNew.Http.send(objFileNew.FileInput);

                        objFileNew.Http.open("POST", scope.root.ActionUpload, true);
                        var formData = new FormData();
                        formData.append("file", objFileNew.FileInput);
                        objFileNew.Http.setRequestHeader("FileName", objFileNew.FileName);
                        objFileNew.Http.setRequestHeader("FileSize", objFileNew.FileInput.size);
                        objFileNew.Http.setRequestHeader("FileType", objFileNew.FileInput.type);

                        let isUploadDocument = false;
                        if (scope.root.isUploadDocument) {
                            isUploadDocument = scope.root.isUploadDocument;
                        }
                        objFileNew.Http.setRequestHeader("isUploadDocument", isUploadDocument);

                        objFileNew.Http.send(formData);
                    }
                }).then(() => {
                    angular.element(scope.input).val(null);
                });
            });

            scope.root.API = {};
            scope.root.API.ClearLstItem = () => {
                UtilJS.Array.RemoveAll(scope.root.LstFile);
            };
            scope.root.API.ResetItem = function (objFileNew) {
                objFileNew.Percent = 0;
                objFileNew.FileName = '';
                objFileNew.FilePathSaved = '';
            };

            if (!scope.root.CallBack) {
                scope.root.CallBack = {};
            }

            var ListenProgress = function (objFileNew) {
                objFileNew.Http.upload.addEventListener('progress', function (event) {
                    $timeout(() => {
                        fileLoaded = event.loaded; //Đã load được bao nhiêu
                        fileTotal = event.total; //Tổng cộng dung lượng cần load
                        fileProgress = parseInt((fileLoaded / fileTotal) * 100) || 0;
                        objFileNew.Percent = fileProgress;
                    }, 50);
                }, false);
            };
            var ListenStateChange = function (objFileNew) {
                objFileNew.Http.onreadystatechange = function (event) {
                    if (objFileNew.Http.readyState == 4 && objFileNew.Http.status == 200) {
                        $timeout(() => {
                            var response = JSON.parse(objFileNew.Http.responseText);
                            if (response.Code != 200) {
                                objFileNew.Percent = 0;
                                objFileNew.FileName = '';
                                UtilJS.Loading.Hide();
                                jAlert.Error("Upload file thất bại", 'Thông báo');
                                objFileNew.IsSuccess = false;
                                scope.root.CallBack.UploadDone && (scope.root.CallBack.UploadDone(objFileNew));
                                return;
                            }
                            if (response.Code == 200 && response.Success) {
                                UtilJS.Loading.Hide();
                                objFileNew.Percent = 100;
                                objFileNew.FilePathSaved = response.Data.FilePath;
                                //objFileNew.FilePathRelative = response.FilePathRelative;
                                /*objFileNew.AbsoluteUrl = response.Data.AbsoluteUrl;*/
                                objFileNew.IsSuccess = true;
                                scope.root.CallBack.UploadDone && (scope.root.CallBack.UploadDone(objFileNew));
                            }
                        }, 200);
                    }
                    else if (objFileNew.Http.readyState == 4 && objFileNew.Http.status != 200) {
                        $timeout.cancel(objFileNew.AlertNotFoundTimeout);
                        objFileNew.AlertNotFoundTimeout = $timeout(() => {
                            if (objFileNew.Http.status == 404) {
                                jAlert.Error("Định dạng file không đúng.", 'Thông báo');
                            }
                            else if (objFileNew.Http.status == 0 || objFileNew.Http.status == 401) {
                                jAlert.Warning("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
                            }
                            else {
                                jAlert.Error("Lỗi status " + objFileNew.Http.status, 'Thông báo');
                                console.log(objFileNew.Http);
                            }
                            objFileNew.Percent = 0;
                            objFileNew.FileName = '';
                            UtilJS.Loading.Hide();
                            return;

                        }, 200);
                    }
                    scope.$apply();
                }
            };

            scope.root.IsReady = true;
        } //link
    }; //return
};

fileUpload.$inject = ["$q", "$timeout", "CommonFactory", "$localstorage", "ApiHelper"];
addDirective("fileUpload", fileUpload);