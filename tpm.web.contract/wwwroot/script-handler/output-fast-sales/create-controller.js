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
var CreateController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $window, $controller) {
    let OutputFastSalesEndPoint = "/OutputFastSales/";
    let createdDate = DataSetting.CreatedDate;
    $scope.isAdvanceAdressConfirm = true;
    $scope.storeIDDefault = DataSetting.storeIDDefault;
    $scope.isCombo = DataSetting.isCombo;

    $scope.Permission = {};
    $scope.pnOrder = {};
    let ConstantVariables = {};
    ConstantVariables.OutputTypeOnlineSpecialId = 15;
    ConstantVariables.OutputTypeOnlineNormalId = 2;

    let ProductType = {};
    ProductType.SanPham = 0;
    ProductType.PQT = 1;
    ProductType.Combo = 2;

    $scope.NoInputNumber = ["-"];

    $scope.ComboProductType = { Core: {}, CallBack: {} };
    $scope.ComboProductType.Core.Text = 'Text';
    $scope.ComboProductType.Core.IDValue = 'Value';
    $scope.ComboProductType.Core.IsHideValueDefault = true;
    
    //#region Customer & Invoice
    $scope.pnCustomer = {};
    $scope.pnCustomer.Customer = {};
    if (DataSetting.isLocal) {
        $scope.pnCustomer.Customer.Address = '803 Đường Kha Vạn Cân, Linh Tây, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam';
        $scope.pnCustomer.Customer.CustomerAddressDetail = '803 Đường Kha Vạn Cân, Linh Tây, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam';
        $scope.pnCustomer.Customer.Latitude = 10.8563841;
        $scope.pnCustomer.Customer.Longitude = 106.7564303;
    }

    $scope.pnCustomer.Customer.isReceiveNanOrganic = true;
    $scope.pnCustomer.MerDisplay = function (data) {
        if (!data.CustomerPhone) {
            data.CustomerPhone = data.Phone;
        }
        //data.MemberTypeDisplay
        $scope.pnCustomer.Customer = data;
        $scope.pnCustomer.Customer.TaxNo = $scope.frmInvoice.Customer.TaxNo;
        $scope.pnCustomer.Customer.InvoiceName = $scope.frmInvoice.Customer.InvoiceName;
        $scope.pnCustomer.Customer.InvoiceAddress = $scope.frmInvoice.Customer.InvoiceAddress;
        $scope.pnCustomer.Customer.InvoiceEmail = $scope.frmInvoice.Customer.InvoiceEmail;
        $scope.pnCustomer.Customer.InvoiceReceiver = $scope.frmInvoice.Customer.InvoiceReceiver;
        if ($scope.frmInvoice.Customer.TaxNo) {
            $scope.frmInvoice.Customer.TaxNo_Personal = $scope.frmInvoice.Customer.TaxNo.substring(0, 10);
            if ($scope.frmInvoice.Customer.TaxNo.includes('-')) {
                $scope.frmInvoice.Customer.TaxNo_Company = $scope.frmInvoice.Customer.TaxNo.split("-")[1];
            }
        }
        $scope.pnCustomer.Customer.Address = '';
        $scope.pnCustomer.Customer.CustomerAddressDetail = '';
        $scope.pnCustomer.Customer.MessNanOrganic = '';


        if ($scope.pnCustomer.Customer.CustomerPhone) {
            ReadCustomerAddressByPhone($scope.pnCustomer.Customer.CustomerPhone)
                .then((response) => {
                    response.forEach((x) => {
                        let item = {};
                        item.Address = x.CustomerAddress;
                        item.Longitude = x.Longitude;
                        item.Latitude = x.Latitude;
                        item.Checked = x.IsDefault;
                        $scope.list_address_autocomplete.push(item);
                        if (x.IsDefault) {
                            var lat = x.Latitude;
                            var lng = x.Longitude;

                            $scope.pnCustomer.Customer.Address = x.CustomerAddress;
                            $scope.pnCustomer.Customer.CustomerAddressDetail = x.CustomerAddress;
                            $scope.pnCustomer.Customer.Latitude = lat;
                            $scope.pnCustomer.Customer.Longitude = lng;

                            $scope.pnCustomer.Customer.ProvinceID = x.ProvinceID;
                            $scope.pnCustomer.Customer.DistrictID = x.DistrictID;
                            $scope.pnCustomer.Customer.WardID = x.WardID;

                            $scope.GooglePlaceChoose = {};
                            $scope.GooglePlaceChoose.Address = item.Address;
                            $scope.GooglePlaceChoose.Latitude = lat;
                            $scope.GooglePlaceChoose.Longitude = lng;
                        }
                    });

                    if ($scope.objSearchGooglePalce.keySearch && $scope.list_address_autocomplete.length == 0) {
                        $scope.btnGooglePlaceAutoComplete_Onclick();
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        $scope.pnCustomer.PhoneDisplay = _.clone("0" + parseInt(data.Phone), true);
        $scope.FormSearch.CustomerReadByPhone_IsShow = false;
    };

    $scope.frmInvoice = {};
    $scope.frmInvoice.Customer = {};
    $scope.frmInvoice.TaxNoIsValid = function () {
        !$scope.frmInvoice.Customer.TaxNo_Personal && ($scope.frmInvoice.Customer.TaxNo_Personal = "");
        !$scope.frmInvoice.Customer.TaxNo_Company && ($scope.frmInvoice.Customer.TaxNo_Company = "");
        let TaxNoValid = ".";
        let TaxNo = $scope.frmInvoice.Customer.TaxNo_Personal + "" + $scope.frmInvoice.Customer.TaxNo_Company;
        if (!TaxNo) {
            $('#TaxNoValid').val(".");
            $('#TaxNoValid').valid();
            return;
        }
        if (!/^[0-9]+$/.test(TaxNo)) {
            TaxNoValid = "";
        }
        if (TaxNo
            && TaxNo.length !== 13
            && $scope.frmInvoice.Customer.TaxNo_Personal.length !== 10
            && TaxNo.length !== 10) {
            TaxNoValid = "";
        }

        $('#TaxNoValid').val(TaxNoValid);
        $('#TaxNoValid').valid();

    };
    $scope.frmInvoice.ClearCustomerInvoice = function () {
        $scope.frmInvoice.Customer = {};
        $scope.frmInvoice.Update();
    };
    $scope.frmInvoice.Update = function () {
        !$scope.frmInvoice.Customer.TaxNo_Personal && ($scope.frmInvoice.Customer.TaxNo_Personal = "");
        !$scope.frmInvoice.Customer.TaxNo_Company && ($scope.frmInvoice.Customer.TaxNo_Company = "");

        let TaxNo = $scope.frmInvoice.Customer.TaxNo_Personal + "" + $scope.frmInvoice.Customer.TaxNo_Company;
        if ($scope.frmInvoice.Customer.TaxNo_Personal && $scope.frmInvoice.Customer.TaxNo_Company) {
            TaxNo = $scope.frmInvoice.Customer.TaxNo_Personal + "-" + $scope.frmInvoice.Customer.TaxNo_Company;
        }
        $scope.frmInvoice.Customer.TaxNo = TaxNo;

        $scope.pnCustomer.Customer.TaxNo = $scope.frmInvoice.Customer.TaxNo;
        $scope.pnCustomer.Customer.InvoiceName = $scope.frmInvoice.Customer.InvoiceName;
        $scope.pnCustomer.Customer.InvoiceAddress = $scope.frmInvoice.Customer.InvoiceAddress;
        $scope.pnCustomer.Customer.InvoiceEmail = $scope.frmInvoice.Customer.InvoiceEmail;
        $scope.pnCustomer.Customer.InvoiceReceiver = $scope.frmInvoice.Customer.InvoiceReceiver;
    };
    $scope.frmInvoice.ShowCustomerInvoice = function () {
        if (!$scope.pnCustomer.Customer.CustomerPhone) {
            jAlert.Warning('Nhập số điện thoại khách hàng trước khi nhập thông tin xuất hóa đơn');
            return;
        }
        if (!isValidPhone($scope.pnCustomer.Customer.CustomerPhone)) {
            jAlert.Warning('Số điện thoại khách hàng không hợp lệ');
            return;
        }

        $('#TaxNoValid').val(".");
        customValidate.Reset('frmInvoice');
        $(".frmInvoice").modal('show');
    };
    $scope.frmInvoice.CloseCustomerInvoice = function () {
        if (!$('#frmInvoice').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        $scope.frmInvoice.Update();
        $(".frmInvoice").modal('hide');
    };
    //#endregion Customer & Invoice

    $scope.CustomerPhone_Onchange = function () {
        $scope.pnCustomer.Customer.ContactPhone = $scope.pnCustomer.Customer.CustomerPhone;
        $timeout(() => {
            $('#HeaderForm').valid();
        });
    };

    //#region Thời gian khách nhận hàng
    //Chọn ngày
    $scope.dllDeliveryDate = { Core: {}, CallBack: {} };
    $scope.dllDeliveryDate.Core.Text = 'DeliveryName';
    $scope.dllDeliveryDate.Core.IDValue = 'DeliveryValue';
    $scope.dllDeliveryDate.Core.IsDisabled = false;
    $scope.dllDeliveryDate.Core.IsHideValueDefault = false;
    $scope.dllDeliveryDate.Core.label2 = 'Chọn ngày';
    $scope.dllDeliveryDate.CallBack.Onchanged = function (x) {

        $scope.dllDeliveryTime.API.SetValue(null);
        if (!$scope.dllDeliveryDate.Value) {
            $scope.dllDeliveryTime.Lst = [];
            return;
        }
        let itemDate = $scope.dllDeliveryDate.Lst.filter((itemDate) => {
            return itemDate.DeliveryValue == $scope.dllDeliveryDate.Value;
        })[0];

        $scope.dllDeliveryTime.Lst = GetTimes(itemDate.DeliveryNow);
    };
    // Chọn giờ
    $scope.dllDeliveryTime = { Core: {}, CallBack: {} };
    $scope.dllDeliveryTime.Core.Text = 'DeliveryName';
    $scope.dllDeliveryTime.Core.IDValue = 'DeliveryValue';
    $scope.dllDeliveryTime.Core.label2 = 'Chọn giờ';
    $scope.dllDeliveryTime.Core.IsDisabled = false;
    $scope.dllDeliveryTime.CallBack.Onchanged = function () {

        if (!$scope.dllDeliveryTime.Value) {
            return;
        }
    };

    function GetDeliveryDateTicks(Num) {
        var arrDeliveryDateTicks = [];
        var date = new Date();
        let item_delivery = {};
        item_delivery.DeliveryName = 'Hôm nay' + ' (' + moment(date).format('DD/MM') + ')';
        item_delivery.DeliveryValue = moment(date).format('DD/MM/YYYY');
        item_delivery.DeliveryNow = true;
        arrDeliveryDateTicks.push(item_delivery);

        date.setDate(date.getDate() + 1);
        for (var i = 0; i < Num; i++) {
            let itemDelivery = {};
            itemDelivery.DeliveryName = GetDay(date) + ' (' + moment(date).format('DD/MM') + ')';
            itemDelivery.DeliveryValue = moment(date).format('DD/MM/YYYY');
            arrDeliveryDateTicks.push(itemDelivery);
            date.setDate(date.getDate() + 1);
        }
        return arrDeliveryDateTicks;
    }
    function GetDay(date) {

        var current_day = date.getDay();
        var day_name = '';
        switch (current_day) {
            case 0:
                day_name = "Chủ nhật";
                break;
            case 1:
                day_name = "Thứ hai";
                break;
            case 2:
                day_name = "Thứ ba";
                break;
            case 3:
                day_name = "Thứ tư";
                break;
            case 4:
                day_name = "Thứ năm";
                break;
            case 5:
                day_name = "Thứ sáu";
                break;
            case 6:
                day_name = "Thứ bảy";
                break;
        }
        return day_name;
    }
    function GetTimes(IsDateNow) {
        var arrDeliveryTimes = [];
        var date = new Date();
        let nextTime = 9;
        if (IsDateNow) {
            if (date.getMinutes() < 10) {
                nextTime = date.getHours() + 1;
            }
            else {
                nextTime = date.getHours() + 2;
            }
        }
        for (var i = nextTime; i < 22; i++) {
            let DeliveryTime = {};
            DeliveryTime.DeliveryName = 'Trước ' + (nextTime < 10 ? '0' + nextTime : nextTime) + 'h';
            DeliveryTime.DeliveryValue = nextTime;
            arrDeliveryTimes.push(DeliveryTime);
            nextTime++;
        }
        return arrDeliveryTimes;
    }
    //#endregion Thời gian khách nhận hàng

    //#region OrderBusItem 

    $scope.ReInitOrderBusItem = async function () {
        try {
            UtilJS.Loading.Show();
            let objReq = {};
            objReq.storeIdChanged = DataSetting.storeIDDefault;
            objReq.type = "storeChange";
            objReq.isStoreDefault = true;

            let strApiEndPoint = OutputFastSalesEndPoint + 'ReInitOrderBusItem';
            let response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            UtilJS.Loading.Hide();
            MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
        } catch (response) {
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    };

    let OrderBusItem = {};
    $scope.OrderBus = {};
    let _isCombo = false;
    $scope.pnOrder.GetFinalPrice = function () {
        //$scope.pnOrder.DeliveryCustomerFee = !$scope.pnOrder.DeliveryCustomerFee ? 0 : $scope.pnOrder.DeliveryCustomerFee;
        //$scope.OrderBus._finalPrice = !$scope.OrderBus._finalPrice ? 0 : $scope.OrderBus._finalPrice;

        //let xxx = $scope.OrderBus._finalPrice + $scope.pnOrder.DeliveryCustomerFee; 
        //return xxx;
        return $scope.OrderBus._finalPrice;
    };
    OrderBusItem.GetProductOrderById = function (productId, outputTypeId) {
        return _.find($scope.OrderBus._outputSaleDetails, (pro) =>
            pro.OutputTypeID == outputTypeId &&
            (pro.ProductId === productId || (pro.ReferenceID ? pro.ReferenceID === productId : false)));
    };
    OrderBusItem.GetOutputSaleDetail = function () {
        return $scope.OrderBus._outputSaleDetails;
    };
    OrderBusItem.GetSumQuantity = function () {
        return $scope.OrderBus._sumQuantity;
    };
    OrderBusItem.GetPromotionOrderStatus = function () {
        return $scope.OrderBus._promotionOrderStatus;
    };

    let MainTabBusItem = {};
    MainTabBusItem.GetCurrentCustomer = function () {
        return $scope.pnCustomer.Customer;
    };
    MainTabBusItem.UpdateOrderInformation = function (data) {
        $scope.OrderBus = data;
        $scope.OrderBus._outputSaleDetails.forEach((x) => {
            let u = _.find($scope.OutputTypes, (u_) => u_.OutputTypeID == x.OutputTypeID);
            u && (x.OutputTypeName = u.OutputTypeName);
        });
        $scope.PnProduct.Lst = $scope.OrderBus._outputSaleDetails.filter((x) => !x.IsDelivery);

        $scope.btnPromotion.Enabled = $scope.OrderBus._outputSaleDetails.length > 0;
        if ($scope.OrderBus._promotionOrderStatus) {
            $scope.btnPromotion.Enabled = false;
            $scope.btnSave.Enabled = true;
        }
    };
    MainTabBusItem.SetStatusOutputTypeCombobox = function () {
        if ($scope.OrderBus._promotionOrderStatus) {
            $scope.ComboProductType.Core.IsDisabled = true;
        }
    };
    MainTabBusItem.SetStatusDeliveryCombobox = function (IsDisabled) {
        if (!$scope.OrderBus._promotionOrderStatus) {
            IsDisabled = true;
        }
        IsDisabled = false;
    };
    //#endregion OrderBus   

    //#region lưới sản phẩm
    $scope.ReInitUtilityApp = function () {
        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'InitUtilityApp';
        CommonFactory.PostMethod(strApiEndPoint, { IsRefresh: true })
            .then((response) => {
                UtilJS.Loading.Hide();
                jAlert.Success("Tải lại dữ liệu hệ thống thành công");
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
            });
    };

    _presenter = {};
    _presenter.InitUtilityApp = function () {
        let strApiEndPoint = OutputFastSalesEndPoint + 'InitUtilityApp';
        return CommonFactory.PostMethod(strApiEndPoint);
    };
    _presenter.CreateOutputSale = function () {
        if (OrderBusItem.GetOutputSaleDetail().length == 0) {
            jAlert.Warning("Đơn hàng chưa có sản phẩm nào, vui lòng nhập sản phẩm");
            return;
        }
        if (!$scope.pnCustomer.Customer.ContactPhone) {
            jAlert.Warning("Vui lòng nhập số điện thoại giao hàng");
            return;
        }
        if (MainTabBusItem.GetCurrentCustomer().Gender !== 1 && MainTabBusItem.GetCurrentCustomer().Gender !== 2) {
            jAlert.Warning("Vui lòng chọn giới tính khách hàng");
            return;
        }
        if (!$scope.pnCustomer.Customer.Longitude && !$scope.pnCustomer.Customer.Latitude) {
            jAlert.Warning("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        UtilJS.Loading.Show();
        let customerIns = MainTabBusItem.GetCurrentCustomer();
        let objReq = {};
        objReq.isOnlineSpecial = false;
        objReq.DeliveryTypeID = 2;
        objReq.PaymentTypeID = 1;
        objReq.DeliveryID = null;
        objReq.TransactionID = null;
        objReq.CollectingInvoice = null;
        objReq.PrevOFSID = null;
        objReq.DeliveryID = null;
        objReq.ProcessingUser = null;
        objReq.ProcessingUsername = null;
        objReq.ProcessingFullname = null;
        objReq.isStoreDefault = true;
        objReq.CreatedFromEnvironment = 15;
        objReq.CreatedDate = createdDate;

        objReq.ReceiptID = $scope.pnOrder.ReceiptID;
        objReq.CustomerID = customerIns.CustomerID;
        objReq.CustomerName = customerIns.CustomerName;
        objReq.CustomerPhone = customerIns.CustomerPhone;
        objReq.CustomerEmail = customerIns.Email;
        objReq.CustomerAddress = customerIns.Address;
        objReq.CustomerGender = customerIns.Gender;
        objReq.ContactPhone = customerIns.ContactPhone;

        objReq.InvoiceTax = customerIns.TaxNo;
        objReq.InvoiceName = customerIns.InvoiceName;
        objReq.InvoiceAddress = customerIns.InvoiceAddress;
        objReq.InvoiceEmail = customerIns.InvoiceEmail;
        objReq.InvoiceReceiver = customerIns.InvoiceReceiver;

        objReq.CustomerAddressDetail = customerIns.CustomerAddressDetail;
        objReq.AddressLongitude = customerIns.Longitude;
        objReq.AddressLatitude = customerIns.Latitude;
        objReq.ProvinceID = customerIns.ProvinceID;
        objReq.DistrictID = customerIns.DistrictID;
        objReq.WardID = customerIns.WardID;

        objReq.RequiredOutputDate = null;
        if ($scope.dllDeliveryDate.Value && $scope.dllDeliveryTime.Value) {
            objReq.RequiredOutputDate = moment($scope.dllDeliveryDate.Value, "DD/MM/YYYY").format("MM/DD/YYYY") + ' ' + ($scope.dllDeliveryTime.Value - 1) + ':00';
            let objDeliveryTime = _.find($scope.dllDeliveryTime.Lst, (x) => x.DeliveryValue == $scope.dllDeliveryTime.Value);
            if (objDeliveryTime) {
                objReq.RequiredOutputDateByText = objDeliveryTime.DeliveryName;
            }
        }
        objReq.AgentCreatedUsername = $scope.pnOrder.AgentCreatedUsername;
        objReq.DescriptionPartner = $scope.pnOrder.DescriptionPartner;
        let strApiEndPoint = OutputFastSalesEndPoint + 'CreateOutputSale';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                $scope.btnSave.Enabled = false;
                jAlert.Success("Tạo phiếu thành công");
                $timeout(() => {
                    UtilJS.Loading.Show();
                    window.location.href = OutputFastSalesEndPoint + 'Edit/' + response.OFSID;
                }, 2000);
                return;
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    _presenter.GetOutputSalePromotions = function () {
        if (OrderBusItem.GetOutputSaleDetail().length == 0) {
            jAlert.Warning("Đơn hàng chưa có sản phẩm nào, vui lòng nhập sản phẩm");
            return;
        }
        if (!$scope.pnCustomer.Customer.ContactPhone) {
            jAlert.Warning("Vui lòng nhập số điện thoại giao hàng");
            return;
        }
        if (MainTabBusItem.GetCurrentCustomer().Gender !== 1 && MainTabBusItem.GetCurrentCustomer().Gender !== 2) {
            jAlert.Warning("Vui lòng chọn giới tính khách hàng");
            return;
        }
        UtilJS.Loading.Show();
        let objReq = {};
        objReq.isOnlineSpecial = false;
        objReq.isKhachle = false;
        let strApiEndPoint = OutputFastSalesEndPoint + 'GetOutputSalePromotions';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                //xu ly case nếu sản phẩm có khuyến mãi 
                if (response.lstPromotion && response.lstPromotion.length > 0) {
                    $scope.frmPros.type = "4Order";
                    $scope.frmPros.LoadDataPromotion(response.lstPromotion);
                }
                else {
                    MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                    MainTabBusItem.SetStatusOutputTypeCombobox();
                    MainTabBusItem.SetStatusDeliveryCombobox(true);
                }
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    _presenter.AddProduct = function (product) {
        if (!ValidAddProduct(product.ProductID)) {
            return;
        }
        UtilJS.Loading.Show();
        let objReq = {};
        objReq.quantity = product.Quantity;
        objReq.outputTypeId = 2;
        objReq.isScanBarcode = false;
        objReq.isOnlineSpecial = false;
        objReq.productTypeId = $scope.ComboProductType.Value;
        objReq.isReceiveNanOrganic = false;

        if (objReq.productTypeId == ProductType.SanPham) {
            objReq.productId = product.ProductID;

            let strApiEndPoint = OutputFastSalesEndPoint + 'AddProduct';
            CommonFactory.PostMethod(strApiEndPoint, objReq)
                .then((response) => {
                    ResetAddProduct();
                    UtilJS.Loading.Hide();
                    MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                    MainTabBusItem.SetStatusOutputTypeCombobox();

                    //case đã tồn tại thì server đã tính và cập nhật ds khuyến mãi của SP trong dh
                    //Vẫn báo message nếu không đủ tồn kho hoặc các ct khuyến mãi không đủ tồn 
                    if (response.isExistOnOrder) {
                        if (response.MessNoError) {
                            jAlert.Warning(response.MessNoError);
                        }
                        else {
                            jAlert.Success('Thêm sản phẩm thành công');
                        }
                        return;
                    }

                    //xu ly case nếu sản phẩm có khuyến mãi
                    let outputTypeId = 2;
                    let product = OrderBusItem.GetProductOrderById(objReq.productId, outputTypeId);
                    if (product.Promotions.length > 0) {
                        $scope.frmPros.type = "4Product";
                        $scope.frmPros.LoadDataPromotion(product);
                        $('.PnProductSearchModal').modal('hide');
                    }
                    else {
                        jAlert.Success('Thêm sản phẩm thành công');
                    }
                   
                })
                .catch((response) => {
                    jAlert.Notify(response.objCodeStep);
                    UtilJS.Loading.Hide();
                });
        }
        else if (objReq.productTypeId == ProductType.Combo) {
            objReq.promotionNo = product.ProductID;

            let strApiEndPoint = OutputFastSalesEndPoint + 'AddProductCombo';
            CommonFactory.PostMethod(strApiEndPoint, objReq)
                .then((response) => {
                    //response.Type comboPromotionsByProductID, PromotionCombo , productPackage
                    UtilJS.Loading.Hide();
                    if (response.Type == "comboPromotionsByProductID") {
                        $scope.frmPros.type = response.Type;
                        $scope.frmPros.LoadDataPromotion(response.comboPromotionsByProductID, false, true);
                        $('.PnProductSearchModal').modal('hide');
                        return;
                    }
                    if (response.Type == "productPackage") {
                        ResetAddProduct();
                        MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                        MainTabBusItem.SetStatusOutputTypeCombobox();
                        return;
                    }
                    if (response.Type == "PromotionCombo") {
                        $scope.frmPros.type = response.Type;
                        $scope.frmPros.LoadDataPromotion(response, true, false);
                        $('.PnProductSearchModal').modal('hide');
                        return;
                    }
                })
                .catch((response) => {
                    jAlert.Notify(response.objCodeStep);
                    UtilJS.Loading.Hide();
                });
        }

    };
    _presenter.DeleteProduct = function (product) {
        UtilJS.Loading.Show();
        let objReq = {};
        objReq.productId = product.ProductId;
        objReq.outputTypeId = product.OutputTypeID;
        objReq.productApplyID = product.ProductIdApply;
        objReq.promotionID = product.PromotionId;
        objReq.comboID = product.ComboID;

        let strApiEndPoint = OutputFastSalesEndPoint + 'DeleteProduct';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                MainTabBusItem.SetStatusOutputTypeCombobox();
                jAlert.Success("Xóa thành công");
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    let ValidAddProduct = function (barcode) {
        let productType = $scope.ComboProductType.Value;
        if (productType != ProductType.Combo) {
            if (!barcode) {
                jAlert.Warning("Nhập mã sản phẩm");
                return false;
            }
        }
        else {
            if (!barcode) {
                jAlert.Warning("Nhập mã khuyến mãi combo");
                return false;
            }
        }
        if (!$scope.PnProduct.NumberboxQuantity.Value) {
            jAlert.Warning("Số lượng sản phẩm không hợp lệ");
            return false;
        }
        //if ($scope.PnProduct.Lst.length > 0 && _.find($scope.PnProduct.Lst, c => c.ComboID !== undefined && c.ComboID !== null && c.ComboID !== '') !== undefined) {
        //    jAlert.Warning("Mỗi đơn hàng chỉ thêm được 1 loại combo và thêm combo 1 lần.");
        //    return;
        //}
        return true;
    };
    let ResetAddProduct = function () {
        $scope.PnProduct.NumberboxQuantity.Value = 1;
        $scope.PnProduct.TextboxBarcode.Text = "";
        //$("#TextboxBarcode").focus();

        if (DataSetting.isLocal) {
            //"0504041160020";//"0007010000288";//"0502030000004";//0504041160007//0101020330021
            $scope.PnProduct.TextboxBarcode.Text = "0020010000189";
        }
    };

    $scope.PnProduct = {
        TextboxBarcode: {},
        NumberboxQuantity: {},
    };
    $scope.PnProduct.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.PnProduct.Lst = [];
    $scope.PnProduct.ItemOnDelete = function (existProduct) {
        if (existProduct.OutputTypeID == OutputTypeEnum.XuatKhuyenMai) {
            jAlert.Warning("Đây là sản phẩm tặng kèm, không xóa được");
            return;
        }
        if (OrderBusItem.GetPromotionOrderStatus()) {
            jAlert.Warning("Đơn hàng đã chốt khuyến mãi, nên không được xóa sản phẩm");
            return;
        }
        if (existProduct.ComboID) {
            jConfirm('Thông báo', 'Đây là sản phẩm thuộc combo, xóa sản phẩm là xóa hết combo. Bạn có muốn xoá sản phẩm này?', function (isOK) {
                if (!isOK) {
                    return false;
                }
                _presenter.DeleteProduct(existProduct);
            });
        }
        else {
            jConfirm('Thông báo', 'Bạn có muốn xoá sản phẩm này?', function (isOK) {
                if (!isOK) {
                    return false;
                }
                _presenter.DeleteProduct(existProduct);
            });
        }
    };
    ResetAddProduct();

    $scope.PnProduct.CheckProduct = function () {
        let barcode = $scope.PnProduct.TextboxBarcode.Text;
        let quantity = $scope.PnProduct.NumberboxQuantity.Value;
        _presenter.AddProduct({ ProductID: barcode, Quantity: quantity });
    };

    //#region Popup search Product
    $scope.PnProductSearchModal = {};
    $scope.PnProductSearchModal.Pager = { TotalItems: 0, PageSize: 10, CurrentPage: 1 };
    $scope.PnProductSearchModal.Lst = [];
    $scope.PnProductSearchModal.txtSearch = { Text: '' };
    $scope.PnProductSearchModal.btnSearch = {};
    $scope.PnProductSearchModal.btnAdd = {};
    $scope.PnProductSearchModal.btnSearch.OnClick = function (intPage) {
        UtilJS.Loading.Show();
        intPage = !intPage ? 1 : intPage;
        var objReq = {
            KeySearch: $scope.PnProductSearchModal.txtSearch.Text,
            PageIndex: intPage,
            PageSize: $scope.PnProductSearchModal.Pager.PageSize
        };

        let strApiEndPoint = OutputFastSalesEndPoint + 'SearchProduct';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                $scope.PnProductSearchModal.Lst = response.objCodeStep.Data.Records;
                $scope.PnProductSearchModal.Lst.forEach((item) => {
                    item.Quantity = 1;
                });
                $scope.PnProductSearchModal.Pager.TotalItems = response.objCodeStep.Data.TotalRecord;
                $scope.PnProductSearchModal.Pager.CurrentPage = intPage;
            })
            .catch((response) => {
                $scope.PnProductSearchModal.Lst = [];
                $scope.PnProductSearchModal.Pager.TotalItems = 0;
                $scope.PnProductSearchModal.Pager.CurrentPage = 1;
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
                $scope.PnProductSearchModal.IsGetData = false;
            });
    };
    $scope.PnProduct.OpenProductSearchModal = function () {
        if (!$scope.PnProductSearchModal.IsGetData) {
            $scope.PnProduct.txtKeySeach = '';
            $scope.PnProductSearchModal.btnSearch.OnClick();
            $('.PnProductSearchModal').modal('show');
        }
    };
    $scope.PnProductSearchModal.ChooseProduct = function (item) {
        $scope.PnProduct.NumberboxQuantity.Value = item.Quantity;
        _presenter.AddProduct({ ProductID: item.ProductID, Quantity: item.Quantity });
    };
    //#endregion Popup search Product

    //#endregion lưới sản phẩm

    //frmPromotionOutputs -> frmPros
    //#region frmPros
    let ConfirmedPromotion4Product = async function (isClose) {
        try {
            UtilJS.Loading.Show();
            PromotionsSelected = $scope.frmPros.GetPromotionSelected();

            let objReq = {};
            objReq.ProductId = $scope.frmPros.product.ProductId;
            objReq.Promotions = [];
            if (!isClose) {
                PromotionsSelected.forEach((x1) => {
                    let result = {};
                    result.PromotionId = x1.PromotionId;
                    result.LstPromotionProductOffer = [];
                    x1.LstPromotionProductOffer && x1.LstPromotionProductOffer.filter((x2) => x2.IsSelected).forEach((x3) => {
                        result.LstPromotionProductOffer.push({ PpOfferId: x3.PpOfferId });
                    });
                    objReq.Promotions.push(result);
                });
            }

            let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedPromotion4Product';
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            UtilJS.Loading.Hide();

            MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
            MainTabBusItem.SetStatusOutputTypeCombobox();

            if (response.MessNoError) {
                jAlert.Warning(response.MessNoError);
            }
            $scope.frmPros.HideModal();

            await $timeout(() => { }, 0);
            $scope.$apply();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    };
    let ConfirmedPromotion4Order = async function (isClose) {
        try {
            UtilJS.Loading.Show();
            PromotionsSelected = $scope.frmPros.GetPromotionSelected();
            let objReq = {};
            objReq.Promotions = [];
            if (!isClose) {
                PromotionsSelected.forEach((x1) => {
                    let result = {};
                    result.PromotionId = x1.PromotionId;
                    result.LstPromotionProductOffer = [];
                    x1.LstPromotionProductOffer && x1.LstPromotionProductOffer.filter((x2) => x2.IsSelected).forEach((x3) => {
                        result.LstPromotionProductOffer.push({ PpOfferId: x3.PpOfferId });
                    });
                    objReq.Promotions.push(result);
                });
            }

            let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedPromotion4Order';
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            UtilJS.Loading.Hide();
            $timeout(() => {
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                MainTabBusItem.SetStatusOutputTypeCombobox();
            });
            //MainTabBusItem.SetStatusDeliveryCombobox(true);
            if (response.MessNoError) {
                jAlert.Warning(response.MessNoError);
            }
            $scope.frmPros.HideModal();
        } catch (response) {
            jAlert.Notify(response.objCodeStep);
            UtilJS.Loading.Hide();
        }
    };
    let ConfirmedComboPromotionsByProductID = function (isClose) {
        if (isClose) {
            $scope.frmPros.HideModal();
            return;
        }
        if (PromotionsSelected.length == 0) {
            jAlert.Warning("Vui lòng chọn chương trình khuyến mãi");
            return;
        }
        UtilJS.Loading.Show();
        PromotionSelected = $scope.frmPros.GetPromotionSelected()[0];

        let objReq = {};
        objReq.PromotionId = PromotionSelected.PromotionId;

        let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedComboPromotionsByProductID';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                if (response.Type == "fixPriceComboClearPromotion") {
                    $scope.frmPros.HideModal();
                    jAlert.Warning("Chương trình không thỏa điều kiện áp dụng");
                    getComboPrice();
                    return;
                }
                if (response.Type == "productPackage") {
                    ResetAddProduct();
                    MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                    MainTabBusItem.SetStatusOutputTypeCombobox();
                    return;
                }
                if (response.Type == "PromotionCombo") {
                    $scope.frmPros.type = response.Type;
                    $scope.frmPros.LoadDataPromotion(response, true, false);
                    return;
                }
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    let ConfirmedComboPromotion = function (isClose) {
        let objReq = {};
        objReq.qtyCombo = $scope.PnProduct.NumberboxQuantity.Value;
        objReq.ComboID = $scope.frmPros.tab1.ComboIDSelected;
        objReq.PpOfferIds = [];
        $scope.frmPros.PromotionCombo.LstPromotionProductOffer &&
            $scope.frmPros.PromotionCombo.LstPromotionProductOffer.forEach((x) => {
                if (x.IsSelected) {
                    objReq.PpOfferIds.push(x.PpOfferId);
                }
            });
        if (isClose) {
            $scope.frmPros.HideModal();
            return;
        }
        if ($scope.frmPros.PromotionCombo.LstPromotionProductOffer && $scope.frmPros.PromotionCombo.LstPromotionProductOffer.length > 0) {
            if (objReq.PpOfferIds.length == 0) {
                jAlert.Warning("Vui lòng chọn sản phẩm tặng kèm trong combo", "Thông báo");
                return;
            }
        }
        if (!objReq.ComboID) {
            jAlert.Warning("Vui lòng chọn combo", "Thông báo");
            return;
        }
        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedComboPromotion';
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                ResetAddProduct();
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
                MainTabBusItem.SetStatusOutputTypeCombobox();
                if (response.MessNoError) {
                    jAlert.Warning(response.MessNoError);
                }
                $scope.frmPros.HideModal();
                return;
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                $scope.frmPros.HideModal();
                UtilJS.Loading.Hide();
            });
    };
    let AddPromotionItemToGroup = function (headerText, groupName, lstPromotion, panel) {
        panel.headerText = headerText;
        panel.groupName = groupName;

        //panel.ListPromotionFollow-> $scope.frmPros.ListPromotionFollow
        //panel.ListPromotionFollow = []; 
        lstPromotion.forEach((p) => {
            if (p.LstPromotionFollow && p.LstPromotionFollow.length > 0) {
                p.LstPromotionFollow.forEach((pfollow) => {
                    let o = {};
                    o.PromotionID = p.PromotionId
                    o.PromotionIDNotFollow = pfollow.PromotionFollowId;
                    $scope.frmPros.ListPromotionFollow.push(o);
                });
            }
        });
        //FillPromotionData
        lstPromotion = _.sortBy(lstPromotion, "PromotionId");

        //truong hop km combo4products chi dc chon 1 km
        if ($scope.frmPros.isOneSelected) {
            let promotionIDs = [];
            lstPromotion.filter((x) => {
                if (x.IsDefault) {
                    promotionIDs.push(x.PromotionId);
                }
            });
            if (promotionIDs.length > 0) {
                let maxID = _.max(promotionIDs, (x) => x);
                let existDefault = _.find(lstPromotion, (x) => x.PromotionId == maxID);
                existDefault.IsCheckPromotion = true;
            }
        }
        lstPromotion.filter((x) => {
            //case promotioncombos thì mình mặc định ko chọn
            if (!$scope.frmPros.isOneSelected) {
                x.IsCheckPromotion = true;
            }
            x.PromotionContent = "";
            if (x.DiscountAmount > 0) {
                x.PromotionContent = `Khuyến mãi giảm giá trực tiếp ${$filter('number')(x.DiscountAmount)}`;
            }
            if (x.DiscountPercent > 0) {
                x.PromotionContent = `Khuyến mãi giảm giá trực tiếp ${$filter('number')(x.DiscountPercent)}%`;
            }
            //SetGridProductOffer
            x.TotalProductOffer = 0;
            if (x.LstPromotionProductOffer) {
                x.LstPromotionProductOffer.filter((x1) => {
                    if (x1.IsDefault) {
                        x1.IsSelected = true;
                    }
                    else if (x1.IsOption) {
                        x1.IsSelected = false;
                    }
                    else if (x1.IsFixed) {
                        x1.ReadOnly = true;
                        x1.IsSelected = true;
                    }
                });
                x.TotalProductOffer = x.LstPromotionProductOffer.length;
            }
        });
        panel.Lst = lstPromotion;

        //disable các promotion không đi kèm
        panel.Lst.forEach((p) => {
            $scope.frmPros.DisablePromotionNotFollow(p, panel);
            if (p.IsFixed) {
                p.Disable = true;
            }
        });
    }
    let AddPromotions = function (lstPromotion) {
        $scope.frmPros.lstPromotion = lstPromotion;
        $scope.frmPros.ListPromotionFollow = [];
        let lstPromotionRegular = [];
        let lstPromotionMember = [];

        lstPromotion.forEach((x) => {
            if (!x.LstPromotionMembership || x.LstPromotionMembership.length == 0) {
                lstPromotionRegular.push(x);
            }
            else if (x.LstPromotionMembership.length > 0) {
                lstPromotionMember.push(x);
            }
        });

        $scope.frmProsRegular = {};
        $scope.frmProsMember = {};

        AddPromotionItemToGroup("CTKM ", "groupCC", lstPromotionRegular, $scope.frmProsRegular);
        AddPromotionItemToGroup("CTKM thành viên", "groupMember", lstPromotionMember, $scope.frmProsMember);

        $scope.frmPros.IsMultiplePromotion = lstPromotionRegular.length + lstPromotionMember.length > 1;
        $scope.frmPros.ShowModal();
    };
    let AddComboPromotion = function (data) {
        let PromotionCombo = data.PromotionCombo;
        let groupCombo = data.groupCombo;

        //FillPromotionData
        PromotionCombo.IsCheckPromotion = true
        PromotionCombo.PromotionContent = "";
        if (PromotionCombo.DiscountAmount > 0) {
            PromotionCombo.PromotionContent = `Khuyến mãi giảm giá trực tiếp ${$filter('number')(PromotionCombo.DiscountAmount)}`;
        }
        if (PromotionCombo.DiscountPercent > 0) {
            PromotionCombo.PromotionContent = `Khuyến mãi giảm giá trực tiếp ${$filter('number')(PromotionCombo.DiscountPercent)}%`;
        }

        $scope.frmPros.IsMultiplePromotion = groupCombo.length > 1;
        $scope.frmPros.PromotionCombo = PromotionCombo;

        $scope.frmPros.tab1.keySearch = $scope.PnProduct.TextboxBarcode.Text;
        $scope.frmPros.tab1.ComboIDSelected = null;
        $scope.frmPros.tab1.groupCombo = groupCombo;
        $scope.frmPros.tab1.filter();

        //SetGridProductOffer
        PromotionCombo.TotalProductOffer = 0;
        if (PromotionCombo.LstPromotionProductOffer) {
            PromotionCombo.LstPromotionProductOffer.filter((x1) => {
                if (x1.IsDefault) {
                    x1.IsSelected = true;
                }
                else if (x1.IsOption) {
                    x1.IsSelected = false;
                }
                else if (x1.IsFixed) {
                    x1.ReadOnly = true;
                    x1.IsSelected = true;
                }
            });
            PromotionCombo.TotalProductOffer = PromotionCombo.LstPromotionProductOffer.length;
        }
        $scope.frmPros.tab2.filter();

        $scope.frmPros.ShowModal();
    };

    $scope.frmPros = {};
    $scope.frmPros.DisablePromotionNotFollow = function (p, panel) {
        let prFollow = [];

        $scope.frmPros.ListPromotionFollow.filter((pFollow) => {
            if (pFollow.PromotionID == p.PromotionId || pFollow.PromotionIDNotFollow == p.PromotionId) {
                prFollow.push(pFollow);
            }
        });
        if (prFollow.length == 0) {
            return;
        }
        //có km không đi kèm thì xử lý tiếp
        if (p.IsCheckPromotion) {
            //loop các ID km ko đi kèm được pluck ra trc đó
            prFollow.forEach((promotionNoFollow) => {
                let arrControl;
                if (promotionNoFollow.PromotionIDNotFollow == p.PromotionId) {
                    arrControl = _.find($scope.frmPros.lstPromotion, (l) => l.PromotionId === promotionNoFollow.PromotionID);
                }
                else {

                    arrControl = _.find($scope.frmPros.lstPromotion, (l) => l.PromotionId === promotionNoFollow.PromotionIDNotFollow);
                }
                if (arrControl) {
                    arrControl.IsCheckPromotion = false;
                    arrControl.Disable = true;
                }
            });
        }
        else {
            //loop các km ko đi kèm được pluck ra trc đó
            prFollow.forEach((promotionNoFollow) => {
                let arrControl;
                if (promotionNoFollow.PromotionIDNotFollow == p.PromotionId) {
                    arrControl = _.find($scope.frmPros.lstPromotion, (l) => l.PromotionId === promotionNoFollow.PromotionID);
                }
                else {

                    arrControl = _.find($scope.frmPros.lstPromotion, (l) => l.PromotionId === promotionNoFollow.PromotionIDNotFollow);
                }
                if (arrControl) {
                    arrControl.Disable = false;
                }
            });
        }
    };
    //#region promotion normal && member

    //#endregion

    //#region combo 
    $scope.frmPros.tab1 = {};
    $scope.frmPros.tab1.filter = function () {
        let combos = $scope.frmPros.tab1.groupCombo;
        $scope.frmPros.timer = setTimeout(() => {
            let keysearch = $scope.frmPros.tab1.keySearch;
            clearTimeout($scope.frmPros.timer);
            combos.filter((x) => {
                x.IsHidden = false;
                if (keysearch) {
                    if (!UtilJS.String.IsContain(x.ComboName, keysearch) &&
                        _.find(x.ListProduct, (x1) => UtilJS.String.IsContain(x1.ProductID, keysearch)) === undefined) {
                        x.IsHidden = true;
                    }
                }
            });
        }, 25);
    };
    $scope.frmPros.tab2 = {};
    $scope.frmPros.tab2.filter = function () {
        let promotion = $scope.frmPros.PromotionCombo;
        $scope.frmPros.timer = setTimeout(() => {
            let keysearch = $scope.frmPros.tab2.keySearch;
            clearTimeout($scope.frmPros.timer);
            if (!promotion.LstPromotionProductOffer) {
                return;
            }
            promotion.TotalProductOffer = promotion.LstPromotionProductOffer.length;
            promotion.LstPromotionProductOffer.filter((item) => {
                item.IsHidden = false;
                if (keysearch) {
                    if (!UtilJS.String.IsContain(item.ProductId, keysearch)
                        && !UtilJS.String.IsContain(item.ProductName, keysearch)) {
                        promotion.TotalProductOffer--;
                        item.IsHidden = true;
                    }
                }
            });
        }, 25);
    };
    //#endregion

    $scope.frmPros.filterPromotionProductOffer = function (keysearch, promotion) {
        $scope.frmPros.timer = setTimeout(() => {
            clearTimeout($scope.frmPros.timer);
            if (!promotion.LstPromotionProductOffer) {
                return;
            }
            promotion.TotalProductOffer = promotion.LstPromotionProductOffer.length;
            promotion.LstPromotionProductOffer.filter((item) => {
                item.IsHidden = false;
                if (keysearch) {
                    if (!UtilJS.String.IsContain(item.ProductId, keysearch)
                        && !UtilJS.String.IsContain(item.ProductName, keysearch)) {
                        promotion.TotalProductOffer--;
                        item.IsHidden = true;
                    }
                }
            });
        }, 25);
    };
    $scope.frmPros.GetPromotionSelected = function () {
        let lst = [];
        $scope.frmProsRegular.Lst.filter((x) => {
            if (x.IsCheckPromotion) {
                lst.push(x);
            }
        });
        $scope.frmProsMember.Lst.filter((x) => {
            if (x.IsCheckPromotion) {
                lst.push(x);
            }
        });
        return lst;
    };
    $scope.frmPros.LoadDataPromotion = function (data, isCombo = false, isOneSelected = false) {
        $scope.frmPros.isOneSelected = isOneSelected;
        $scope.frmPros.product = null;
        let lstPromotion = [];
        if ($scope.frmPros.type == "4Product") {
            $scope.frmPros.product = data;
            lstPromotion = data.Promotions;
        }
        else if ($scope.frmPros.type == "4Order") {
            lstPromotion = data;
        }
        else if ($scope.frmPros.type === "comboPromotionsByProductID") {
            lstPromotion = data;
        }
        else if ($scope.frmPros.type == "4GiftCode") {
            lstPromotion = [];
            $scope.frmPros.product = data;
            lstPromotion.push(data.PromotionGift);
        }
        _isCombo = isCombo;
        //$scope.frmPros.IsProductCombo = false; 
        if (!_isCombo) {
            AddPromotions(lstPromotion);
        }
        else {
            AddComboPromotion(data);
        }
    };
    $scope.frmPros.chkOnlyOneProm = function (promotion, panel) {
        let IsCheckPromotion = promotion.IsCheckPromotion;
        if ($scope.frmPros.isOneSelected) {
            panel.Lst.forEach((x) => x.IsCheckPromotion = false);
            promotion.IsCheckPromotion = IsCheckPromotion;
        }
    };
    $scope.frmPros.ShowModal = function () {
        $(".frmPros").modal('show');
    };
    $scope.frmPros.HideModal = function () {
        $(".frmPros").modal('hide');
    };
    $scope.frmPros.btnOK_Click = function (isClose) {
        if (!_isCombo) {
            PromotionsSelected = $scope.frmPros.GetPromotionSelected();//??? get ra chi day
            if ($scope.frmPros.type == "4Product") {
                ConfirmedPromotion4Product(isClose);
            }
            else if ($scope.frmPros.type == "4Order") {
                ConfirmedPromotion4Order(isClose);
            }
            else if ($scope.frmPros.type == "comboPromotionsByProductID") {
                ConfirmedComboPromotionsByProductID();
            }
            else if ($scope.frmPros.type == "4GiftCode") {
                ConfirmedPromotion4GiftCode(isClose);
            }
        }
        else {
            ConfirmedComboPromotion(isClose);
        }
    };
    //#endregion frmPros
    $scope.PnProductOrderCloneModal = { Lst: [] };
    $scope.PnProductOrderCloneModal.Pager = { TotalItems: 0, PageSize: 5, CurrentPage: 1 };
    $scope.PnProductOrderCloneModal.btnPaging_OnClick = (intPage) => {
        intPage = !intPage ? 1 : intPage;
        $scope.PnProductOrderCloneModal.Pager.CurrentPage = intPage;
    };

    //#region Hau.Nguyen PQT 25.09.2019 

    //code pqt
    let ConfirmedPromotion4GiftCode = async function (isClose) {
        try {
            UtilJS.Loading.Show();
            //PromotionsSelected = $scope.frmPros.GetPromotionSelected();

            //let objReq = {};
            //objReq.ProductId = $scope.frmPros.product.ProductId;
            //objReq.Promotions = []; 

            //if (!isClose) {
            //    PromotionsSelected.forEach((x1) => {
            //        let result = {};
            //        result.PromotionId = x1.PromotionId;
            //        result.LstPromotionProductOffer = [];
            //        x1.LstPromotionProductOffer && x1.LstPromotionProductOffer.filter((x2) => x2.IsSelected).forEach((x3) => {
            //            result.LstPromotionProductOffer.push({ PpOfferId: x3.PpOfferId });
            //        });
            //        objReq.Promotions.push(result);
            //    });
            //}

            let dataSend = {};
            //dataSend.objReq = objReq;
            dataSend.isClose = !isClose ? false : true;

            let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedPromotion4GiftCode';
            let response = await CommonFactory.PostMethod(strApiEndPoint, dataSend);
            UtilJS.Loading.Hide();
            if (response.objCodeStep.Data && response.objCodeStep.Data.Type == "CancelGiftCode") {
                $(".frmGiftIsNew").modal('show');
                $scope.frmPros.HideModal();
                jAlert.Warning("Sử dụng phiếu quà tặng không thành công");
                $scope.Gift.IsShowComplete();
                return;
            }
            //ProcessPromotionType15 
            if (response.objCodeStep.Data && response.objCodeStep.Data.Type == "ProcessPromotionType15") {
                $scope.frmPros.HideModal();
                $(".frmProductApplyOnlineGift").modal('show');

                //gán để hiển thị số tiền trả trong km 15
                $scope.frmProductApplyOnlineGift.Type = response.objCodeStep.Data.Type;
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);

                //$scope.frmProductApplyOnlineGift.Discount = response.OrderBusItem.frmProductApply.Discount;
                $timeout(() => {
                    $scope.frmProductApplyOnlineGift.Lst = response.OrderBusItem.frmProductApply.OutputSaleDetails;
                });
                return;
            }

            //ProcessPromotionElse
            if (response.objCodeStep.Data && response.objCodeStep.Data.Type == "ProcessPromotionElse") {
                $(".frmGiftIsNew").modal('show');
                $scope.Gift.CC.Lst = response.OrderBusItem.frmUseVoucher.OutputDiscounts;
                $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                $scope.frmPros.HideModal();
                $scope.Gift.IsShowComplete();
                return;
            }
        } catch (response) {
            jAlert.Notify(response.objCodeStep);
            UtilJS.Loading.Hide();
        }
    };
    let ConfirmedProductApplyOnlineGift = function (isClose) {
        UtilJS.Loading.Show();

        let dataSend = {};
        dataSend.isClose = !isClose ? false : true;

        let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedProductApplyOnlineGift';
        CommonFactory.PostMethod(strApiEndPoint, dataSend)
            .then((response) => {
                UtilJS.Loading.Hide();
                if (response.objCodeStep.Data.Type == "Cancle") {
                    $(".frmProductApplyOnlineGift").modal('hide');
                    $(".frmGiftIsNew").modal('show');
                    jAlert.Warning("Sử dụng phiếu quà tặng không thành công");
                    return;
                }
                $(".frmProductApplyOnlineGift").modal('hide');
                $(".frmGiftIsNew").modal('show');
                $scope.Gift.CC.Lst = response.OrderBusItem.frmUseVoucher.OutputDiscounts;
                $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                $scope.Gift.IsShowComplete();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    let ConfirmedGiftGotItLimit = function (isClose) {
        UtilJS.Loading.Show();

        let dataSend = {};
        dataSend.isClose = !isClose ? false : true;

        let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmedGiftGotItLimit';
        CommonFactory.PostMethod(strApiEndPoint, dataSend)
            .then((response) => {
                UtilJS.Loading.Hide();
                if (response.objCodeStep.Data.Type == "Cancle") {
                    $(".frmProductApplyOnlineGift").modal('hide');
                    $(".frmGiftIsNew").modal('show');
                    jAlert.Warning("Sử dụng phiếu quà tặng không thành công");
                    return;
                }
                $(".frmProductApplyOnlineGift").modal('hide');
                if ($scope.IsGiftReUsed) {
                    $scope.Used.Lst = response.OrderBusItem.frmUseVoucher.OutputSaleSodexos;
                    $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                    $(".frmGiftIsUsed").modal('show');
                }
                else {
                    $(".frmGiftIsNew").modal('show');
                    $scope.Gift.Gotit.Lst = response.OrderBusItem.frmUseVoucher.OutputSaleSodexos;
                    $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                    $scope.Gift.IsGotit = true;
                    $scope.Gift.IsShowComplete();
                }
                $scope.Gift.IsShowComplete();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    //end pqt

    $('.frmProductApplyOnlineGift').modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
    $('.frmProductApplyOnlineGift').modal('hide');
    $scope.frmProductApplyOnlineGift = {};
    $scope.frmProductApplyOnlineGift.btnOK_Click = function (isClose) {
        if ($scope.frmProductApplyOnlineGift.Type == "ProcessPromotionType15") {
            ConfirmedProductApplyOnlineGift(isClose);
        }
        else if ($scope.frmProductApplyOnlineGift.Type == "ProcessPromotionTypeGotItLimit") {
            ConfirmedGiftGotItLimit(isClose);
        }
    };

    $scope.Gift = {
        IsCheck: false,
        IsSodexo: false,
        IsGotit: false,
        _sumDiscountAmount: 0,
        CC: {
            Code1: '',
            Code2: '',
            Code3: '',
            Code4: '',
            CheckBox: false,
            Lst: []
        },
        Sodexo: {
            GiftCode: '',
            Lst: []
        },
        Gotit: {
            GiftCode: '',
            Lst: []
        }
    };
    $scope.Gift.IsShowComplete = function () {
        $scope.Gift.Code1 = "";
        $scope.Gift.Code2 = "";
        $scope.Gift.Code3 = "";
        $scope.Gift.Code4 = "";
        $scope.Gift.IsShowCompleteFlag = false;
        if ($scope.Gift.CC.Lst.length > 0 ||
            $scope.Gift.Sodexo.Lst.length > 0 ||
            $scope.Gift.Gotit.Lst.length > 0) {
            $scope.Gift.IsShowCompleteFlag = true;
        }
    };
    $scope.Gift.Code1_onChange = async function () {
        await $timeout(() => { }, 500);
        var arr = $scope.Gift.Code1.split("-");
        if (arr.length == 4) {
            $scope.Gift.Code1 = arr[0];
            $scope.Gift.Code2 = arr[1];
            $scope.Gift.Code3 = arr[2];
            $scope.Gift.Code4 = arr[3];
        }
    }
    $scope.Used = {
        Code1: '',
        Code2: '',
        Lst: [],
        _sumDiscountAmount: 0
    };

    //#region IsNew
    $scope.OpenIsNew = function () {
        $scope.IsGiftReUsed = false;
        $scope.Gift.IsShowComplete();

        //$scope.Gift.Code1 = "9424";
        //$scope.Gift.Code2 = "3619";
        //$scope.Gift.Code3 = "1395";
        //$scope.Gift.Code4 = "6220";

        //$scope.Gift.Code1 = "8652";
        //$scope.Gift.Code2 = "9142";
        //$scope.Gift.Code3 = "0468";
        //$scope.Gift.Code4 = "6176";

        customValidate.Reset('frmGiftCC');
        customValidate.Reset('frmGiftSodexo');
        customValidate.Reset('frmGiftGotit');

        if (!$scope.pnCustomer.Customer.CustomerPhone) {
            jAlert.Warning(`Vui lòng nhập số điện thoại`);
            return;
        }
        $(".frmGiftIsNew").modal('show');
    };

    //#region 
    $scope.Gift.CC.Click = () => {
        if ($scope.Gift.CC.CheckBox == true) {
            $scope.Gift.IsCheck = true;
        }
        else {
            $scope.Gift.IsCheck = false;
        }
    };

    //$scope.Gift.CC.CheckBox = true;
    //$scope.Gift.IsCheck = true;
    //UsingGiftCode step 1
    $scope.CheckGiftCC = async function () {
        try {
            await $timeout(() => { }, 0);

            if (!$('#frmGiftCC').valid()) {
                $rootScope.scrollToTopInputValid();
                return;
            }

            if (!$scope.pnCustomer.Customer.CustomerPhone) {
                jAlert.Warning(`Số điện thoại không hợp lệ`);
                return;
            }
            let IsInputFull = $scope.Gift.IsCheck;
            let giftCodeUsed = $scope.Gift.Code4;
            let prefixCode = `${$scope.Gift.Code1}-${$scope.Gift.Code2}-${$scope.Gift.Code3}`;

            //IsInputFull = true;
            //prefixCode = "0091-0876-3186";
            //giftCodeUsed = "7174";

            //km pqt cho ngành hàng 15
            //https://scm-beta..vn/Promotions/Edit/4777
            //0020010000179

            //[Demo CCWeb] Mua Sữa Vinamilk giảm 20%
            //https://scm-beta..vn/Promotions/Edit/4745 
            //0029130000030

            //IsInputFull = true;
            //prefixCode = "6380-5655-8301";
            //giftCodeUsed = "0777";

            let code = `${prefixCode}-${giftCodeUsed}`;
            if (_.find($scope.Gift.CC.Lst, (x) => x.CodeCard == code) != undefined) {
                jAlert.Warning(`Phiếu quà tặng ${code} đã tồn tại trên lưới`);
                return;
            }
            UtilJS.Loading.Show();
            let objReq = {};
            objReq.IsInputFull = IsInputFull;
            objReq.prefixCode = prefixCode;
            objReq.giftCodeUsed = giftCodeUsed;
            objReq.createFromSource = 15;

            let strApiEndPoint = OutputFastSalesEndPoint + 'CheckGiftCode';
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            $(".frmGiftIsNew").modal('hide');
            UtilJS.Loading.Hide();

            var productGift = response.productGift;
            if (productGift.IsOTP) {
                var isOk = await $scope.frmCheckOTP.showModal();
                if (!isOk) {
                    jAlert.Warning(`Xác nhận OTP không thành công`);
                    return;
                }
            }
            //xu ly case nếu PQT có khuyến mãi
            let frmUseVoucher = response.OrderBusItem.frmUseVoucher;
            let product = frmUseVoucher.productGift;
            product.PromotionGift = frmUseVoucher.PromotionGift;
            $scope.frmPros.type = "4GiftCode";
            $scope.frmPros.LoadDataPromotion(product);

            $scope.$apply();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    };

    //#region Delete
    $scope.Gift.CC.Delete = function (Code) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK) {
                return false;
            }
            $timeout(function () {
                UtilJS.Array.Remove($scope.Gift.CC.Lst, (x) => x.Code == Code);
                jAlert.Success("Xóa thành công.");
            });
        });
    };
    //#endregion Delete

    //#endregion 

    //#region Sodexo

    //sca : ProcessSodexoGift
    //1 : sodexox
    //2 : gotit

    //#region Check
    $scope.CheckGiftSodexo = () => {
        if (!$('#frmGiftSodexo').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }

        //#region check Mã PQT đã có trên grid chưa
        if (_.find($scope.Gift.Sodexo.Lst, (x) => x.GiftCode == $scope.Gift.Sodexo.GiftCode) != undefined) {
            jAlert.Warning(`Phiếu quà tặng ${$scope.Gift.Sodexo.GiftCode} đã tồn tại trên lưới`);
            return;
        }
        //#endregion 

        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'CheckRedeemSodexo';
        let objReq = {
            //Code: "19904010000009805182",
            Code: $scope.Gift.Sodexo.GiftCode,
            //type: 1
        };
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                $scope.Gift.Sodexo.Lst = response.OrderBusItem.frmUseVoucher.OutputSaleSodexos;
                $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                $scope.Gift.IsSodexo = true;
                $scope.Gift.IsShowComplete();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    //#endregion Check

    //#region Delete
    $scope.Gift.Sodexo.Delete = function (Code) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK) {
                return false;
            }
            $timeout(function () {
                UtilJS.Array.Remove($scope.Gift.Sodexo.Lst, (x) => x.Code == Code);
                if ($scope.Gift.Sodexo.Lst.length == 0) {
                    $scope.Gift.IsGotit = false;
                }
                jAlert.Success("Xóa thành công.");
            });
        });
    };
    //#endregion Delete

    //#endregion Sodexo

    //#region Gotit

    //#region Check
    $scope.CheckGiftGotit = () => {
        if (!$('#frmGiftGotit').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }

        //#region check Mã PQT đã có trên grid chưa
        if (_.find($scope.Gift.Gotit.Lst, (x) => x.GiftCode == $scope.Gift.Gotit.GiftCode) != undefined) {
            jAlert.Warning(`Phiếu quà tặng ${$scope.Gift.Gotit.GiftCode} đã tồn tại trên lưới`);
            return;
        }
        //#endregion

        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'CheckRedeemGotIt';
        let objReq = {
            //Code: "1095980280",
            Code: $scope.Gift.Gotit.GiftCode,
            //type: 2
        };
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                if (response.objCodeStep.Data && response.objCodeStep.Data.Type == "ProcessPromotionTypeGotItLimit") {
                    $(".frmGiftIsNew").modal('hide');
                    $('.frmProductApplyOnlineGift').modal({ backdrop: 'static', keyboard: false });

                    //gán để hiển thị số tiền trả trong popup pqt GotIt
                    $scope.frmProductApplyOnlineGift.Type = response.objCodeStep.Data.Type;
                    MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);

                    //$scope.frmProductApplyOnlineGift.Discount = response.OrderBusItem.frmProductApply.Discount;
                    $scope.frmProductApplyOnlineGift.Lst = response.OrderBusItem.frmProductApply.OutputSaleDetails;
                    return;
                }

                $scope.Gift.Gotit.Lst = response.OrderBusItem.frmUseVoucher.OutputSaleSodexos;
                $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                $scope.Gift.IsGotit = true;
                $scope.Gift.IsShowComplete();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    //#endregion Check

    //#region Delete
    $scope.Gift.Gotit.Delete = function (Code) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK) {
                return false;
            }
            $timeout(function () {
                UtilJS.Array.Remove($scope.Gift.Gotit.Lst, (x) => x.Code == Code);
                if ($scope.Gift.Gotit.Lst.length == 0) {
                    $scope.Gift.IsSodexo = false;
                }
                jAlert.Success("Xóa thành công.");
            });
        });
    };
    //#endregion

    //#endregion Gotit

    //#region Hoàn tất btnFinish_Click
    $scope.Gift.btnFinish_Click = async () => {
        try {
            UtilJS.Loading.Show();
            let strApiEndPoint = OutputFastSalesEndPoint + 'UsingGiftCodeFinish';
            let response = await CommonFactory.PostMethod(strApiEndPoint);

            $(".frmGiftIsUsed").modal('hide');
            $(".frmGiftIsNew").modal('hide');

            UtilJS.Loading.Hide();

            $timeout(() => {
                let frmUseVoucher = response.OrderBusItem.frmUseVoucher;
                $scope.TextboxGiftCode = frmUseVoucher.TotalDiscount;// + frmUseVoucher.TotalMoneyGiftAmount;
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);

                $scope.IsUsingGiftCodeFinish = true;
            });

            jAlert.Success("Sử dụng phiếu thành công");
        } catch (response) {
            jAlert.Notify(response.objCodeStep);
            UtilJS.Loading.Hide();
        }
    };
    //#endregion

    //#endregion IsNew

    //#region Used
    $scope.OpenIsUsed = function () {
        $scope.IsGiftReUsed = true;
        customValidate.Reset('frmGiftIsUsed');
        $('.frmGiftIsUsed').modal({ backdrop: 'static', keyboard: false });
    };

    //#region Check
    $scope.CheckUsed = () => {
        //if (!$('#frmGiftIsUsed').valid()) {
        //    $rootScope.scrollToTopInputValid();
        //    return;
        //}
        //#region check Mã PQT đã có trên grid chưa
        if (_.find($scope.Used.Lst, (x) => x.GiftCode == $scope.Used.GiftCode) != undefined) {
            jAlert.Warning(`Phiếu quà tặng ${$scope.Used.GiftCode} đã tồn tại trên lưới`);
            return;
        }
        //#endregion

        let PreOFSID = $scope.Used.PreOFSID;
        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'CheckRedeemReUsed';
        let objReq = {
            //Code: "0136947859",
            //Code: "1095980280",
            //PreOFSID: 1469,
            Code: $scope.Used.GiftCode,
            PreOFSID: PreOFSID
        };
        CommonFactory.PostMethod(strApiEndPoint, objReq)
            .then((response) => {
                UtilJS.Loading.Hide();
                if (response.objCodeStep.Data && response.objCodeStep.Data.Type == "ProcessPromotionTypeGotItLimit") {
                    $(".frmGiftIsUsed").modal('hide');
                    $('.frmProductApplyOnlineGift').modal({ backdrop: 'static', keyboard: false });

                    //gán để hiển thị số tiền trả trong popup pqt GotIt
                    $scope.frmProductApplyOnlineGift.Type = response.objCodeStep.Data.Type;
                    MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);

                    //$scope.frmProductApplyOnlineGift.Discount = response.OrderBusItem.frmProductApply.Discount;
                    $scope.frmProductApplyOnlineGift.Lst = response.OrderBusItem.frmProductApply.OutputSaleDetails;
                    return;
                }
                $scope.Used.Lst = response.OrderBusItem.frmUseVoucher.OutputSaleSodexos;
                $scope.frmUseVoucher = response.OrderBusItem.frmUseVoucher;
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    //#endregion Check

    //#region Delete
    $scope.Used.Delete = function (Code) {
        jConfirm('Thông báo', 'Bạn có chắc muốn xóa?', function (isOK) {
            if (!isOK) {
                return false;
            }
            $timeout(function () {
                UtilJS.Array.Remove($scope.Used.Lst, (x) => x.Code == Code);
                jAlert.Success("Xóa thành công");
            });
        });
    };
    //#endregion 

    //#endregion Used

    $scope.canclePQTALL = function () {
        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'UsingGiftCodeCancle';
        CommonFactory.PostMethod(strApiEndPoint)
            .then((response) => {
                $(".frmGiftIsUsed").modal('hide');
                $(".frmGiftIsNew").modal('hide');

                $scope.Gift.CC.Lst = [];
                $scope.Gift.Sodexo.Lst = [];
                $scope.Gift.Gotit.Lst = [];
                UtilJS.Loading.Hide();

                $scope.TextboxGiftCode = 0;
                MainTabBusItem.UpdateOrderInformation(response.OrderBusItem);
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };
    $scope.CancleGiftCcCurrent = function () {
        UtilJS.Loading.Show();
        let strApiEndPoint = OutputFastSalesEndPoint + 'CancleGiftCcCurrent';
        CommonFactory.PostMethod(strApiEndPoint)
            .then((response) => {
                $("#ppCheckOPT").modal('hide');
                $('.frmGiftIsNew').modal({ backdrop: 'static', keyboard: false });
                UtilJS.Loading.Hide();
            })
            .catch((response) => {
                jAlert.Notify(response.objCodeStep);
                UtilJS.Loading.Hide();
            });
    };

    $scope.frmCheckOTP = {};
    $scope.frmCheckOTP.showModal = async function () {
        try {
            UtilJS.Loading.Show();
            $('#ppCheckOPT').modal({ backdrop: 'static', keyboard: false });
            customValidate.Reset('frmCheckOTP');

            $scope.frmCheckOTP.btnOK_Enable = false;
            await $timeout(() => { }, 0);
            $scope.$apply();

            UtilJS.Loading.Hide();
            var rsPopup = await UtilFactory.WaittingPopup($scope.frmCheckOTP, "#ppCheckOPT");
            return rsPopup;
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmCheckOTP.timerCountdown = 0;
    $scope.frmCheckOTP.btnSendSMS_Click = async function () {
        try {
            //if (!$('#frmCheckOTP').valid()) {
            //    $rootScope.scrollToTopInputValid();
            //    return;
            //}
            if ($scope.frmCheckOTP.timerCountdown > 0) {
                jAlert.Warning("Vui lòng đợi sau 1 phút để gửi lại mã OTP");
                return;
            }
            UtilJS.Loading.Show();
            var objReq = {};
            let strApiEndPoint = OutputFastSalesEndPoint + `SendOTPCode`;
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            jAlert.Notify(response.objCodeStep);

            await $timeout(() => { }, 0);
            $scope.frmCheckOTP.timerCountdown = 60;
            $scope.frmCheckOTP.interval = setInterval(function () {
                $scope.frmCheckOTP.timerCountdown--;
                if ($scope.frmCheckOTP.timerCountdown <= 0) {
                    clearInterval($scope.frmCheckOTP.interval);
                }
            }, 1000);
            $scope.$apply();
            UtilJS.Loading.Hide();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmCheckOTP.VerifyBySmsCode = async function () {
        try {
            $scope.frmCheckOTP.btnOK_Enable = false;
            var SMSCode = $scope.frmCheckOTP.txtReceiveCode;
            if (SMSCode.length < 4) {
                return;
            }
            $scope.frmCheckOTP.btnOK_Enable = true;
            //if (response.IsPassOTP) {
            //    $scope.frmCheckOTP.btnOK_Enable = true;
            //}
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmCheckOTP.btnOK_Click = async function () {
        try {
            //if (!$('#frmCheckOTP').valid()) {
            //    $rootScope.scrollToTopInputValid();
            //    return;
            //} 
            var SMSCode = $scope.frmCheckOTP.txtReceiveCode;
            UtilJS.Loading.Show();
            let objReq = {};
            objReq.code = SMSCode;
            let strApiEndPoint = OutputFastSalesEndPoint + `VerifyBySmsCode`;
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            jAlert.Notify(response.objCodeStep);

            $scope.frmCheckOTP.txtReceiveCode = "";
            clearInterval($scope.frmCheckOTP.interval);
            $scope.frmCheckOTP.timerCountdown = 0;

            await $timeout(() => { }, 0);
            $scope.$apply();

            UtilJS.Loading.Hide();
            $scope.frmCheckOTP.rsPopup = true;

            $('#ppCheckOPT').modal('hide');
            await UtilFactory.WaitingConditional({}, () => !($("#ppCheckOPT").data('bs.modal') || {}).isShown);

            await $timeout(() => { }, 0);
            $scope.$apply();

            UtilJS.Loading.Hide();
            $scope.frmCheckOTP.rsPopup = true;
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    //#endregion Hau.Nguyen Add 25.09.2019 

    //#region frmComboPrice
    var getComboPrice = async function () {
        try {
            $scope.frmComboPrice.clear();
            UtilJS.Loading.Show();
            let objProductReq = {};
            objProductReq.productId = objProductCurReq.productId;
            objProductReq.quantityOrder = objProductCurReq.quantityOrder;
            let strApiEndPoint = OutputFastSalesEndPoint + 'GetPriceComboWeb';
            var response = await CommonFactory.PostMethod(strApiEndPoint, objProductReq);
            UtilJS.Loading.Hide();
            if (response.fixPriceType == "FixPrice4Product") {
                mix4AddProduct(response, objProductCurReq);
                return;
            }
            $scope.frmComboPrice.Lst = response.priceComboWebs;
            var rsPopup = await $scope.frmComboPrice.showModal();
            await $timeout(() => { }, 500);
            if (!rsPopup) {
                return;
            }
            if (rsPopup.fixPriceType == "FixPrice4ComboPromotions") {
                $scope.frmComboPrice.isType = 'FixPrice4ComboPromotions';
                rsPopup.type = "comboPromotionsByProductID";
                mix4AddProductCombo(rsPopup);
            }
            else if (rsPopup.fixPriceType == "FixPrice4Product") {
                mix4AddProduct(rsPopup, objProductCurReq);
            }
            await $timeout(() => { }, 0);
            $scope.$apply();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmComboPrice = {};
    $scope.frmComboPrice.clear = function () {
        $scope.frmComboPrice.isType = '';
        $scope.frmComboPrice.ConfirmPriceComboWebReq = null;
    };
    $scope.frmComboPrice.getPromotionOnlyProduct = async function () {
        try {
            //bo~ chon km combo de lay km sp
            $scope.frmPros.HideModal();
            await UtilFactory.WaitingConditional({}, () => !($(".frmPros").data('bs.modal') || {}).isShown);
            UtilJS.Loading.Show();
            let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmPrice4OnlyProduct';
            let objReq = $scope.frmComboPrice.ConfirmPriceComboWebReq;
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            await $timeout(() => { }, 500);
            UtilJS.Loading.Hide();
            if (response.fixPriceType == "FixPrice4Product") {
                $scope.frmComboPrice.isType = '';
                mix4AddProduct(response, objProductCurReq);
                return;
            }
            await $timeout(() => { }, 0);
            $scope.$apply();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmComboPrice.CustomFilter = function (item) {
        if ($scope.frmComboPrice.KeySearch) {
            if (!UtilJS.String.IsContain(item.ComboID, $scope.frmComboPrice.KeySearch)
                && !UtilJS.String.IsContain(item.ComboName, $scope.frmComboPrice.KeySearch)) {
                return false;
            }
        }
        return true;
    };
    $scope.frmComboPrice.showModal = async function () {
        try {
            $('#frmComboPrice').modal({ backdrop: 'static', keyboard: false });
            var rsPopup = await UtilFactory.WaittingPopup($scope.frmComboPrice, "#frmComboPrice");
            return rsPopup;
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.frmComboPrice.close = function () {
        $scope.frmComboPrice.rsPopup = false;
    }
    $scope.frmComboPrice.ChoosedItem = async function (item) {
        try {
            let objReq = {};
            objReq.comboID = item.ComboID;
            objReq.productID = item.ProductID;
            objReq.quantityOrder = $scope.PnProduct.NumberboxQuantity.Value;
            objReq.quantityCombo = item.Quantity;
            objReq.isReceiveNanOrganic = false;

            $scope.frmComboPrice.ConfirmPriceComboWebReq = objReq;
            UtilJS.Loading.Show();
            let strApiEndPoint = OutputFastSalesEndPoint + 'ConfirmPriceComboWeb';
            var response = await CommonFactory.PostMethod(strApiEndPoint, objReq);
            $scope.frmComboPrice.rsPopup = response;
            $('#frmComboPrice').modal('hide');
            await $timeout(() => { }, 0);
            $scope.$apply();
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    //#endregion frmComboPrice


    $scope.btnPromotion = {};
    $scope.btnPromotion_Click = function () {
        if (!$('#HeaderForm').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        if (!$scope.btnPromotion.Enabled) {
            return;
        }
        _presenter.GetOutputSalePromotions();
    };

    $scope.btnSave = {};
    $scope.btnSave_Click = function () {
        let countUnvalid = 0;

        if (!$('#HeaderForm').valid()) {
            countUnvalid++;
        }
        if (countUnvalid > 0) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        if (!$scope.btnSave.Enabled) {
            return;
        }
        _presenter.CreateOutputSale();
    };

    //#region GooglePlaceController
    $scope.btnShowSearchGooglePlace_Onclick = (type) => {
        $scope.PnGooglePlace.Show().then(() => {
            $scope.PnGooglePlace.Type = type;
            if ($scope.GooglePlaceChoose.Latitude && $scope.GooglePlaceChoose.Longitude) {
                $timeout(() => {
                    addMarker($scope.GooglePlaceChoose.Latitude, $scope.GooglePlaceChoose.Longitude, $scope.pnCustomer.Customer.CustomerAddressDetail);
                }, 500);
            }
        });
    };
    $scope.list_address_autocomplete = [];
    $scope.objSearchGooglePalce = {};
    $scope.GooglePlaceChoose = {};

    $controller('GooglePlaceController', { $scope: $scope });
    if (!$scope.PnGooglePlace) {
        $scope.PnGooglePlace = {};
    }
    if (!$scope.PnGooglePlace.CallBack) {
        $scope.PnGooglePlace.CallBack = {};
    }
    $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceCustomer_OnClick = async function () {

        var rsPopup = await $scope.ppConfirmAddress.showModal();
        if (!rsPopup) {
            return;
        }
        $scope.pnCustomer.Customer.ProvinceID = $scope.ppConfirmAddress.ProvinceID;
        $scope.pnCustomer.Customer.DistrictID = $scope.ppConfirmAddress.DistrictID;
        $scope.pnCustomer.Customer.WardID = $scope.ppConfirmAddress.WardID;

        $scope.pnCustomer.Customer.Address = $scope.ppConfirmAddress.txtAddressFinal;
        $scope.pnCustomer.Customer.CustomerAddressDetail = $scope.ppConfirmAddress.txtAddressFinal;
        $scope.pnCustomer.Customer.Latitude = $scope.GooglePlaceChoose.Latitude;
        $scope.pnCustomer.Customer.Longitude = $scope.GooglePlaceChoose.Longitude;

        $scope.isPassAdressConfirm = true;
        await $timeout(() => { }, 0);
        $scope.$apply();
        $timeout(() => {
            $('#HeaderForm').valid();
        });
    };
    //#endregion GooglePlaceController

    //#region Chuẩn Hóa Tên Khách hàng - SALEBTR-2546

    $scope.pnOrder.CheckBoxForeigner = {};
    $scope.pnOrder.CheckBoxForeigner.Checked = false;
    window.CustomerNameOnkeyPress = (event) => {
        let character = String.fromCharCode(event.keyCode);
        let n = character;
        n = n.normalize();
        n = n.toLowerCase();
        n = UtilJS.String.RemoveUnicode(n);
        var t = new RegExp(/^[a-zA-Z ]*$/);
        if (t.test(n)) {

        } else {
            event.preventDefault();
        }
    }
    $('#CustomerName').blur(function () {
        $scope.ValidCustomerName();
    });
    $('#CustomerName').bind('copy paste', function (e) {
        e.preventDefault();
    });
    $scope.ValidCustomerName = () => {
        let customerNameFinal = $scope.pnCustomer.Customer.CustomerName;
        if (customerNameFinal) {
            customerNameFinal = customerNameFinal.trim();
            customerNameFinal = customerNameFinal.replace(/\s+/g, ' ');
            let arr = customerNameFinal.split(' ');
            if (arr.length > 1) {
                if (arr[0].toLowerCase() == 'anh' || arr[0].toLowerCase() == 'chị') {
                    arr.splice(0, 1);
                }
            }
            $timeout(() => {
                arrToUpperCase = [];
                arr.forEach((word) => {
                    word = word.charAt(0).toUpperCase() + word.slice(1);
                    arrToUpperCase.push(word);
                });
                customerNameFinal = arrToUpperCase.join(' ');
                $scope.pnCustomer.Customer.CustomerName = customerNameFinal;
                console.log($scope.pnCustomer.Customer.CustomerName);
            });
        }
    }
    //#endregion

    //#region load page
    UtilJS.Loading.Show();
    $q.all({
        InitUtilityApp: _presenter.InitUtilityApp(),
        ReInitOrderBusItem : $scope.ReInitOrderBusItem(),
        wait: UtilFactory.WaitingLoadDirective([])
    }).then((Multiples) => {
        $scope.ComboProductType.Lst = [
            { Text: "Sản phẩm", Value: ProductType.SanPham },
            { Text: "Combo", Value: ProductType.Combo },
            /*{ Text: "Combo fix price", Value: ProductType.ComboPrice },*/
        ];
        $scope.ComboProductType.API.SetValue(0);

        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
        getAddressFilterData();
    });
    $(function () {
        customValidate.SetForm('HeaderForm', '');
        customValidate.SetForm('frmInvoice', '');
        customValidate.SetForm('ppConfirmAddressForm', '');
        $('.frmPros').modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });
        $('.frmPros').modal('hide');
        //#region Clear session uniqe close trinh duyet ko co tac dung   
        window.isRemoveSession = false;
        window.onbeforeunload = function (e) {
            if (!window.isRemoveSession) {
                let strApiEndPoint = OutputFastSalesEndPoint + 'RemoveSession';
                $.ajax({
                    url: strApiEndPoint,
                    type: 'post',
                    data: {},
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'TabBrowserKey': MasterData.TabBrowserKey
                    },
                    async: false,
                    dataType: 'json',
                    success: function (data) {
                        console.info(data);
                    }
                });
                e.preventDefault();
                e.stopPropagation();
                return undefined;
            }
        };
        //#endregion 
        $scope.arrDeliveryDateTicks = GetDeliveryDateTicks(5);
        $scope.dllDeliveryDate.Lst = $scope.arrDeliveryDateTicks;
    });

    //#endregion

    $(document.body).on('hide.bs.modal,hidden.bs.modal', function () {
        $('body').css('padding-right', '0');
    });
};
CreateController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$window", "$controller"];
addController("CreateController", CreateController);

function isValidEmailAddress(n) {
    if (!n) {
        return true;
    }
    var t = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return t.test(n);
}
function isValidPhone(n) {
    if (n == "0123456789") {
        return true;
    }
    if (!n) {
        return false;
    }
    //var t = new RegExp(/^(\+|0)(\d{7,15})$/);
    if (n.length < 10) {
        return false;
    }
    var t = new RegExp(/^(01[2689]|07|08|03|05|09)[0-9]{8}$/);
    return t.test(n);
}
function isValidContactPhone(n) {
    if (!n) {
        return true;
    }
    return isValidPhone(n);
}
function isValidWithoutspecialcharacters(n) {
    n = n.normalize();
    n = n.toLowerCase();
    n = UtilJS.String.RemoveUnicode(n);

    if (DataSetting.EInvoice_SpecialChar) {
        let arr = JSON.parse(DataSetting.EInvoice_SpecialChar)
        let variable = '';
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                variable += "\\" + arr[i];
            }
        }
        var expression = '^[a-zA-Z0-9\\-\\&\\s' + variable + ']+$';
        var t = new RegExp(expression);
        return t.test(n);
    }
    else {
        var t = new RegExp(/^[a-zA-Z0-9\-\&\s]+$/);
        return t.test(n);
    }
}
function validTaxNo() {
    let TaxNo_Personal = $('#taxno1').val();
    let TaxNo_Company = $('#taxno2').val();
    let TaxNo = TaxNo_Personal + "" + TaxNo_Company;
    if (!TaxNo) {
        return true;
    }
    if (TaxNo.length !== 13
        && TaxNo.length !== 10) {
        return false;
    }
    if (!/^[0-9]+$/.test(TaxNo)) {
        return false;
    }
    return true;
}
function fnValidCustomerName(n) {
    if (!n || n.length < 2) {
        return false;
    }
    return true;
}
function fnValidCustomerNameInvoiceReceiver(n) {
    if (!n) {
        return true;
    }
    n = n.normalize();
    n = n.toLowerCase();
    n = UtilJS.String.RemoveUnicode(n);

    if (DataSetting.EInvoice_SpecialCharCustomerName) {
        let arr = JSON.parse(DataSetting.EInvoice_SpecialCharCustomerName)
        let variable = '';
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                variable += "\\" + arr[i];
            }
        }
        var expression = '^[a-zA-Z\\s' + variable + ']+$';
        var t = new RegExp(expression);
        return t.test(n);
    }
    else {
        var t = new RegExp(/^[a-zA-Z ]*$/);
        return t.test(n);
    }
}
(function ($) {
    $.validator.addMethod("callfunc", function (value, element, params) {
        if (window[params] == undefined) return true;
        if (typeof window[params] === 'function') {
            return window[params](value);
        }
        return true;
    });
    $.validator.unobtrusive.adapters.add("callfunc", ["name"], function (options) {
        options.rules["callfunc"] = options.params.name;
        options.messages["callfunc"] = options.message;
    });
}(jQuery));