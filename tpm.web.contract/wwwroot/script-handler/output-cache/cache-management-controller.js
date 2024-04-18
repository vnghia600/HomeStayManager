var CacheManagementController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory) {
    $scope.Page = { IsLoading: false };
    $scope.GridCacheManagement = {};

    $scope.GridCacheManagement = { btnAction: { Text: '', Action: '' }, EditItem: {}, DeleteItem: {}, btnUpdate: {}, btnSearch: {}, btnExportExcel: {} };
    $scope.GridCacheManagement.Lst = [];
    $scope.GridCacheManagement.txtSearch = { Text: '', TextFilter: '' };
    $scope.GridCacheManagement.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.GridCacheManagement.CustomFilter = function (item) {
        if (!UtilJS.String.IsContain(item.OutputCacheKey, $scope.GridCacheManagement.txtSearch.Text) &&
            !UtilJS.String.IsContain(item.OutputCacheKey, $scope.GridCacheManagement.txtSearch.Text) &&
            !UtilJS.String.IsContain(item.OutputCacheKey, $scope.GridCacheManagement.txtSearch.Text)
            ) {
            return false;
        }
        return true;
    }
    $scope.GridCacheManagement.pagination = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        $scope.GridCacheManagement.Pager.CurrentPage = intPage;
    }
    //Event
    $scope.GridCacheManagement.btnSearch.OnClick = function (intPage) {
        $scope.GridCacheManagement.txtSearch.TextFilter = $scope.GridCacheManagement.txtSearch.Text;
        $scope.GridCacheManagement.ddlCriteria.SelectedValueFilter = $scope.GridCacheManagement.ddlCriteria.SelectedValue;
    }
    $scope.GridCacheManagement.DeleteItem.OnClick = function (item) {
        jConfirm('Thông báo', 'Xác nhận xóa cache ?', function (ok) {
            if (ok) {
                var url = '/OutputCaches/Delete';

                var dataSend = {
                    LstOutputCacheKey: [item.OutputCacheKey]
                };
                CommonFactory.PostDataAjax(url, dataSend,
                    function (beforeSend) { },
                    function (response) {
                        if (response.objCodeStep.Status == 'Error') {
                            jAlert.Warning(response.objCodeStep.Message);
                            return;
                        }
                        if (response.objCodeStep.Status == 'Success') {
                            jAlert.Success(response.objCodeStep.Message);
                            $scope.GetListCacheManagement();
                        }
                    },
                    function (error) {
                        jAlert.Error(response.Message);
                    }
                );
            }
        });
    }
    $scope.GridCacheManagement.deleteMultiple = function () {
        jConfirm('Thông báo', 'Xác nhận xóa cache đã chọn?', function (ok) {
            if (ok) {
                var url = '/OutputCaches/Delete';
                var Lstchecked = [];
                $scope.GridCacheManagement.LstOrder.forEach(function (item) {
                    if (item.checked == true) {
                        Lstchecked.push(item.OutputCacheKey);
                    }
                });

                var dataSend = {
                    LstOutputCacheKey: Lstchecked
                };
                CommonFactory.PostDataAjax(url, dataSend,
                    function (beforeSend) { },
                    function (response) {
                        if (response.objCodeStep.Status == 'Error') {
                            jAlert.Warning(response.objCodeStep.Message);
                            return;
                        }
                        if (response.objCodeStep.Status == 'Success') {
                            jAlert.Success(response.objCodeStep.Message);
                            $scope.GetListCacheManagement();
                        }
                    },
                    function (error) {
                        jAlert.Error(response.Message);
                    }
                );
            }
        });
    }
    $scope.isAll = false;
    $scope.$watch("GridCacheManagement.LstOrder", function (n, o) {
        var checked = $filter("filter")(n, { checked: true }) || [];
        if (checked.length) {
            $scope.selected = checked;
            $('#btnDelete').removeAttr('disabled');
        } else {
            $('#btnDelete').attr('disabled', 'disabled');
        }
        $scope.isAllSelected = false;
        if ($scope.GridCacheManagement.Lst.length == checked.length)
            $scope.isAllSelected = true;
    }, true);
    $scope.toggleAll = function () {
        if ($scope.isAll === false) {
            angular.forEach($scope.GridCacheManagement.LstOrder, function (item) {
                item.checked = true;
            });
            $scope.isAll = true;
        } else {
            angular.forEach($scope.GridCacheManagement.LstOrder, function (item) {
                item.checked = false;
            });
            $scope.isAll = false;
        }
    }
    //get all data
    $scope.GetListCacheManagement = function (intPage) {
        $scope.GridCacheManagement.IsLoading = true;
        var url = "/OutputCaches/List";
        CommonFactory.PostDataAjax(url, "",
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    if (response.objCodeStep.Status == 'Error') {
                        jAlert.Warning(response.objCodeStep.Message);
                        $scope.GridCacheManagement.IsLoading = false;
                        return;
                    }
                    if (response.objCodeStep.Status == 'Success') {
                        $scope.GridCacheManagement.Lst = response.LstCacheManagement;
                        $scope.GridCacheManagement.Pager.CurrentPage = 1;
                        $scope.GridCacheManagement.IsLoading = false;
                    }
                }, 500);
            },
            function (error) {
                UtilFactory.Alert.RequestError(error);
                $scope.GridCacheManagement.IsLoading = false;
                return;
            }
        );
    }
    $scope.GetListCacheManagement();
}
CacheManagementController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory"];
addController("CacheManagementController", CacheManagementController);