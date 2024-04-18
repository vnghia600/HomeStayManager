var IndexController = ($scope, $rootScope, $timeout, $filter, ApiHelper, UtilFactory, DataFactory, $q, CommonFactory) => {

    //#region declare variable
    var objExportSearch;
    $scope.TimeKeeping = {
        btnSearch: {},
        btnConfirm: {},
        btnExport: {}
    };
    $scope.TimeKeeping.Pager = { TotalItems: 0, PageSize: 1000, CurrentPage: 1 };
    $scope.TimeKeeping.Lst = [];
    $scope.TimeKeeping.Permission = {};
    $scope.TimeKeeping.Permission.isConfirm = $rootScope.UserPricinpal.IsInRole("TimeKeeping.Confirm") || $rootScope.UserPricinpal.IsInRole("TimeKeeping.Confirm.All");

    $scope.TimeKeepingSearch = { ShiftID: '-1', IsConfirm: '-2' };
    $scope.SalaryShift = {};

    $scope.TimeKeeping.Permission.isConfirm = true;

    ////Dopdown phòng ban
    $scope.TimeKeepingSearch.NodeDepartment = { IDSelectedTimeOut: false, IsSelectedAll: true, NodeResult: { IDSelected: [] } };
    $scope.TimeKeepingSearch.NodeDepartment.TreeData = [];
    $scope.TimeKeepingSearch.NodeDepartment.core = {
        themes: {
            icons: false
        }
    };

    ////Dopdown chi nhánh
    //$scope.TimeKeepingSearch.NodeStore = { Lst: [], Result: { LstIDSelected: [] }, CallBack: {} };
    //$scope.TimeKeepingSearch.NodeStore.Core = {
    //    IsShowCheckboxAll: true,
    //    IsShowSearch: true,
    //    IsCheckAll: true,
    //    Text: 'StoreName',
    //    IDValue: 'StoreID'
    //};


    //#region dtm

    let today = new Date();
    today.setHours(23, 59, 0, 0);

    //txtTimeKeeping
    $scope.TimeKeepingSearch.TimeKeepingDisplay = moment(today).format('DD/MM/YYYY');
    $scope.TimeKeepingSearch.TimeKeeping = moment(today).format('MM/DD/YYYY');

    $('#txtTimeKeeping').datetimepicker({
        format: 'DD/MM/YYYY',
        showTodayButton: true,
        showClear: false,
        showClose: true,
        defaultDate: today
    });
    $("#txtTimeKeeping").on("dp.change", function (e) {
        if ($("#txtTimeKeeping").val() == '') {
            $scope.TimeKeepingSearch.TimeKeepingDisplay = '';
            $scope.TimeKeepingSearch.TimeKeeping = '';
            return;
        }
        if (e.date._d.getTime() <= new Date('01/01/1900').getTime()) {
            $(this).data('DateTimePicker').date(new Date(new Date().setHours(00, 00, 00)));
        }
        $scope.TimeKeepingSearch.TimeKeepingDisplay = $("#txtTimeKeeping").val();
        $scope.TimeKeepingSearch.TimeKeeping = moment(e.date).format('MM/DD/YYYY');
    });
    //#endregion dtm

    //#endregion

    //#region  search
    $scope.TimeKeeping.btnSearch.OnClick = function (intPage) {
        if ($("#txtTimeKeeping").val() == '') {
            jAlert.Warning('Chọn ngày chấm công');
            return;
        }
        TimeKeeping_Get(intPage);
    };
    //#endregion 

    $scope.TimeKeeping.btnConfirm.OnClick = function (intPage) {
        Confirm();
    };

    //#region edit vs delete item in grid
    $scope.TimeKeeping.ItemOnDelete = function (item) {
        Delete(item);
    };
    //#endregion

    //#region function CRUD
    var Confirm = () => {
        let LstChecked = $scope.TimeKeeping.Lst.filter((timeKeeping) => {
            return timeKeeping.IsChecked == true;
        });

        if (LstChecked.length == 0) {
            jAlert.Warning('Chọn ít nhất 1 dòng để xác nhận');
            return;
        }

        let LstTimeFail = _.filter(LstChecked, function (item) {
            var timeStart = new Date(moment(new Date()).format('MM/DD/YYYY ') + item.HourStart + ':' + item.MinuteStart).getTime();
            var timeEnd = new Date(moment(new Date()).format('MM/DD/YYYY ') + item.HourEnd + ':' + item.MinuteEnd).getTime();
            var timeDiff = timeStart - timeEnd;
            return timeDiff > 0;
        });

        if (LstTimeFail.length > 0) {
            jAlert.Warning('Dữ liệu xác nhận công không hợp lệ tại ' + LstTimeFail[0].UserName);
            return;
        }

        let LstReq = [];
        LstChecked.forEach((item) => {
            let obj = {};
            obj.Tkid = item.TKID;
            if (item.IsConfirm != -1)
                obj.IsConfirm = item.IsConfirm == 1 ? true : false;
            obj.ConfirmShiftId = parseInt(item.ShiftID);
            obj.ConfirmTimeShift = (item.HourStart + ':' + item.MinuteStart);
            obj.ConfirmNote = item.ConfirmNote;
            obj.TimeKeeping = $scope.TimeKeepingSearch.TimeKeeping;
            obj.ConfirmTimeEnd = (item.HourEnd + ':' + item.MinuteEnd);
            LstReq.push(obj);
        });
        let obj = LstReq;
        let strApiEndPoint = "/TimeKeepings/Confirm";
        CommonFactory.PostMethod(strApiEndPoint, obj)
            .then(function (response) {
                $scope.TimeKeeping.Lst.forEach((timeKeeping) => {
                    timeKeeping.IsChecked = false;
                });
                $scope.IsCheckedAll = false;

                jAlert.Success('Xác nhận thành công');
            })
            .catch(function (response) {
                jAlert.Notify(response.objCodeStep);
            });
    };

    var TimeKeeping_ExportExcel = () => {
        let defer = $q.defer();
        UtilJS.Loading.Show();
        let strApiEndPoint = "/TimeKeepings/Export";

        //let objParaExcel = {};
        //objParaExcel.KeySearch = $scope.TimeKeeping.paraExcel.KeySearch;
        //objParaExcel.ShiftID = parseInt($scope.TimeKeeping.paraExcel.ShiftID);
        //objParaExcel.IsConfirm = parseInt($scope.TimeKeeping.paraExcel.IsConfirm);
        //objParaExcel.TimeKeeping = $scope.TimeKeeping.paraExcel.TimeKeeping;
        
        UtilJS.Files.Download({
            url: strApiEndPoint,
            data: { obj: objExportSearch },
            beforsend: function () {
                $timeout(function () { UtilJS.Loading.Show(); });
            },
            callback: function (result) {
                $timeout(function () { UtilJS.Loading.Hide(); });
                if (result == undefined) return;
                if (result.objCodeStep.Status != jAlert.Status.Success) {
                    jAlert.Notify(result.objCodeStep);
                    return;
                }
            }
        });
    };
    //#endregion

    //#region load data
    var SalaryShift_Get = () => {
        let defer = $q.defer();
        let strApiEndPoint = "/TimeKeepings/List";

        CommonFactory.PostMethod(strApiEndPoint)
            .then(function (response) {
                $scope.SalaryShift.Lst = response.Data.filter((x) => !_.contains([3, 4, 5], x.ShiftID));
                defer.resolve(response);
            })
            .catch(function (response) {
                defer.reject(response);
            });
        return defer.promise;
    };

    SalaryShift_Get();
    var TimeKeeping_Get = (intPage) => {

        intPage = !intPage ? 1 : intPage;
        let defer = $q.defer();
        let obj = {};

        obj.KeySearch = $scope.TimeKeepingSearch.txtSearch;
        obj.ShiftID = $scope.TimeKeepingSearch.ShiftID;

        obj.TimeKeeping = $scope.TimeKeepingSearch.TimeKeeping;
        //if ($scope.TimeKeepingSearch.IsConfirm >= 0)
        obj.IsConfirm = $scope.TimeKeepingSearch.IsConfirm;
        obj.PageSize = $scope.TimeKeeping.Pager.PageSize;
        obj.PageIndex = intPage - 1;
        obj.DepartmentIDs = $scope.TimeKeepingSearch.NodeDepartment.NodeResult.IDSelected.map(Number);
        if (obj.DepartmentIDs.length == 0) {
            jAlert.Warning('Không tìm thấy phòng ban');
            return;
        }
        objExportSearch = obj; 

        UtilJS.Loading.Show();
        let strApiEndPoint = "/TimeKeepings/SearchConfirm";
        CommonFactory.PostMethod(strApiEndPoint, obj)
            .then(function (response) {
                $scope.TimeKeeping.Lst = response.Data.filter((x) => {
                    if (x.CheckInTime) {
                        x.CheckInTime = moment(x.CheckInTime).format('HH:mm');
                    } 
                    if (x.CheckOutTime) {
                        x.CheckOutTime = moment(x.CheckOutTime).format('HH:mm');
                    }
                    if (x.ConfirmTimeStart) {
                        x.ConfirmTimeStart = moment(x.ConfirmTimeStart).format('HH:mm');
                    }
                    if (x.ConfirmTimeEnd) {
                        x.ConfirmTimeEnd = moment(x.ConfirmTimeEnd).format('HH:mm');
                    } 
                    formatTimeEnd(x);
                    return x;
                });
                FormatGUI();

                //set para export excel
                $scope.TimeKeeping.paraExcel = obj;

                defer.resolve(response);
                UtilJS.Loading.Hide();
            })
            .catch(function (response) {
                UtilJS.Loading.Hide();
                $scope.TimeKeeping.Lst = [];
                jAlert.Notify(response.objCodeStep);
                defer.reject(response);
            })
        return defer.promise;
    };
    var formatTimeEnd = function (x) {
        if (x.ConfirmTimeEnd) {
            let arrTime = x.ConfirmTimeEnd.split(':');
            x.HourEnd = parseInt(arrTime[0]).toString();
            x.MinuteEnd = parseInt(arrTime[1]).toString();
        }
        else if (x.CheckOutTime) { 
            let arrCheckOutTime = x.CheckOutTime.split(':');
            x.HourEnd = parseInt(arrCheckOutTime[0]).toString();
            x.MinuteEnd = parseInt(arrCheckOutTime[1]).toString(); 
        }
    }
    $q.all([
        DataFactory.DepartmentTree_Read(),
        //DataFactory.Stores_Get()
    ]).then((MultipleRes) => {
        let lstDepartment = MultipleRes[0].Data;
        let u = _.find(lstDepartment, (x) => x.DepartmentID == $rootScope.UserPricinpal.DepartmentID);
        if (u != undefined) {
            let ids = u.NodeTree.split(",").filter((x) => x).map(Number);
            $scope.TimeKeepingSearch.NodeDepartment.TreeData = lstDepartment.filter((x) => _.contains(ids, x.DepartmentID));
        }

        //$scope.TimeKeepingSearch.NodeStore.Lst = MultipleRes[1].Data;

        UtilJS.Loading.Hide();
    }).catch((response) => {
        UtilJS.Loading.Hide();
        throw response;
    });

    $scope.Hour = {};
    $scope.Hour.Lst = [];
    for (var i = 1; i < 24; i++) {
        let obj = {};
        obj.Value = i;
        obj.Name = i < 10 ? '0' + i : i;
        $scope.Hour.Lst.push(obj);
    }

    $scope.Minute = {};
    $scope.Minute.Lst = [];
    for (var i = 0; i < 60; i += 1) {
        let obj = {}
        obj.Value = i;
        obj.Name = i < 10 ? '0' + i : i;
        $scope.Minute.Lst.push(obj);
    }

    function FormatGUI() {
        $scope.TimeKeeping.Lst.forEach(function (item) {
            //Thời gian
            item.HourEnd = item.HourEnd.toString();
            item.MinuteEnd = item.MinuteEnd.toString();

            item.ShiftID = item.ShiftID.toString();


            if (item.ConfirmShiftId) {
                item.ShiftID = item.ConfirmShiftId.toString();
            }

            if (item.IsConfirm == null)
                item.IsConfirm = -1;
            else
                item.IsConfirm = item.IsConfirm == true ? 1 : 0;
            item.IsChecked = false;

            let arrCheckInTime = item.CheckInTime.split(':');
            item.HourStart = parseInt(arrCheckInTime[0]).toString();
            item.MinuteStart = parseInt(arrCheckInTime[1]).toString(); 
            if (item.ConfirmTimeStart) {
                let arrTime = item.ConfirmTimeStart.split(':');
                item.HourStart = parseInt(arrTime[0]).toString();
                item.MinuteStart = parseInt(arrTime[1]).toString();
            }
        });
    };

    $scope.CheckedAll = (event) => {
        var IsChecked = event.target.checked;
        if (IsChecked) {
            $scope.TimeKeeping.Lst.forEach((timeKeeping) => {
                timeKeeping.IsChecked = IsChecked;
            });
        } else {
            $scope.TimeKeeping.Lst.forEach((timeKeeping) => {
                timeKeeping.IsChecked = IsChecked;
            });
        }
    };

    $scope.Checked = (event, timeKeeping) => {
        var IsChecked = event.target.checked;

        if (IsChecked) {
            let count = $scope.TimeKeeping.Lst.filter((timeKeeping_filter) => {
                return timeKeeping_filter.IsChecked == false;
            });
            if (count == 0)
                $scope.IsCheckedAll = true;
        } else {
            $scope.IsCheckedAll = false;
        }
    };

    //#endregion load data
    $scope.TimeKeeping.btnExport.OnClick = function () {

        if ($scope.TimeKeeping.Lst.length == 0) {
            jAlert.Warning('Không có dữ liệu để xuất');
            return;
        }
        TimeKeeping_ExportExcel();
    };
    $scope.ShiftOnChange = (item) => { 
        if (item.CheckOutTime || item.ConfirmTimeEnd) {
            formatTimeEnd(item); 
        }
        else {
            let objShift = $scope.SalaryShift.Lst.filter((item) => {
                return item.ShiftID == item.ShiftID
            })[0];
            item.HourEnd = objShift.HourEnd.toString();
            item.MinuteEnd = objShift.MinuteEnd.toString();
        }
    }
}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "ApiHelper", "UtilFactory", "DataFactory", "$q", "CommonFactory"];
addController("IndexController", IndexController);
