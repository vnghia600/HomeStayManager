var fileAttachUpload = function ($q, $timeout, CommonFactory, $localstorage, $rootScope, ApiHelper) {
    return {
        restrict: 'E',
        transclude: true,

        scope: {
            myroot: "="
        },
        templateUrl: "/script-handler/app/directives/file-attach-upload/file-attach-upload.html",

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
            !scope.myroot && (scope.myroot = {});
            !scope.myroot.Core && (scope.myroot.Core = {});
            !scope.myroot.Core.IsListenProgress && (scope.myroot.Core.IsListenProgress = true);
            !scope.myroot.Core.Accept && (scope.myroot.Core.Accept = "*");
            !scope.myroot.Core.IsMultipleFile && (scope.myroot.Core.IsMultipleFile = false);
            scope.myroot.IsListenProgress = scope.myroot.Core.IsListenProgress;
            scope.myroot.IsMultipleFile = scope.myroot.Core.IsMultipleFile;
            scope.myroot.LstFile = [];
            scope.btnOpenDialog = element[0].querySelector('.btnOpenDialog');
            scope.input = element[0].querySelector('.files');
            //scope.myroot.ActionUpload = "/Directives/UploadFileToGCS/";

            if (scope.btnOpenDialog) {
                scope.btnOpenDialog.addEventListener('click', function (e) {
                    $timeout(() => {
                        angular.element(scope.input).trigger('click');
                    });
                });
            }
            scope.input.addEventListener('change', function (e) {
                if (!ApiHelper.CheckToken()) {
                    UtilJS.Loading.Hide();
                    return;
                }
                $timeout(() => {
                    var files = e.target.files;
                    if (files.length == 0) {
                        return;
                    }
                    var size = files[0].size;
                    let MaxSizeUpload = 2;
                    if (MasterData.MaxSizeUpload) {
                        MaxSizeUpload = MasterData.MaxSizeUpload;
                    }
                    if (size > MaxSizeUpload * 1024 * 1024) {
                        jAlert.Warning("Đính kèm không vượt quá " + MaxSizeUpload + " MB.");
                        return;
                    }
                    if (!scope.myroot.IsMultipleFile) {
                        scope.myroot.LstFile = [];
                        if (files.length > 1) {
                            jAlert.Warning("Vui lòng up 1 file");
                            return;
                        }
                    }
                    if (UtilJS.String.IsContain(files[0].name, ',')) {
                        jAlert.Warning("Tên file không hợp lệ. Vui lòng xóa dấu \",\" và thử lại");
                        return;
                    }

                    for (var i = 0; i < files.length; i++) {
                        var objFileNew = new objFile();
                        objFileNew.FileInput = files[i];
                        objFileNew.FileName = files[i].name.normalize();
                        if (scope.myroot.IsListenProgress) {
                            objFileNew.AlertNotFoundTimeout = false;
                            ListenProgress(objFileNew);
                            ListenStateChange(objFileNew);
                        }
                        scope.myroot.LstFile.push(objFileNew);
                        if (!scope.myroot.IsMultipleFile) {
                            UtilJS.Loading.Show();
                            scope.myroot.CallBack.UploadBegin && (scope.myroot.CallBack.UploadBegin(objFileNew));
                            objFileNew.Http.open("POST", "/Directives/UploadFileToGCS/", true);
                            var formData = new FormData();
                            formData.append("file", objFileNew.FileInput);
                            if (scope.myroot.SubModuleName) {
                                objFileNew.Http.setRequestHeader("subModuleName", scope.myroot.SubModuleName);
                            }
                            objFileNew.Http.send(formData);
                        }
                    }
                }).then(() => {
                    angular.element(scope.input).val(null);
                });
            });

            scope.myroot.API = {};
            scope.myroot.API.ClearLstItem = () => {
                scope.myroot.LstFile = [];
            };
            scope.myroot.API.ResetItem = function (objFileNew) {
                objFileNew.Percent = 0;
                objFileNew.FileName = '';
                objFileNew.FilePathSaved = '';
            };
            if (!scope.myroot.CallBack) {
                scope.myroot.CallBack = {};
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
                            UtilJS.Loading.Hide();
                            objFileNew.Percent = 100;
                            let obj = response.Data;
                            Object.assign(objFileNew, obj);
                            objFileNew.IsSuccess = true;
                            scope.myroot.CallBack.UploadDone && (scope.myroot.CallBack.UploadDone(objFileNew));
                            return;
                        }, 200);
                    }
                    else if (objFileNew.Http.readyState == 4 && objFileNew.Http.status != 200) {
                        $timeout.cancel(objFileNew.AlertNotFoundTimeout);
                        objFileNew.AlertNotFoundTimeout = $timeout(() => {
                            if (objFileNew.Http.status == 404) {
                                jAlert.Error("Định dạng file không đúng.", 'Thông báo');
                            }
                            else if (objFileNew.Http.status == 401) {
                                jAlert.Warning("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
                            }
                            else if (objFileNew.Http.status == 0) {
                                jAlert.Warning("Server không phản hồi");
                            }
                            else {
                                jAlert.Error("Lỗi status " + objFileNew.Http.status, 'Thông báo');
                                console.log(objFileNew.Http);
                            }
                            objFileNew.Percent = 0;
                            objFileNew.FileName = '';
                            UtilJS.Loading.Hide();
                            objFileNew.IsSuccess = false;
                            scope.myroot.CallBack.UploadDone && (scope.myroot.CallBack.UploadDone(objFileNew));
                            return;
                        }, 200);
                    }
                    scope.$apply();
                }
            };

            scope.myroot.OpenBrowse = () => {
                if (scope.myroot.Core.IsOpenBrowse()) {
                    $timeout(() => {
                        scope.input.click();
                    });
                }
            };
            scope.myroot.IsReady = true;
        } //link
    }; //return
};

fileAttachUpload.$inject = ["$q", "$timeout", "CommonFactory", "$localstorage", "$rootScope", "ApiHelper"];