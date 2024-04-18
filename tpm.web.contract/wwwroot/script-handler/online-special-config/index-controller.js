var IndexController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $localstorage) {
    $scope.UpdateMode = false;
    $scope.myroot = {};
    $scope.myroot.Permission = {
        isUpdate: $rootScope.UserPricinpal.IsInRole("OnlineSpecialConfig.Create")
    };




    $scope.OSL = {
        btnSearch: {},
        btnAdd: {},
        btnExportExcel: {}
    }
    $scope.OSL.FormSearch = { txtSearch: { Text: '' } };

    $scope.OSL.Lst = [];
    $scope.OSL.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };

    $scope.objOSL = {};

    //#region select2
    $scope.Stores = { Core: {}, CallBack: {} };
    $scope.Stores.Core.Text = 'StoreName';
    $scope.Stores.Core.IDValue = 'StoreID';
    //#endregion


    //#region search
    $scope.OSL.btnSearch.OnClick = function () {
        //if (!$scope.OSL.FormSearch.txtSearch.Text) {
        //    jAlert.Warning('Vui lòng nhập chuỗi tìm kiếm');
        //    return false;
        //}
        $scope.OSL.Search();
    };
    $scope.OSL.Search = function (intPage) {
        intPage = !intPage ? 1 : intPage;
        UtilJS.Loading.Show();
        var dataSend = {
            KeySearch: $scope.OSL.FormSearch.txtSearch.Text,
            PageIndex: intPage,
            PageSize: $scope.OSL.Pager.PageSize
        };
        CommonFactory.PostDataAjax("/OnlineSpecialConfigs/Search", dataSend,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.OSL.Lst = [];
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        UtilJS.Loading.Hide();
                        $scope.OSL.Lst = response.objCodeStep.Data.Records || [];
                        $scope.OSL.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        $scope.OSL.Pager.CurrentPage = intPage;
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );

    };
    //#endregion
    //#region ReadByID
    $scope.OSL.ReadByID = function (ID) {
        UtilJS.Loading.Show();
        CommonFactory.PostDataAjax("/OnlineSpecialConfigs/ReadByID?ID=" + ID, null,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.objOSL = response.objCodeStep.Data;
                        $scope.Stores.API.SetValue($scope.objOSL.StoreID);

                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );

    };
    //#endregion

    //#region Create
    $scope.Create = function () {
        $scope.UpdateMode = false;
        $scope.objOSL = { IsSpecial: true };
        $scope.Stores.Core.IsDisabled = false;
        $scope.Stores.API.SetValue("");
        customValidate.Reset('OSLForm');
        $('#OSLModal').modal('show');
    };
    //#endregion

    //#region Update
    $scope.Edit = function (id) {
        UtilJS.Loading.Show();
        $scope.UpdateMode = true;
        customValidate.Reset('OSLForm');
        $scope.Stores.Core.IsDisabled = true;
        $scope.OSL.ReadByID(id);
        $('#OSLModal').modal('show');
        UtilJS.Loading.Hide();
    }

    //#region Save
    $scope.Save = function () {
        if (!$('#OSLForm').valid()) {
            return false;
        }
        if ($scope.OSLForm.$valid) {
            if (!$scope.UpdateMode) {
                UtilJS.Loading.Show();
                let dataSend = {
                    StoreID: $scope.Stores.Value,
                    StoreName: $scope.Stores.Lst.filter(c => c.StoreID == $scope.Stores.Value).map(x=> x.StoreName)[0],
                    IsSpecial: $scope.objOSL.IsSpecial
                };
                CommonFactory.PostDataAjax("/OnlineSpecialConfigs/Create", dataSend,
                    function (beforeSend) { },
                    function (response) {
                        $timeout(function () {
                            UtilJS.Loading.Hide();
                            if (response.objCodeStep.Status == jAlert.Status.Error) {
                                jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                            }
                            else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                                jAlert.Warning('Cửa hàng ' + dataSend.StoreName + ' đã tồn tại trên lưới. Vui lòng cập nhật lại', 'Thông báo');
                            }
                            else if (response.objCodeStep.Status == jAlert.Status.Success) {
                                UtilJS.Loading.Hide();
                                jAlert.Success(response.objCodeStep.Message);
                                $('#OSLModal').modal('hide');
                                $scope.OSL.btnSearch.OnClick();
                            }
                        });
                    },
                    function (error) {
                        UtilJS.Loading.Hide();
                    }
                );
            }
            else {
                UtilJS.Loading.Show();
                CommonFactory.PostDataAjax("/OnlineSpecialConfigs/Update", $scope.objOSL,
                    function (beforeSend) { },
                    function (response) {
                        $timeout(function () {
                            UtilJS.Loading.Hide();
                            if (response.objCodeStep.Status == jAlert.Status.Error) {
                                $('#OSLModal').modal('hide');
                                jAlert.Success('Cập nhật thành công');
                            }
                            else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                                $('#OSLModal').modal('hide');
                                jAlert.Success('Cập nhật thành công');
                            }
                            else if (response.objCodeStep.Status == jAlert.Status.Success) {
                                UtilJS.Loading.Hide();
                                jAlert.Success(response.objCodeStep.Message);
                                $('#OSLModal').modal('hide');
                                $scope.OSL.btnSearch.OnClick();
                            }
                        });
                    },
                    function (error) {
                        UtilJS.Loading.Hide();
                    }
                );
            }
        }
    };

    //#endregion


    //#region Export excel
    $scope.OSL.btnExportExcel.OnClick = function () {
        var dataSend = {
            KeySearch: $scope.OSL.FormSearch.txtSearch.Text
        };
        UtilJS.Files.Download({
            url: "/OnlineSpecialConfigs/ExportExcel",
            data: { Reqs: dataSend },
            beforsend: function () {
                $timeout(function () { UtilJS.Loading.Show(); });
            },
            callback: function (result) {
                $timeout(function () { UtilJS.Loading.Hide(); });
                if (result == undefined) return;
                if (result.objCodeStep.Status != jAlert.Status.Success) {
                    jAlert.Warning("Không có dữ liệu để xuất");
                    return;
                }
            }
        });
    };
    //#endregion

    UtilJS.Loading.Show();
    UtilFactory.WaitingLoadDirective(
        [
        ]).then(() => {
            $q.all({
                Stores: DataFactory.Stores_Get()
            }).then((MultipleRes) => {
                $scope.Stores.Lst = MultipleRes.Stores.Data;
            });
            UtilJS.Loading.Hide();
        }).catch((response) => {
            UtilJS.Loading.Hide();
            throw response;
        });
    $(function () {
        customValidate.SetForm('OSLForm', '');
    });

}
IndexController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$localstorage"];
addController("IndexController", IndexController);
