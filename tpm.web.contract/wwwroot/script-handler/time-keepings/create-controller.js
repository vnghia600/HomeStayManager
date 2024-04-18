var CreateController = ($scope, $rootScope, $timeout, $filter, ApiHelper, UtilFactory, DataFactory, $q, CommonFactory) => {

    //#region declare variable
    $rootScope.Permission = {};
    $rootScope.Permission.isExportExcel = $rootScope.UserPricinpal.IsInRole("TimeKeeping.ExportOnline");

    $scope.TimeKeeping = {
        btnCreate: {}
    };
    $scope.TimeKeeping.Lst = [];
    $scope.TimeKeeping.Lst30DateWorking = [];
    $scope.objTimeKeeping = { ShiftID: '-1', CheckInTime: moment(new Date()).format('HH:mm') };

    $scope.SalaryShift = {};

    var fromDate, toDate;
    $scope.dtmFromDate = { Core: {}, CallBack: {} };
    $scope.dtmFromDate.Core.DateType = "Date";
    $scope.dtmFromDate.CallBack.OnValuechanged = (x) => {
        let DueDate = x;
        if (!UtilJS.DateTime.IsValid(x)) {
            DueDate = null;
        }
        fromDate = moment(DueDate).format('MM/DD/YYYY 00:00:00');
    };
    $scope.dtmToDate = { Core: {}, CallBack: {} };
    $scope.dtmToDate.Core.DateType = "Date";
    $scope.dtmToDate.CallBack.OnValuechanged = (x) => {
        let DueDate = x;
        if (!UtilJS.DateTime.IsValid(x)) {
            DueDate = null;
        }
        toDate = moment(DueDate).format('MM/DD/YYYY 23:59:59');
    };



    //#endregion

    //#region function CRUD
    var Create = function () {
        var obj = {};
        obj.ShiftID = $scope.objTimeKeeping.ShiftID;
        obj.StoreID = $rootScope.UserPricinpal.StoreID;
        obj.PositionID = $scope.objUser.PositionID;

        let strApiEndPoint = "/TimeKeepings/Create";
        UtilJS.Loading.Show();

        CommonFactory.PostMethod(strApiEndPoint, obj)
            .then((response) => {
                var objSalaryShift = _.find($scope.SalaryShift.Lst, function (Shift) {
                    return Shift.ShiftID == $scope.objTimeKeeping.ShiftID;
                });
                obj.ShiftName = objSalaryShift.ShiftName;
                obj.CheckInTime = moment(new Date()).format('HH:mm');
                obj.CheckInTimeFormat = moment(new Date()).format('DD/MM/YYYY');
                obj.CheckOutTime = null;
                $scope.TimeKeeping.Lst.push(obj);
                genListTimeKeeping();
                jAlert.Success('Chấm công thành công');
                UtilJS.Loading.Hide();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    }; 

    $scope.TimeKeeping.btnCreate.OnClick = () => {
        if (!$('#PnTimeKeepingForm').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        let IsCheckInTime = _.find($scope.TimeKeeping.Lst, (item) => {
            let strDateCheckin = moment(item.TimeKeeping).format('DD/MM/YYYY') + `_${item.ShiftID}`;
            let strDateNow = moment(new Date()).format('DD/MM/YYYY') + `_${$scope.objTimeKeeping.ShiftID}`;
            return strDateCheckin == strDateNow;
        });
        if (IsCheckInTime) {
            jAlert.Warning('Đã chấm công hôm nay');
            return false;
        }
        Create();
    };
    $scope.TimeKeeping.btnCreateOut_OnClick = () => {
        if (!$('#PnTimeKeepingForm').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }

        let IsCheckInTime = _.find($scope.TimeKeeping.Lst, (item) => {
            let strDateCheckin = moment(item.TimeKeeping).format('DD/MM/YYYY') + `_${item.ShiftID}`;
            let strDateNow = moment(new Date()).format('DD/MM/YYYY') + `_${$scope.objTimeKeeping.ShiftID}`;
            return strDateCheckin == strDateNow;
        });
        if (!IsCheckInTime) {
            jAlert.Warning('Bạn chưa chấm công vào hôm nay');
            return false;
        }

        //let IsCheckOutTime = _.find($scope.TimeKeeping.Lst, (item) => {
        //    let strDateCheckin = moment(item.TimeKeeping).format('DD/MM/YYYY') + `_${item.ShiftID}`;
        //    let strDateNow = moment(new Date()).format('DD/MM/YYYY') + `_${$scope.objTimeKeeping.ShiftID}`;
        //    return strDateCheckin == strDateNow && item.CheckOutTime;
        //});
        //if (IsCheckOutTime) {
        //    jAlert.Warning('Đã chấm công ra hôm nay');
        //    return false;
        //}
          
        var obj = {};
        obj.ShiftID = $scope.objTimeKeeping.ShiftID;
        obj.StoreID = $rootScope.UserPricinpal.StoreID;
        obj.PositionID = $scope.objUser.PositionID;

        let strApiEndPoint = "/TimeKeepings/CheckOut";
        UtilJS.Loading.Show(); 
        CommonFactory.PostMethod(strApiEndPoint, obj)
            .then((response) => {
                let dtmNow = moment(new Date()).format('DD/MM/YYYY');
                var objSalaryShift = _.find($scope.TimeKeeping.Lst, function (Shift) {
                    return Shift.ShiftID == $scope.objTimeKeeping.ShiftID && Shift.CheckInTimeFormat == dtmNow;
                }); 
                objSalaryShift.CheckOutTime = moment(new Date()).format('HH:mm');  
                genListTimeKeeping();
                jAlert.Success('Chấm công thành công');
                UtilJS.Loading.Hide();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
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
                $scope.SalaryShift.Lst = [];
                defer.reject(response);
            });
        return defer.promise;
    };

    //#region gen data

    var days = new Array("Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy");
    function genListTimeKeeping() {
        $scope.GetList30DateWorking = function () {

            var listDate = [];
            let BeginDate = new Date();
            BeginDate.setMonth(BeginDate.getMonth() - 1);
            //BeginDate.setHours(0, 0, 0, 0);

            let EnDate = new Date();
            EnDate.setHours(23, 59, 59);

            while (BeginDate < EnDate) {
                var strDate = BeginDate.toISOString().slice(0, 10);
                listDate.push(strDate);
                BeginDate.setDate(BeginDate.getDate() + 1);
            };
            //console.log(listDate);
            return listDate;
        };
        var List30DateWorking = $scope.GetList30DateWorking();
        $scope.TimeKeeping.Lst30DateWorking = [];
        for (var i = (List30DateWorking.length - 1); i > 0; i--) {
            let strdate = List30DateWorking[i];
            let date = new Date(strdate);
            let obj = {};
            obj.Day = date.getDay();
            obj.strDay = days[date.getDay()];
            obj.Date = date;
            obj.strDate = moment(date).format('DD/MM/YYYY');
            $scope.TimeKeeping.Lst30DateWorking.push(obj);
        }
        $scope.TimeKeeping.Lst30DateWorking.forEach(function (itemAutoGen) {
            //value Default
            itemAutoGen.WorkingTime = 0;
            itemAutoGen.Shifts = [];

            let strDateAutoGen = moment(itemAutoGen.Date).format('DD/MM/YYYY');
            $scope.TimeKeeping.Lst.forEach(function (item) {
                let strDateCheckin = item.CheckInTimeFormat;//moment(item.TimeKeeping).format('DD/MM/YYYY');
                if (strDateAutoGen === strDateCheckin) {
                    let shift = {};
                    shift.ShiftName = item.ShiftName;
                    shift.CheckInTime = item.CheckInTime.substr(0, 5); 
                    shift.IsConfirm = item.IsConfirm; 
                    shift.CheckInHtml = `${shift.ShiftName} / ${shift.CheckInTime}`;
                     
                    shift.CheckOutTime = item.CheckOutTime;
                    if (shift.CheckOutTime) {
                        shift.CheckOutTime = item.CheckOutTime.substr(0, 5); 
                        shift.CheckInHtml += ` - <span style="color:red;">${shift.CheckOutTime}</span>`;
                    } 
                    shift.IsConfirmStr = "Chưa xác nhận";
                    shift.IsConfirmClass = "";
                    if (shift.IsConfirm) {
                        if (shift.IsConfirm === true) {
                            shift.IsConfirmStr = "Duyệt";
                            shift.IsConfirmClass = "text-success"; 
                        }
                        else {
                            shift.IsConfirmStr = "Không duyệt"; 
                            shift.IsConfirmClass = "text-danger"; 
                        }
                    }


                    if (item.ConfirmTimeStart != null) {
                        shift.WorkingTime = calculateTime(item);
                    }
                    shift.ConfirmNote = item.ConfirmNote;


                    //them de ve ra tren giao dien
                    shift.Day = item.Day;
                    shift.index = itemAutoGen.Shifts.length;
                    shift.WorkingTime = shift.WorkingTime; 
                    shift.strDay = item.strDay; 
                    shift.strDate = item.strDate; 

                    itemAutoGen.Shifts.push(shift);
                }
            });
        });
    }

    function calculateTime(item) { 
        //Giờ công thực:
        //ShiftID = 3: Đổi ra số giờ(17h30 – ConfirmTimeStart) – 1
        //ShiftID = 4: Đổi ra số giờ (15h30 – ConfirmTimeStart)
        //ShiftID = 5: Đổi ra số giờ (22h – ConfirmTimeStart)

        //let strhh_ss = item.ConfirmTimeStart.substr(0, 5);

        //let strTime = '17:30';
        //if (item.ShiftID == 4)
        //    strTime = '15:30';
        //else if (item.ShiftID == 5)
        //    strTime = '22:00';

        //var timeStart = new Date(moment(new Date()).format('MM/DD/YYYY ') + strhh_ss).getHours();
        //var timeEnd = new Date(moment(new Date()).format('MM/DD/YYYY ') + strTime).getHours();
        //var hourDiff = timeEnd - timeStart;
        //if (item.ShiftID == 3)
        //    hourDiff = hourDiff - 1;
        //if (hourDiff < 0)
        //    hourDiff = 0;
        //return hourDiff;

        //// công thức mới
        let TimeReal = 0;
        let TimeStandard = 0;

        let DateNow = new Date(moment(item.TimeKeeping).format('MM/DD/YYYY '));

        let DateEnd = DateNow;
        DateEnd.setHours(item.HourEnd);
        DateEnd.setMinutes(item.MinuteEnd);
        DateEnd.setSeconds(0);

        let DateStart = new Date(moment(item.TimeKeeping).format('MM/DD/YYYY '));
        DateStart.setHours(item.HourStart);
        DateStart.setMinutes(item.MinuteStart);
        DateStart.setSeconds(0);

        //Giờ công thực
        if (item.ConfirmTimeStart) {

            let ConfirmDateStart = new Date(moment(DateNow).format('MM/DD/YYYY ') + item.ConfirmTimeStart);
            let IntermissionDateStart = new Date(moment(item.TimeKeeping).format('MM/DD/YYYY '));

            IntermissionDateStart.setHours(item.IntermissionHourStart);
            IntermissionDateStart.setMinutes(item.IntermissionMinuteStart);
            IntermissionDateStart.setSeconds(0);
            var hours = Math.abs(DateEnd - ConfirmDateStart) / 36e5;
            if (item.ShiftID == 3 || item.ShiftID == 4 || item.ShiftID == 7) {
                //Nếu ConfirmTimeStart < [IntermissionHourStart] [IntermissionMinuteStart]:
                if (ConfirmDateStart < IntermissionDateStart) {
                    //Giờ công thực  = (([HourEnd][MinuteEnd] – ConfirmTimeStart) – [IntermissionTime]/60)
                    TimeReal = hours - parseFloat(item.IntermissionTime / 60);
                }
                //Ngược lại nếu [IntermissionHourStart] [IntermissionMinuteStart] < ConfirmTimeStart <=[IntermissionHourStart] [IntermissionMinuteStart] + [IntermissionTime]
                else if (IntermissionDateStart.getHours() > ConfirmDateStart.getHours() && ConfirmDateStart.getHours() <= ((IntermissionDateStart.getHours() + (item.IntermissionTime / 60)))) {
                    //Giờ công thực  =  ([HourEnd][MinuteEnd] - [IntermissionHourStart] [IntermissionMinuteStart] + [IntermissionTime])
                    TimeReal = hours + parseFloat(IntermissionTime / 60);
                }
                else {
                    //Giờ công thực  =  [HourEnd][MinuteEnd] -ConfirmTimeStart 
                    TimeReal = hours;
                }
            }
            else if (item.ShiftID == 8) {
                //Giờ công thực  =  [HourEnd][MinuteEnd]-ConfirmTimeStart 
                TimeReal = hours;
            }
            else if (item.ShiftID == 5) {
                //Giờ công thực  =  [HourEnd][MinuteEnd]-ConfirmTimeStart 
                TimeReal = hours;
            }
        }
        ////Tính Giờ công chuẩn:
        //ShiftID = 3: Giờ công chuẩn = ([HourEnd][MinuteEnd] – [HourStart][MinuteStart]) – [IntermissionTime]/60
        var hours = Math.abs(DateEnd - DateStart) / 36e5;
        if (item.ShiftID == 3 || item.ShiftID == 4 || item.ShiftID == 7) {
            TimeStandard = hours - (item.IntermissionTime / 60);
        } else
            //ShiftID = 4: Giờ công chuẩn = ([HourEnd][MinuteEnd] – [HourStart][MinuteStart]) 
            if (item.ShiftID == 8) {
                TimeStandard = hours;
            }
            else
                //ShiftID = 5: Giờ công chuẩn = ([HourEnd][MinuteEnd] – [HourStart][MinuteStart])
                if (item.ShiftID == 5) {
                    TimeStandard = hours;
                }
        if (TimeReal < 0)
            TimeReal = 0;
        if (TimeStandard < 0)
            TimeStandard = 0;
        if (!Number.isInteger(TimeReal)) {
            TimeReal = TimeReal.toFixed(1);
        }
        return TimeReal + ' / ' + TimeStandard;
    }
    //#endregiongen data

    var TimeKeeping_ReadByUser = () => {
        let defer = $q.defer();
        let strApiEndPoint = "/TimeKeepings/ReadByUserID";
        CommonFactory.PostMethod(strApiEndPoint)
            .then((response) => {
                $scope.TimeKeeping.Lst = response.Data.filter((x) => {
                    x.CheckInTimeFormat = moment(x.TimeKeeping).format('DD/MM/YYYY');
                    if (x.CheckInTime) {
                        x.CheckInTime = moment(x.CheckInTime).format('HH:mm');
                    }
                    if (x.CheckOutTime) {
                        x.CheckOutTime = moment(x.CheckOutTime).format('HH:mm');
                        if (x.CheckOutTime == "00:00") {
                            x.CheckOutTime = null;
                        }
                    }
                    if (x.ConfirmTimeStart) {
                        x.ConfirmTimeStart = moment(x.ConfirmTimeStart).format('HH:mm');
                    }
                    return x;
                });
                genListTimeKeeping();
                defer.resolve(response);
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                defer.reject(response);
            });
        return defer.promise;
    };

    var Users_ReadByID = () => {
        let defer = $q.defer();
        let strApiEndPoint = "/TimeKeepings/ReadByUser";
        CommonFactory.PostMethod(strApiEndPoint)
            .then((response) => {
                $scope.objUser = response.Data;
                defer.resolve(response);
            })
            .catch((response) => {
                if (response.StatusCode == 204) {
                    $timeout(() => {
                        window.location.href = "/Error/NotFound";
                    }, 1000);
                    return;
                }
                jAlert.Notify(response.objCodeStep);
                defer.reject(response);
            });
        return defer.promise;
    };


    //$scope.btnExportExcel_Onclick = function () {
    //    var lst = [];
    //    $scope.TimeKeeping.Lst30DateWorking.filter((x) => {
    //        x.Shifts.filter((s) => {
    //            let obj = {};
    //            obj.strDay = x.strDay;
    //            obj.strDate = x.strDate;
    //            obj.CheckInTime = `${s.ShiftName} / ${s.CheckInTime}`; 
    //            lst.push(obj);
    //        }); 
    //    });
    //    var url = '/TimeKeepings/TimeKeepingExportExcel';
    //    let objReq = { DataResult : lst }; 
    //    UtilJS.Files.Download({
    //        url: url,
    //        data: objReq,
    //        beforsend: function () {
    //            $timeout(function () { UtilJS.Loading.Show(); });
    //        },
    //        callback: function (result) {
    //            $timeout(function () { UtilJS.Loading.Hide(); });
    //            if (result == undefined) return;
    //            if (result.objCodeStep.Status != jAlert.Status.Success) {
    //                jAlert.Notify(result.objCodeStep);
    //                return;
    //            }
    //        }
    //    });
    //};
    $scope.btnExportExcel_Onclick = function () {
        if (!fromDate || !toDate) {
            jAlert.Warning('Chọn khoảng thời gian tìm kiếm');
            return false;
        }

        var url = '/TimeKeepings/ExportAll';
        let objReq = {};
        objReq.FromDate = fromDate;
        objReq.ToDate = toDate;

        UtilJS.Files.Download({
            url: url,
            data: { objReq: objReq },
            //data: objReq,
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
    $scope.btnExportExcelShow_Onclick = function () {
        $("#exportExcelModal").modal('show');
    };
     
    //#endregion

    UtilJS.Loading.Show();
    $q.all({
        r1: SalaryShift_Get(),
        r2: TimeKeeping_ReadByUser(),
        r3: Users_ReadByID(),
        r4: UtilFactory.WaitingLoadDirective([$scope.dtmFromDate, $scope.dtmToDate])
    }).then((Multiples) => {
        UtilJS.Loading.Hide();

        let date7 = new Date();
        date7.setHours(23, 59, 0, 0);

        let today = new Date();
        today.setDate(today.getDate() - 30);
        today.setHours(0, 0, 0, 0);

        $scope.dtmFromDate.API.SetValue(today);
        $scope.dtmToDate.API.SetValue(date7);
    });
    $(function () {
        customValidate.SetForm('PnTimeKeepingForm', '');
    });
}
CreateController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "ApiHelper", "UtilFactory", "DataFactory", "$q", "CommonFactory"];
addController("CreateController", CreateController);
