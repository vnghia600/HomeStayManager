var IndexController = function ($scope, $timeout,UtilFactory, $q) {
    $scope.Permission = {};

    $scope.dtmDateFrom = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmDateFrom.Core.DateType = "Date";
    $scope.dtmDateFrom.CallBack.OnValuechanged = (x) => {
        if (UtilJS.DateTime.IsValid(x)) {
            $timeout(() => {
                let DateCurrent = moment(x)._d;
                //DateCurrent.setHours(23, 59, 59, 59, 0);
                //chỉnh tăng
                if (DateCurrent > new Date($scope.dtmDateTo.Value)) {
                    $scope.dtmDateTo.API.SetValue(DateCurrent);
                }
                //TH chỉnh giảm
                DateCurrent.setDate(DateCurrent.getDate() + DataSetting.LimitDayReportData);
                if (DateCurrent < new Date($scope.dtmDateTo.Value)) {
                    $scope.dtmDateTo.API.SetValue(DateCurrent);
                }
            });
        }
    };

    $scope.dtmDateTo = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmDateTo.Core.DateType = "Date";
    $scope.dtmDateTo.CallBack.OnValuechanged = (x) => {
        if (x) {
            $timeout(() => {
                let DateCurrent = moment(x)._d;
                //DateCurrent.setHours(0, 0, 0, 0);
                //chỉnh tăng
                if (DateCurrent < new Date($scope.dtmDateFrom.Value)) {
                    $scope.dtmDateFrom.API.SetValue(DateCurrent);
                }
                //TH chỉnh giảm
                DateCurrent.setDate(DateCurrent.getDate() - DataSetting.LimitDayReportData);
                if (DateCurrent > new Date($scope.dtmDateFrom.Value)) {
                    $scope.dtmDateFrom.API.SetValue(DateCurrent);
                }
            });
        }
    };

    $scope.btnExportExcel_OnClick = function () {
        if (!$scope.dtmDateFrom.Value || !$scope.dtmDateTo.Value) {
            jAlert.Warning('Vui lòng chọn thời gian');
            return false;
        }
        let objReq = {};
        objReq.DateFrom = $scope.dtmDateFrom.Value;
        objReq.DateTo = $scope.dtmDateTo.Value;
        let url = "/Reports/SearchLastMileDelivery";
        UtilJS.Files.Download({
            url: url,
            data: objReq,
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

    UtilJS.Loading.Show();
    $q.all({
        x: UtilFactory.WaitingLoadDirective([
            $scope.dtmDateFrom,
            $scope.dtmDateTo,
        ])
    }).then((m) => {
        
        let dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 7);
        $scope.dtmDateFrom.API.SetValue(dateFrom);

        let dateTo = new Date();
        $scope.dtmDateTo.API.SetValue(dateTo);

        $timeout(() => { UtilJS.Loading.Hide(); }, 0);
    });
};
IndexController.$inject = ["$scope", "$timeout", "UtilFactory", "$q"];
addController("IndexController", IndexController);
