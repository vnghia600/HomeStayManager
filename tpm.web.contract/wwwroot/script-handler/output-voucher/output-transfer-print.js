var PrintController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory) {
    $scope.objData = DataSetting.objOutputTransfer;
    var Lst = _.sortBy(DataSetting.objOutputTransfer.OutputTransferDetails, "PID");

    $scope.TotalFooter = { Quantity: 0, SalePrice: 0, Total: 0 };

    $scope.Forms = [];
    $scope.Forms.RowIndex = 0;

    //>>>Method
    var AddNewForm = function (Lst, IsShowHead, IsShowFooter) {
        let objForm = {};
        objForm.LstRender = [];

        Lst.forEach(function (item) {
            $scope.Forms.RowIndex = $scope.Forms.RowIndex + 1;
            item.RowIndex = $scope.Forms.RowIndex;

            $scope.TotalFooter.Quantity += item.Quantity;
            $scope.TotalFooter.SalePrice += item.SalePriceAfter;
            $scope.TotalFooter.Total += (item.Quantity * item.SalePriceAfter);
        });
        var objGroup = {};
        objGroup.Lst = Lst;
        objForm.LstRender.push(objGroup);

        objForm.IsShowHead = IsShowHead;
        objForm.IsShowFooter = IsShowFooter;
        objForm.IsShowTotalPage = IsShowFooter;
        $scope.Forms.push(objForm);
    };
    //Method<<<

    var RowFirstPage = 1;
    var RowPageSize = 20;
    var TotalRowCount = Lst.length;
    do {
        if (RowFirstPage == 1) {
            RowFirstPage = 12;

            AddNewForm($filter('limitTo')(Lst, RowFirstPage), true, TotalRowCount <= 12);
        }
        else {
            let begin = RowFirstPage;
            RowFirstPage = RowFirstPage + RowPageSize;

            if (RowFirstPage < TotalRowCount) {
                AddNewForm($filter('limitTo')(Lst, RowPageSize, begin), false, false);
            }
            else {
                AddNewForm($filter('limitTo')(Lst, TotalRowCount - begin, begin), false, true);
            }
        }
    } while (RowFirstPage < TotalRowCount);
}
PrintController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory"];
addController("PrintController", PrintController);