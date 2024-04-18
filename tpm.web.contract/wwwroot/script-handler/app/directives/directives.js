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
var lazyLoadMore = function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {
            var scroller = elem[0];
            $(scroller).bind('scroll', function () {
                if (scroller.scrollTop + scroller.offsetHeight >= scroller.scrollHeight) {
                    scope.$apply('LoadMore()');
                }
            });
        }
    }
}
lazyLoadMore.$inject = [];
var customSelect2 = function ($q, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            myroot: "="
        },
        templateUrl: "/script-handler/app/directives/custom-select2/custom-select2.html",

        link: function (scope, element, attrs) {
            //#region function
            scope.myroot.UpdateValueSelected = function (x) {
                clearInterval(scope.myroot.myTimer);
                let defer = $q.defer();
                scope.myroot.myTimer = setInterval(() => {
                    if (scope.myroot.IsFinishRender) {
                        if (scope.myroot.IsDebug) {
                            debugger;
                        }
                        if (x !== undefined) {
                            scope.myroot.Value = x;
                        }
                        clearInterval(scope.myroot.myTimer);
                        scope.SetValid(scope.myroot.Value);

                        scope.myControl.val(scope.myroot.Value);

                        scope.myControl_s2id = $(element[0]).find('.select2-container');
                        scope.myControl_s2id.select2("val", scope.myroot.Value);
                        //scope.myControl.val(scope.myroot.Value).trigger('change');
                        defer.resolve(scope.myroot.Value);
                    }
                }, 100);
                return defer.promise;
            }
            scope.SetValid = function (ValueClient, IsValid) {
                if (ValueClient === "") {
                    $("input[name=" + scope.myroot.ID + "]").val('');
                }
                else {
                    $("input[name=" + scope.myroot.ID + "]").val(ValueClient);
                }
                try {
                    IsValid && ($("input[name=" + scope.myroot.ID + "]").valid());
                } catch (e) { }
            };
            //#endregion

            scope.myControl = $(element[0]).find('.myControl');
            //required 

            //default
            //myroot.Core.ValidType == "Required"

            //result
            //scope.myroot.Value => scope.myroot.Value 
            if (scope.myroot.IsDebug) {
                debugger;
            }
            if (!scope.myroot.Core.Label) {
                scope.myroot.Core.label = attrs.label;
                
            }
            else {
                scope.myroot.Core.label2 = scope.myroot.Core.Label;
            }

            if (!scope.myroot.Core.label2) {
                scope.myroot.Core.label2 = "Chọn " + attrs.label.charAt(0).toLowerCase() + attrs.label.slice(1);
            }
            scope.myroot.ID = attrs.myroot.replace(".", "_");
            scope.myroot.IsFinishRender = !scope.myroot.Lst || scope.myroot.Lst && scope.myroot.Lst.length == 0;

            !scope.myroot.API && (scope.myroot.API = {});
            !scope.myroot.CallBack && (scope.myroot.CallBack = {});

            !scope.myroot.Core.ValueDefault && (scope.myroot.Core.ValueDefault = "");

            scope.myroot.ValueOrginal = '';
            if (scope.myroot.Value) {
                scope.myroot.ValueOrginal = scope.myroot.Value;
                scope.myroot.Value = scope.myroot.Value.toString();
            }
            else {
                scope.myroot.Value = scope.myroot.Core.ValueDefault;
            }

            scope.myroot.Onchange = function () {
                if ($rootScope.isCustomSelect2Enable) { 
                    return;
                }
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                scope.SetValid(scope.myroot.Value, true);
                scope.myroot.CallBack.OnValuechanged && (scope.myroot.CallBack.OnValuechanged(scope.myroot.Value));
                scope.myroot.CallBack.Onchanged && (scope.myroot.CallBack.Onchanged());
            };
            scope.myroot.API.DiscardChange = function () {
                scope.myroot.API.SetValue(scope.myroot.ValueOrginal, true);
            };
            scope.myroot.API.SetValue = function (Value, IsNotFireChangedEvent) {
                try {
                    if (scope.myroot.IsDebug) {
                        debugger;
                    }
                    if (Value === null || Value === undefined) {
                        Value = scope.myroot.Core.ValueDefault;
                    }
                    scope.myroot.ValueOrginal = Value;
                    scope.myroot.Value = Value.toString();
                    scope.myroot.UpdateValueSelected().then((x) => {
                        if (scope.myroot.IsDebug) {
                            debugger;
                        }
                        if (!IsNotFireChangedEvent) { 
                            scope.myroot.CallBack.OnValuechanged && (scope.myroot.CallBack.OnValuechanged(x));
                        }
                    });
                } catch (e) {
                    debugger;
                    throw e;
                }
            };
            scope.myroot.API.DataSource = function (Lst, value) {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                scope.myroot.Lst = Lst;
                scope.myroot.UpdateValueSelected(value);
            };
            scope.myroot.API.OnStart = function () {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                scope.myroot.IsFinishRender = false;
            };
            scope.myroot.API.OnEnd = function () {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                scope.myroot.IsFinishRender = true;
            };

            $rootScope.beginBlockAllSelect2 = function () { 
                $rootScope.isCustomSelect2Enable = true;
            };
            $rootScope.endBlockAllSelect2 = function () {
                $rootScope.isCustomSelect2Enable = false;
            };
            //ready
            scope.myroot.UpdateValueSelected();
            scope.myControl.select2();

            if (scope.myroot.CallBack && scope.myroot.CallBack.OnOpenSelect2) {
                $(element[0]).on('select2-open', function () {
                    scope.myroot.CallBack.OnOpenSelect2();
                });
            }

            scope.myroot.IsReady = true;
        }
    };
};
customSelect2.$inject = ["$q", "$rootScope"];
var dateTimePicker = function () {
    return {
        restrict: 'E', 
        scope: {
            myroot: "=" 
        },
        templateUrl: "/script-handler/app/directives/date-time-picker/date-time-picker.html",

        link: function (scope, element, attrs) { 
            scope.input = $(element[0]).find('.myDtm'); 
            //default
            //scope.myroot.Core.ValidType == "Required" 
            //scope.myroot.Core.DateType == "Date" // "DateTime" 
            //scope.myroot.Core.IsComparedtmTo : so sánh với 1 dtm khác ??? nên callback lại thì hay hơn

            //result
            //scope.myroot.Value => scope.myroot.Value 
            !scope.myroot.API && (scope.myroot.API = {});
            !scope.myroot.CallBack && (scope.myroot.CallBack = {});
             
            scope.myroot.ID = attrs.myroot.replace(".", "_");  
            scope.myroot.Core.showTodayButton = true;
            scope.myroot.Core.showClear = true;
            scope.myroot.Core.showClose = true;

            scope.myroot.Core.label = attrs.label;

            if (scope.myroot.Core.DateType == "DateTime") {
                !scope.myroot.Core.FormatValueDisplay
                && (scope.myroot.Core.format = 'DD/MM/YYYY HH:mm');
                !scope.myroot.Core.FormatValue
                && (scope.myroot.Core.FormatValue = 'MM/DD/YYYY HH:mm');
            }
            else { 
                !scope.myroot.Core.FormatValueDisplay
                && (scope.myroot.Core.format = 'DD/MM/YYYY');
                !scope.myroot.Core.FormatValue
                && (scope.myroot.Core.FormatValue = 'MM/DD/YYYY');
            } 

            scope.myroot.ValueOrginal = undefined; 
            if (scope.myroot.Value) {
                scope.myroot.ValueOrginal = scope.myroot.Value;
                scope.myroot.ValueDisplay = moment(scope.myroot.Value).format(scope.myroot.Core.format);
                scope.myroot.Value = moment(scope.myroot.Value).format(scope.myroot.Core.FormatValue);
            }
            else {
                scope.myroot.Value = null;
            }

            //trigger change ???
            scope.myroot.API.SetValue = function (Value, IsNotCB) {
                try {
                    if (scope.myroot.IsDebug) {
                        debugger;
                    }
                    scope.myroot.ValueOrginal = Value;
                    if (Value === null || Value === undefined) {
                        scope.myroot.ValueDisplay = null;
                        scope.myroot.Value = null;
                    }
                    else {
                        scope.myroot.ValueDisplay = moment(Value).format(scope.myroot.Core.format);
                        scope.myroot.Value = moment(Value).format(scope.myroot.Core.FormatValue);
                    }
                    $("input[name=" + scope.myroot.ID + "]").val(scope.myroot.Value);
                    !IsNotCB && scope.myroot.CallBack.OnValuechanged && (scope.myroot.CallBack.OnValuechanged(scope.myroot.Value));
                } catch (e) {
                    debugger;
                    throw e;
                }
            };
            scope.myroot.config = {};
            scope.myroot.config.format = scope.myroot.Core.format;
            scope.myroot.config.showTodayButton = true;
            scope.myroot.config.showClear = true;
            scope.myroot.config.showClose = true;

            if (scope.myroot.Core.MinDate) {
                scope.myroot.config.minDate = scope.myroot.Core.MinDate;
            }
            else {
                scope.myroot.config.minDate = new Date(0);
            }
            if (scope.myroot.Core.UseCurrent != undefined) {
                scope.myroot.config.useCurrent = scope.myroot.Core.UseCurrent;
            }
            scope.input.datetimepicker(scope.myroot.config);
            scope.input.on("dp.change", function (e) {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                if (!e.date) { 
                    scope.myroot.ValueDisplay = null;
                    scope.myroot.Value = null;
                }
                else { 
                    scope.myroot.ValueDisplay = scope.input.val();
                    scope.myroot.Value = moment(e.date).format(scope.myroot.Core.FormatValue);
                }
                $("input[name=" + scope.myroot.ID + "]").val(scope.myroot.Value);
                try {
                    $("input[name=" + scope.myroot.ID + "]").valid();
                } catch (e) { }
                 
                //let EndDate = new Date($scope.PriceSearchRes.DateTo);
                //if (e.date._d.getTime() > EndDate.getTime()) {
                //    e.date._d.setHours(23, 59, 0, 0);
                //    $('#txtToDate').data("DateTimePicker").date(e.date);
                //}
                //e.date._d.setHours(0, 0, 0, 0);
                //$('#txtToDate').data("DateTimePicker").minDate(e.date);

                scope.myroot.CallBack.OnValuechanged && (scope.myroot.CallBack.OnValuechanged(scope.myroot.Value)); 
            });
            scope.myroot.API.SetMinDate = function (date) {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                if (moment(date).isValid()) {
                    date = moment(date)._d;
                    //date.setHours(0, 0, 0, 0);
                    scope.input.data("DateTimePicker").minDate(date);
                }
            }
            scope.myroot.API.SetMinTime = function (date) {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                if (moment(date).isValid()) {
                    let str = moment(date).format('HH:mm');
                    scope.input.setOptions({
                        minTime: str
                    });
                }
            }
            scope.myroot.API.SetMaxDate = function (date) {
                if (scope.myroot.IsDebug) {
                    debugger;
                }
                if (moment(date).isValid()) {
                    date = moment(date)._d;
                    //date.setHours(0, 0, 0, 0);
                    scope.input.data("DateTimePicker").maxDate(date);
                }
            }
            $("input[name=" + scope.myroot.ID + "]").val(scope.myroot.Value); 

            scope.myroot.IsReady = true;
        }
    }; 
};
dateTimePicker.$inject = [];
var formatMoney = function ($filter, $timeout) {
    return {
        require: '?ngModel',
        restrict: "A",
        scope: {
            myModel: "=",
            precision: "=",
            formatMoneyNoInput: "="
        },
        link: function (scope, elem, attrs, ctrl) {
            if (scope.precision == null || scope.precision == undefined)
                scope.precision = 0;
            elem.maskMoney({
                allowNegative: true, thousands: ',', decimal: '.', affixesStay: false, allowZero: true, precision: scope.precision
            });
            elem.keydown(function (event) {
                var c = String.fromCharCode(event.which);
                if (_.contains(scope.formatMoneyNoInput, c)) {
                    event.preventDefault();
                    return;
                }
                $timeout(function () {
                    scope.myModel = parseFloat(elem.val().replace(new RegExp(",", 'g'), ""));
                    elem.trigger("change");
                });
            });
            scope.$watch('myModel', function () {
                if ($.isNumeric(scope.myModel) && scope.myModel.toString().indexOf('.') > 0) {
                    elem.val(scope.myModel.toFixed(scope.precision)).trigger('mask.maskMoney');
                }
                else {
                    elem.val(scope.myModel).trigger('mask.maskMoney');
                }
            });
        }
    }
};
formatMoney.$inject = ['$filter', '$timeout'];
var getWidth = function ($timeout, $interval) {
    return {
        restrict: 'A',

        scope: {
            getWidth: "=",
        },

        link: function (scope, element, attrs) {
            $(function () {
                scope.getWidth = element[0].offsetWidth; 

                $interval(function () {
                    scope.getWidth = element[0].offsetWidth;
                }, 500); 
            });
        }
    };
};

getWidth.$inject = ["$timeout", "$interval"];

var getHeight = function ($timeout, $interval) {
    return {
        restrict: 'A',

        scope: {
            getHeight: "=",
        },

        link: function (scope, element, attrs) {
            $(function () { 
                scope.getHeight = element[0].offsetHeight; 

                $interval(function () {
                    scope.getHeight = element[0].offsetHeight;
                }, 500);
            });
        }
    };
};

getHeight.$inject = ["$timeout", "$interval"];
var lazyLoad = function ($timeout, $window) {
    return {
        restrict: 'A',
        scope: {
            fncallback: "&lazyLoad"
        },

        link: function (scope, element, attrs) {
            scope.IsLoaded = false;
            scope.raw = element[0];  
            angular.element($window).bind("scroll", function (e) {
                var IsVisible = $(scope.raw).is(':visible');
                if (!scope.IsLoaded && IsVisible) {
                    var PositionYofElement = $(scope.raw).position().top;
                    if (this.pageYOffset + this.innerHeight >= PositionYofElement) {
                        scope.fncallback();
                        scope.IsLoaded = true; 
                        scope.$apply();
                    }

                }
            });
        }
    };
};

lazyLoad.$inject = ["$timeout", "$window"];
 
var noInput = function () {
    return {
        restrict: 'A',

        scope: {
            noInput: "="
        }, 

        link: function (scope, element, attrs) {  
            element.bind("keydown keypress", function (event) { 
                var c = String.fromCharCode(event.which);
                if (_.contains(scope.noInput, c)) { 
                    event.preventDefault();
                } 
            });

            //scope.KeyCode = [];
            //scope.noInput.forEach(function (item) {
            //    scope.KeyCode.push(item.charCodeAt(0));
            //});

            //element.bind("keydown keypress", function (event) {
            //    if (_.contains(scope.KeyCode, event.which)) {
            //        event.preventDefault();
            //    }
            //});
        }
    }; 
};
noInput.$inject = [];
var whenEnter = function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.whenEnter);
                });

                event.preventDefault();
            }
        });
    };
};
whenEnter.$inject = [];
var compile = function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
              // watch the 'compile' expression for changes
              return scope.$eval(attrs.compile);
          },
          function (value) {
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);

              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
          }
      );
    };
};
compile.$inject = ["$compile"];
var paginationStyle1 = function ($timeout) {
    return {
        restrict: "E",

        scope: {
            pager: "=",//{ TotalItems: 0, PageSize: 10, CurrentPage: 1 }
            totalItems: "=",
            fnCallBack: "&"
        },
        templateUrl: "/script-handler/app/directives/pagination-style/pagination-style.html",

        link: function (scope, element, attrs) {
            scope.pager.TotalItems = 0;
            scope.pager.TotalPages = 0;

            function setPage() {
                if (!scope.pager.CurrentPage || scope.pager.CurrentPage < 1 || scope.pager.CurrentPage > scope.pager.TotalPages) {
                    scope.pager.Pages = [];
                    return;
                }

                if (!scope.pager.TotalPages) {
                    scope.pager.Pages = [];
                    return;
                }

                // get pager object from service
                GetPager(scope.pager.TotalItems, scope.pager.CurrentPage, scope.pager.PageSize);
            }

            function GetPager(TotalItems, CurrentPage, PageSize) {
                // default to first page
                CurrentPage = CurrentPage || 1;
                // default page size is 10
                PageSize = PageSize || 10;

                var StartPage, EndPage;
                StartPage = scope.pager.StartPage || 1;
                EndPage = scope.pager.EndPage || 10;
                //số page trên 1 trang
                var NumberPageSize = 10;
                var Lst = [];
                var NumberPager = Math.floor(scope.pager.TotalPages / NumberPageSize);
                var decimalPager = scope.pager.TotalPages % NumberPageSize;

                for (var i = 1; i <= NumberPager; i++) {
                    var Start = (i - 1) * PageSize;
                    var End = Start + NumberPageSize;
                    Lst.push({ Start: Start + 1, End: End });
                }
                if (decimalPager > 0) {
                    Lst.push({ Start: NumberPager * NumberPageSize + 1, End: NumberPager * NumberPageSize + decimalPager });
                }
                var IsHasCurrentPage = false;
                for (var i = 0; i < Lst.length; i++) {
                    if (CurrentPage >= Lst[i].Start && CurrentPage <= Lst[i].End) {
                        StartPage = Lst[i].Start;
                        EndPage = Lst[i].End;
                        if (EndPage > 10 && EndPage - StartPage < 9) {
                            StartPage = EndPage - 9;
                        }
                        IsHasCurrentPage = true;
                        break;
                    }
                }
                if (!IsHasCurrentPage) {
                    CurrentPage = Lst[0].Start;
                    StartPage = Lst[0].Start;
                    EndPage = Lst[0].End;
                }

                // calculate start and end item indexes
                var StartIndex = (CurrentPage - 1) * PageSize;
                var EndIndex = Math.min(StartIndex + PageSize - 1, TotalItems - 1);

                // create an array of pages to ng-repeat in the pager control
                var Pages = [];
                for (var i = StartPage; i <= EndPage; i++) {
                    Pages.push(i);
                }
                if (CurrentPage <= 0)
                    CurrentPage = 1;
                // return object with all pager properties required by the view
                scope.pager.PageSize = PageSize;
                scope.pager.StartPage = StartPage;
                scope.pager.EndPage = EndPage;
                scope.pager.StartIndex = StartIndex;
                scope.pager.EndIndex = EndIndex;
                scope.pager.Pages = Pages;
            }

            scope.$watch('totalItems', function (value) {
                scope.pager.TotalItems = scope.totalItems;
                scope.InitPager();
            });
            scope.$watch('pager.CurrentPage', function (value) {
                scope.InitPager();
            });
            scope.InitPager = function () {
                $timeout(function () {
                    scope.pager.TotalPages = Math.ceil(scope.pager.TotalItems / scope.pager.PageSize);

                    //Case: cập nhật mà bị mất row, thì fai~ pagecurrent--
                    if (scope.pager.CurrentPage > scope.pager.TotalPages) {
                        scope.pager.CurrentPage = scope.pager.TotalPages;
                        if (scope.pager.TotalPages == 0) {
                            scope.pager.CurrentPage = 1;//gán = 1 để khi set page, nếu totalpages có data thì currentpage bắt đầu là 1
                        }
                    }

                    setPage();
                });
            };

            scope.Exec = function (intPageClicked) {
                if (intPageClicked > scope.pager.TotalPages) {
                    return;
                }

                scope.fnCallBack({ PageClicked: intPageClicked });
                //setPage();
            }
            scope.ExecFirst = function (intPageClicked) {
                if (intPageClicked > scope.pager.TotalPages) {
                    intPageClicked = scope.pager.TotalPages;
                }
                if (intPageClicked <= 0) {
                    intPageClicked = 1;
                }
                scope.pager.StartPage = scope.pager.StartPage - 10;
                scope.pager.EndPage = scope.pager.EndPage - 10;
                if (scope.pager.StartPage <= 0) {
                    scope.pager.StartPage = 1;
                    scope.pager.EndPage = 10;
                }
                scope.fnCallBack({ PageClicked: intPageClicked });
                //setPage();
            }
            scope.ExecLast = function (intPageClicked) {
                if (intPageClicked > scope.pager.TotalPages) {
                    intPageClicked = scope.pager.TotalPages;
                }
                scope.pager.StartPage = scope.pager.EndPage + 1;
                scope.pager.EndPage = scope.pager.StartPage + 9;
                if (scope.pager.EndPage > scope.pager.TotalPages) {
                    scope.pager.EndPage = scope.pager.TotalPages;
                    scope.pager.StartPage = scope.pager.EndPage - 9;
                }
                scope.fnCallBack({ PageClicked: intPageClicked });
                //setPage();
            }

            scope.pager.GetPageIndexReLoad = function (totalItem) {//dùng khi xóa row mà muốn tìm CurrentPage reload grid
                if (scope.pager.CurrentPage < scope.pager.TotalPages) return scope.pager.CurrentPage;
                if (totalItem % scope.pager.PageSize > 0) return scope.pager.CurrentPage;
                else return scope.pager.CurrentPage-1;
            }
        }
    };
};

paginationStyle1.$inject = ["$timeout"];
var paginationStyle2 = function ($timeout) {
    return {
        restrict: "E",

        scope: {
            pager: "=",
            totalItems: "=",
            fnCallBack: "&"
        },
        templateUrl: "/script-handler/app/directives/pagination-style2/pagination-style2.html",

        link: function (scope, element, attrs) {
            scope.pager.MaxPage = -1;

            scope.$watch('totalItems', function (value) {
                scope.pager.TotalItems = scope.totalItems;
                scope.pager.MaxPage = -1;
                scope.InitPager();
            });
            scope.$watch('pager.CurrentPage', function (value) {
                scope.InitPager();
            });
            scope.InitPager = function () {
                $timeout(function () {
                    var StartIndex = (scope.pager.CurrentPage - 1) * scope.pager.PageSize;
                    var nextIndex = StartIndex + scope.pager.PageSize;
                    scope.pager.StartIndex = StartIndex;
                    if (nextIndex >= scope.pager.TotalItems)
                        scope.pager.MaxPage = scope.pager.CurrentPage;
                });
            };
            scope.Exec = function (intPageClicked, event) {
                //$(event.currentTarget).blur();
                if ((scope.pager.MaxPage > -1) && (intPageClicked > scope.pager.MaxPage)) {
                    return;
                }
                if (intPageClicked <=0) {
                    return;
                }
                scope.fnCallBack({ PageClicked: intPageClicked });
            }
        }
    };
};

paginationStyle2.$inject = ["$timeout"];
var inputFormat = function ($filter) {
    return {
        require: '?ngModel',
        restrict: "A",
        link: function (scope, elem, attrs, ngModelCtrl) {
            if (ngModelCtrl == null) {
                return;
            }
            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            elem.bind('keypress', function (event) {
                var keyCode = event.which || event.keyCode;
                var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
                scope.allowdecimal = allowdecimal;
                if (((keyCode > 47) && (keyCode < 58)) || (keyCode == 8) || (keyCode == 9) || (keyCode == 190) || (keyCode == 39) || (keyCode == 37) || (keyCode == 43) || (allowdecimal && keyCode == 46))
                    setDisplayNumber(elem.val());
                else
                    event.preventDefault();

            });

            function setDisplayNumber(val, formatter) {
                var valStr = "", displayValue = "";

                if (val === "" || val === null || val === undefined) {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = scope.allowdecimal ? $filter(attrs.inputFormat)(displayValue ? displayValue : 0, 8) : $filter(attrs.inputFormat)(displayValue ? displayValue : 0);
                }

                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        if (valStr.slice(-1) === '.') {
                            displayValue += '.';
                        } else if (valStr.slice(-2) === '.0') {
                            displayValue += '.0';
                        } else if (valStr.slice(-3) === '.00') {
                            displayValue += '.00';
                        } else if (valStr.slice(-4) === '.000') {
                            displayValue += '.000';
                        } else if (valStr.slice(-5) === '.0000') {
                            displayValue += '.0000';
                        } else if (valStr.slice(-6) === '.00000') {
                            displayValue += '.00000';
                        } else if (valStr.slice(-7) === '.000000') {
                            displayValue += '.000000';
                        } else if (valStr.slice(-8) === '.0000000') {
                            displayValue += '.0000000';
                        }
                    }
                    // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue = valStr;
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }

                if (typeof formatter !== 'undefined') {
                    return (displayValue === '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue === '0') ? '0' : displayValue).trigger('change');
                }
            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                //----Math.round----
                //if (modelNum.toString().indexOf('.') !== -1) {
                //    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                //}
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };

    //return {
    //    require: '?ngModel',
    //    restrict: "A",
    //    link: function (scope, elem, attrs, ctrl) {
    //        function isFloat(n) {
    //            return Number(n) === n && n % 1 !== 0;
    //        }
    //        var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //        scope.allowdecimal = allowdecimal;
    //        scope.defaultValue = attrs["defaultValue"] ? attrs["defaultValue"] : false;
    //        if (!ctrl) return;

    //        elem.bind("keypress", function (event) {
    //            var keyCode = event.which || event.keyCode;
    //            var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //            if (((keyCode > 47) && (keyCode < 58)) || (keyCode == 8) || (keyCode == 9) || (keyCode == 190) || (keyCode == 39) || (keyCode == 37) || (keyCode == 43) || (allowdecimal && keyCode == 46))
    //                return true;
    //            else
    //                event.preventDefault();
    //        });

    //        ctrl.$formatters.unshift(function (a) {
    //            if (ctrl.$modelValue == undefined || ctrl.$modelValue.length == 0) {
    //                return "";
    //            }
    //            return $filter(attrs.inputFormat)(ctrl.$modelValue ? ctrl.$modelValue : 0);
    //        });

    //        ctrl.$parsers.unshift(function (viewValue) {
    //            var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //            if (scope.defaultValue && !parseInt(viewValue)) {
    //                viewValue = scope.defaultValue;
    //            }
    //            else if (!allowdecimal && isFloat(parseFloat(viewValue))) {
    //                viewValue = scope.defaultValue;
    //            }
    //            var plainNumber = viewValue.replace(/[^\d|\.|\-]/g, '');
    //            plainNumber = plainNumber || 0;
    //            if (plainNumber == '') return;
    //            var dots = plainNumber.match(/\./g);
    //            var dotAF = plainNumber.match(/\.$/g);
    //            dots = (dots != null && dots.length == 1 && dotAF != null) ? '.' : '';

    //            var temp = plainNumber.replace(/\.+/g, '.');
    //            var checkZero = temp.match(/^\d+\.0+$/g);
    //            if (!checkZero)
    //                temp = $filter(attrs.inputFormat)(plainNumber.replace(/\.+/g, '.'));

    //            elem.val(temp + dots).trigger('change');

    //            return parseFloat(plainNumber);
    //        });
    //    }
    //}
};
inputFormat.$inject = ['$filter'];