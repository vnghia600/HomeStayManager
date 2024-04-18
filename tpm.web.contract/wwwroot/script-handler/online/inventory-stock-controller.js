var InventoryStockController = ($scope, $rootScope, $timeout, $filter, ApiHelper, UtilFactory, DataFactory, $q, CommonFactory) => {
    //#region declare variable
    $scope.InventoryStock = {
        btnExportExcel: {},
        btnSearch: {}
    };
    $scope.ProvinceDefault = '50';
    $scope.myroot = {};
    $scope.Store_TreeDataAll = [];
    $scope.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.InventoryStock.Lst = [];
    $scope.InventoryStock.Permission = { IsCreate: true, isDelete: true };
    $scope.InventoryStock.ObjSearch = { TypeID: '-1' };

    $scope.myroot.Permission = {
        isReadCategory: $rootScope.UserPricinpal.IsInRole("UserProductCategory.Read.All"),
        isReadStore: $rootScope.UserPricinpal.IsInRole("UserStore.Read.All"),
        isAdmin: UtilFactory.CheckInRole()
    };

    //#endregion

    //#region Dopdown Store
    $scope.myroot.ddlStore = { IDSelectedTimeOut: false, IsSelectedAll: true, NodeResult: { IDSelected: [] } };
    $scope.myroot.ddlStore.TreeData = [];
    $scope.myroot.ddlStore.core = {
        themes: {
            icons: false
        }
    };
    $scope.myroot.ddlStore.CallBack = {};
    //#endregion

    //#region select2
    //Tỉnh / thành phố
    $scope.Province = { Core: {}, CallBack: {} };
    $scope.Province.InitLst = [];
    $scope.Province.Core.Label = 'Chọn tất cả';
    $scope.Province.Core.Text = 'ProvinceName';
    $scope.Province.Core.IDValue = 'ProvinceID';
    $scope.Province.Core.IsDisabled = false;
    $scope.Province.CallBack.OnValuechanged = (x) => { 
        $scope.District.API.SetValue("");
        if (!x) {
            $scope.District.Lst = [];
            $scope.myroot.ddlStore.TreeData = $scope.Store_TreeDataAll;
        }
        else {
            x = parseInt(x);
            $scope.District.Lst = $scope.District.InitLst.filter(c => c.ProvinceID == x);
            $scope.myroot.ddlStore.TreeData = $scope.Store_TreeDataAll.filter(c => c.ProvinceID == x || c.ProvinceIDs.includes(x));
            //$scope.myroot.ddlStore.TreeData
        }
    };

    //Quận / Huyện
    $scope.District = { Core: {}, CallBack: {} };
    $scope.District.InitLst = [];
    $scope.District.Core.Label = 'Chọn tất cả';
    $scope.District.Core.Text = 'DistrictName';
    $scope.District.Core.IDValue = 'DistrictID';
    $scope.District.Core.IsDisabled = false;
    $scope.District.CallBack.OnValuechanged = (x) => { 
        $timeout(() => { 
            $scope.myroot.ddlStore.API.DeselectAll();
            if (!x) {
                x = parseInt($scope.Province.Value);
                let data = $scope.Store_TreeDataAll;
                if (x) {
                    data = $scope.Store_TreeDataAll.filter(c => c.ProvinceID == x || c.ProvinceIDs.includes(x));
                }
                let ids = _.pluck(data, 'id');
                $scope.myroot.ddlStore.IsFinishRender = true;
                $scope.myroot.ddlStore.API.DataSource(data).then(() => {
                    $scope.myroot.ddlStore.API.OpenAll().then(() => {
                        $scope.myroot.ddlStore.API.SetSelected(ids).then(() => {
                            $scope.myroot.ddlStore.API.CloseAll();
                        });
                    });
                });
            }
            else {
                x = parseInt(x);
                let data = $scope.Store_TreeDataAll.filter(c => c.DistrictID == x || c.DistrictIDs.includes(x));
                let ids = _.pluck(data, 'id');
                $scope.myroot.ddlStore.IsFinishRender = true;
                $scope.myroot.ddlStore.API.DataSource(data).then(() => {
                    $scope.myroot.ddlStore.API.OpenAll().then(() => {
                        $scope.myroot.ddlStore.API.SetSelected(ids).then(() => {
                            $scope.myroot.ddlStore.API.CloseAll();
                        });
                    });
                });
            }
        }); 
    };
    //#endregion

    //#region  search product
    $scope.myroot.SearchProduct = function () {
        if ($scope.myroot.ProductID && $scope.myroot.ProductID.length > 0) {
            UtilJS.Loading.Show();
            var url = "/Online/CheckByProductID";
            CommonFactory.GetDataAjax(url, { ProductID: $scope.myroot.ProductID },
                function (beforeSend) { },
                function (response) {
                    UtilJS.Loading.Hide();
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.myroot.PID = response.objCodeStep.Data.PID;
                        $scope.myroot.ProductName = response.objCodeStep.Data.ProductName;
                        $("#btnSearch").focus();
                    }
                },
                function (error) {
                    $scope.myroot.PID = null;
                    $scope.myroot.ProductName = null;
                    UtilJS.Loading.Hide();
                    return;
                }
            );
            //ApiHelper.GetMethod(strApiEndPoint, {})
            //    .then(function (response) {
            //        $scope.myroot.PID = response.Data.PID;
            //        $scope.myroot.ProductName = response.Data.ProductName;
            //        UtilJS.Loading.Hide();
            //    })
            //    .catch(function (response) {
            //        $scope.myroot.PID = null;
            //        $scope.myroot.ProductName = null;
            //        jAlert.Notify(response);
            //        UtilJS.Loading.Hide();
            //    });
        }
        else {
            $scope.myroot.PID = null;
            $scope.myroot.ProductName = null;
        }
    };
    //#endregion

    //#region Popup search Product
    $scope.PnProductSearchModal = {

        Core: { ProductTypeSearch: 'External', treePlugins:'checkbox,search,chkall' }
    };
    $scope.PnProductSearchModal.IsSelectedAll = true;
    $scope.PnProductSearchModal.CallBack = {};
    $scope.PnProductSearchModal.CallBack.ChoosedItem = function (Product) {
        $scope.myroot.PID = Product.PID;
        $scope.myroot.ProductID = Product.ProductID;
        $scope.myroot.ProductName = Product.ProductName;

        $scope.PnProductSearchModal.API.HideModal();
    };
    $scope.PnProductSearchModal.Core.ReadAllData = true;
    $scope.PnProductSearchModal.Core.ActionURL = "/Directives/GetProduct";
    $scope.PnProductSearchModal.Core.IsPermission_AllCategories = $scope.myroot.Permission.isReadCategory;
    $timeout(function () {
        $scope.myroot.ShowProductSearch = function () {
            $scope.PnProductSearchModal.Core.txtSearch = { Text: '' };
            $scope.PnProductSearchModal.API.ShowModal();
            //$scope.PnProductSearchModal.API.Search();
        };
        $scope.myroot.ClearProductInfo = function () {
            $scope.myroot.PID = null;
            $scope.myroot.ProductID = null;
            $scope.myroot.ProductName = null;
        };
    });
    //#endregion

    //#region search
    $scope.InventoryStock.btnSearch.Onclick = function () {
        //validate
        if ($scope.myroot.ddlStore.NodeResult.IDSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn kho", "Thông báo");
            return;
        }
        if (!$scope.myroot.PID) {
            jAlert.Warning('Vui lòng chọn sản phẩm');
            return;
        }
        UtilJS.Loading.Show();
        let obj = {};
        obj.StoreIDs = $scope.myroot.ddlStore.NodeResult.IDSelected.filter(c => !c.includes('G_')).map(parseFloat); //ko submit những Id là Area
        obj.CategoryIDs = [];
        obj.PID = $scope.myroot.PID;
        //obj.PageIndex = intPage - 1;
        //obj.PageSize = $scope.Pager.PageSize;
        CommonFactory.PostDataAjax("/Online/SearchInventoryStock", obj,
            function (beforeSend) { },
            function (response) {
                $timeout(function () {
                    UtilJS.Loading.Hide();
                    $scope.InventoryStock.Lst = [];
                    if (response.objCodeStep.Status == jAlert.Status.Error) {
                        jAlert.Error(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Warning) {
                        jAlert.Warning(response.objCodeStep.Message, 'Thông báo');
                        return;
                    }
                    else if (response.objCodeStep.Status == jAlert.Status.Success) {
                        $scope.InventoryStock.Lst = response.objCodeStep.Data || [];
                        //$scope.Pager.TotalItems = response.objCodeStep.Data.TotalRecord || 0;
                        //$scope.Pager.CurrentPage = intPage;
                        //set data FormExcel
                        $scope.FormExcel = obj;
                    }
                });
            },
            function (error) {
                UtilJS.Loading.Hide();
            }
        );
    };

    //#endregion

    //#region enter search
    $(document).ready(function () {
        $(document).keypress(function (e) {
            if (e.which == 13) {
                $scope.InventoryStock.btnSearch.Onclick();
            }
        });
    });
    //#endregion

    //#region function Export

    $scope.InventoryStock.btnExportExcel = {};
    $scope.InventoryStock.btnExportExcel.Onclick = function () {
        if ($scope.InventoryStock.Lst.length == 0) {
            jAlert.Warning("Không có dữ liệu để xuất");
            return;
        }

        UtilJS.Files.Download({
            url: "/Online/DownloadInventoryStock",
            data: { obj: $scope.FormExcel },
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
    UtilJS.Loading.Show();
    $q.all({
        Stores: DataFactory.StoreTree_Read($scope.myroot.Permission.isReadStore),
        Provinces: DataFactory.Provinces_Get(),
        Districts: DataFactory.Districts_Get(),
        ProductCategories: DataFactory.ProductCategoriesTree_Read($scope.myroot.Permission.isReadCategory),
        wait: UtilFactory.WaitingLoadDirective([])
    }).then((MultipleRes) => {
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        $scope.Province.InitLst = $scope.Province.Lst = MultipleRes.Provinces.Data;
        $scope.District.InitLst = MultipleRes.Districts.Data.sort(function (a, b) {
            return a.DistrictName.localeCompare(b.DistrictName);
        });
        $scope.myroot.ddlStore.TreeData = $scope.Store_TreeDataAll = MultipleRes.Stores.Data.filter(c => c.IsSaleStore || (c.IsCenterStore && c.IsRealStore));
        $scope.Province.API.SetValue($scope.ProvinceDefault);
        UtilJS.Loading.Hide();
    }).catch((response) => {
        UtilJS.Loading.Hide();
        throw response;
    });
    //#endregion
}
InventoryStockController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "ApiHelper", "UtilFactory", "DataFactory", "$q","CommonFactory"];
addController("InventoryStockController", InventoryStockController);