var sumPropFromList = function () {
    return function (input, property) {
        if (!input || input.length == 0)
            return 0;
        var i = input.length;
        var total = 0;
        while (i--)
            total += input[i][property] == undefined ? 0 : input[i][property];
        return total;
    };
};
addFilter("sumPropFromList", sumPropFromList);
var OrderManagerController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $window) {
    $scope.Permission = {};
    //#region declare variable
    $scope.OSFO = {
        Pager: { TotalItems: 0, PageSize: 10, CurrentPage: 1 },
        Lst: [],
        btnSearch: {}
    };
    $scope.FormSearch = {
        CreatedUser: '',
        CustomerPhone: '',
        ConfirmedUser: '',
        Phone: '',
        OutputFastTypeID: -1,
        IsShow: true,
        PopupType: 1 //1: NV tạo, 2: NV xác nhận
    };
    //#endregion

    $scope.BrandUser = { CallBack: {} };
    $scope.BrandUser.Lst = [];
    $scope.BrandUser.Core = {
        Text: 'ProductBrandName',
        IDValue: 'BrandID',
        IsHideValueDefault: true
    };
    $scope.BrandUser.CallBack.OnValuechanged = (x) => {
        $scope.OSFO.btnSearch_Onclick();
    };

    //Đặt từ ngày
    $scope.dtmDateFrom = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmDateFrom.Core.DateType = "DateTime";
    $scope.dtmDateFrom.CallBack.OnValuechanged = (x) => {
        $scope.FormSearch.DateFrom = null;
        if (UtilJS.DateTime.IsValid(x)) {
            $scope.FormSearch.DateFrom = x;
            //let DateCurrent = moment(x)._d;
            //DateCurrent.setHours(23, 59, 59, 59);
            ////chỉnh tăng
            //if (DateCurrent > new Date($scope.dtmDateTo.Value)) {
            //    $scope.dtmDateTo.API.SetValue(DateCurrent);
            //}
            ////TH chỉnh giảm
            //DateCurrent.setMonth(DateCurrent.getMonth() + 1);
            //if (DateCurrent < new Date($scope.dtmDateTo.Value)) {
            //    $scope.dtmDateTo.API.SetValue(DateCurrent);
            //}
        }
    };

    $scope.dtmDateTo = { Core: {}, CallBack: {}, API: {} };
    $scope.dtmDateTo.Core.DateType = "DateTime";
    $scope.dtmDateTo.CallBack.OnValuechanged = (x) => {
        $scope.FormSearch.DateTo = null;
        if (x) {
            $scope.FormSearch.DateTo = x;
            //let DateCurrent = moment(x)._d;
            //DateCurrent.setHours(0, 0, 0, 0);
            ////chỉnh tăng
            //if (DateCurrent < new Date($scope.dtmDateFrom.Value)) {
            //    $scope.dtmDateFrom.API.SetValue(DateCurrent);
            //}
            ////TH chỉnh giảm
            //DateCurrent.setMonth(DateCurrent.getMonth() - 1);
            //if (DateCurrent > new Date($scope.dtmDateFrom.Value)) {
            //    $scope.dtmDateFrom.API.SetValue(DateCurrent);
            //}
        }
    };

    function monthDiff(fromDate, toDate) {
        var months;
        months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
        months -= fromDate.getMonth();
        months += toDate.getMonth();
        if (toDate.getDate() > fromDate.getDate()) {
            months++;
        }

        return months <= 0 ? 0 : months;
    }
    //#endregion

    let objReq = {};
    $scope.OSFO.btnSearch_Onclick = function () {
        if (!$scope.FormSearch.DateFrom || !$scope.FormSearch.DateTo) {
            jAlert.Warning('Vui lòng chọn thời gian tìm kiếm');
            return false;
        }

        let dateFrom = moment($scope.FormSearch.DateFrom)._d;
        let dateTo = moment($scope.FormSearch.DateTo)._d;

        let ressult = monthDiff(
            dateFrom,  // February 1st, 2010
            dateTo  // March 12th, 2010
        );

        if (ressult > 1) {
            jAlert.Warning('Vui lòng tìm kiếm trong 1 tháng');
            return false;
        }

        $scope.GetStatisticOrderStatusByUser();
    };
    $scope.GetStatisticOrderStatusByUser = function () {
        if (!$scope.FormSearch.DateFrom || !$scope.FormSearch.DateTo) {
            jAlert.Warning('Vui lòng chọn thời gian tìm kiếm');
            return false;
        }
        objReq.CreatedDateFrom = $scope.FormSearch.DateFrom;
        objReq.CreatedDateTo = $scope.FormSearch.DateTo;
        objReq.BrandID = $scope.BrandUser.Value;
        UtilJS.Loading.Show();
        CommonFactory.PostDataAjax("/CustomerTransactions/StatisticByStatus", objReq,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.OSFO.Pager.TotalItems = 0;
                    $scope.OSFO.Lst = [];
                    $scope.DrawChart($scope.OSFO.Lst, 'containerChart', 'PartnerStatusName', 'Total', 'Trạng thái đơn hàng');
                    $scope.OSFO.Lst2 = [];
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        //jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        //jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.OSFO.LstFull = response.objCodeStep.Data || [];
                        $scope.OSFO.Lst = [];
                        $scope.OSFO.Lst2 = [];
                        $scope.OSFO.Lst3 = [];

                        let objOverFail = {};
                        objOverFail.Total = 0;
                        objOverFail.TotalAmount = 0;

                        $scope.OSFO.LstFull.forEach((item) => {
                            if (item.PartnerStatusName) {
                                item.PartnerStatusName = item.PartnerStatusName.ctmCapitalize();
                            }
                            if (item.Total > 0) {
                                $scope.OSFO.Lst.push(item);
                            }
                            if (item.DeliveryStatusID == 5) {
                                $scope.OSFO.Lst2.push(item);
                            }
                            if (item.DeliveryStatusID == 6 || item.DeliveryStatusID == 7) {
                                objOverFail.Total += item.Total;
                                objOverFail.TotalAmount += item.TotalAmount;
                                $scope.OSFO.Lst3.push(item);
                            }
                        });
                        if ($scope.OSFO.Lst3.length > 0) {
                            let partnerStatusName = $scope.OSFO.Lst3.map(function (elem) {
                                return elem.PartnerStatusName;
                            }).join(", ");
                            objOverFail.PartnerStatusName = `Fail (${partnerStatusName})`;
                            $scope.OSFO.Lst2.push(objOverFail);
                        }
                        $scope.DrawChart($scope.OSFO.Lst, 'containerChart', 'PartnerStatusName', 'Total', 'Trạng thái đơn hàng');
                    }
                });
            },
            function (error) {
                $scope.OSFO.Lst = [];
                $scope.OSFO.Lst2 = [];
                $scope.DrawChart($scope.OSFO.Lst, 'containerChart', 'OutputFastStatusName', 'Total', 'Trạng thái đơn hàng');
                UtilJS.Loading.Hide();
            }
        );
    };

    $scope.OSFO.btnExportExcel = {};
    $scope.OSFO.btnExportExcel_Onclick = function () {
        if ($scope.OSFO.Lst.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }
        UtilJS.Files.Download({
            url: "/CustomerTransactions/ExportExcelStatisticByStatus",
            data: { Reqs: objReq },
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
        wait: UtilFactory.WaitingLoadDirective([
            $scope.dtmDateFrom,
            $scope.dtmDateTo,
            $scope.BrandUser
        ])
    }).then((Multiples) => {
        let today = new Date();
        today.setHours(23, 59, 0, 0);

        let subday = new Date();
        //subday.setDate(subday.getDate() - 60);
        subday.setHours(0, 0, 0, 0);
        $scope.dtmDateFrom.API.SetValue(subday);
        $scope.dtmDateTo.API.SetValue(today);

        $scope.BrandUser.Lst = DataSetting.BrandUser;
        let brandID = $scope.BrandUser.Lst[0].BrandID;
        $scope.BrandUser.API.SetValue(brandID);
        //$scope.OSFO.btnSearch_Onclick();

        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });
    $scope.DrawChart = function (data, containerChartID, text, valueSum, title) {

        //data = $scope.OSFO.Lst;
        let categories = data.map(x => x[text]);
        let Total = data.map(x => x[valueSum]);
        let series = [];
        categories.forEach((value, key) => {
            let itemSeries = {};
            itemSeries.name = value;
            itemSeries.y = Total[key];
            series.push(itemSeries);
        });
        //'containerChart'
        Highcharts.chart(containerChartID, {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            lang: {
                decimalPoint: ',',
                thousandsSep: '.'
            },
            title: {
                text: title //'Thống kê đơn hàng theo trạng thái'
            },
            tooltip: {
                formatter: function () {
                    return this.point.name + ': <b>' + Highcharts.numberFormat(this.point.y, 0, ',', '.') + '</b>';
                },
                shared: true
            },
            subtitle: {
                text: ''
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    colors: $rootScope.Colors,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            let percent = Math.round(this.percentage * 100) / 100;
                            let color = this.point.name == 'Others' ? 'rgb(166, 166, 166)' : this.point.color;
                            return '<span style="color:' + color + '">' + this.point.name + ': </span> <span style="color:' + color + '">' + percent + '%</span>';
                        },
                    },
                    //showInLegend: true
                }
            },
            series: [{
                name: 'Brands',
                data: series
            }],
            colors: [
                '#d83375',
                '#1abc9c',
                '#3498db',
                '#9b59b6',
                '#e67e22',
                '#e74c3c',
                '#7f8c8d'
            ],
        });
    };
};

OrderManagerController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$window"];
addController("OrderManagerController", OrderManagerController);