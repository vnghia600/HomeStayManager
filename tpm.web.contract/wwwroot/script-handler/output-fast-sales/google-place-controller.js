var GooglePlaceController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory, $window, $compile) {
    if (!$scope.PnGooglePlace) {
        $scope.PnGooglePlace = {};
    }
    if (!$scope.PnGooglePlace.CallBack) {
        $scope.PnGooglePlace.CallBack = {};
    }

    var isMapLoaded = false;
    var map;
    var markers = [];
    var marker;
    var infowindow;
    var autocomplete;

    //mapboxgl
    var popup;

    $window.map;

    $rootScope.isMapGoogle = function () {
        return DataSetting.MapType == 1;
    }

    $scope.PnGooglePlace.Show = () => {
        let defer = $q.defer();
        $scope.PnGooglePlace.Service = 'AutoComplete';
        $scope.PnGooglePlace.IsAutocomplete = true;
        $scope.objSearchGooglePalce = { keySearch: '' };
        connectGoogleAPI();
        $('#PnGooglePlaceModal').modal({ backdrop: 'static', keyboard: false });
        $scope.PnGooglePlaceShowTimer = setInterval(() => {
            if (isMapLoaded) {
                clearInterval($scope.PnGooglePlaceShowTimer);
                defer.resolve();
            }
        }, 100);
        return defer.promise;
    };

    $scope.PnGooglePlace.ChangeService = () => {
        if ($scope.PnGooglePlace.IsAutocomplete) {
            $scope.PnGooglePlace.Service = 'AutoComplete';
        }
        else {
            $scope.PnGooglePlace.Service = 'Geocode';
        }
        if (!autocomplete) {
            $window.initAutocomplete();
        }
    };

    $window.initAutocomplete = function () {

        //map = new google.maps.Map(document.getElementById('map'), {
        //    center: { lat: 10.7553411, lng: 106.4150235 },
        //    zoom: 17,
        //    mapTypeId: 'roadmap'
        //});
        //$window.map = map;

        //var infowindow = new google.maps.InfoWindow();
        //var infowindowContent = document.getElementById('infowindow-content');
        //infowindow.setContent(infowindowContent);
        //marker = new google.maps.Marker({
        //    map: map,
        //    anchorPoint: new google.maps.Point(0, -29)
        //});

        // Create the autocomplete object, restricting the search predictions to
        // geographical location types.
        var input = document.getElementById('txtSeachAutoComplete');
        var options = {
            types: [],
            componentRestrictions: { country: 'vn' }
        };
        window.setTimeout(function () {
            document.getElementById('txtSeachAutoComplete').focus();
        }, 500);
        autocomplete = new google.maps.places.Autocomplete(input, options);

        // Set the data fields to return when the user selects a place.
        autocomplete.setFields(
            ['geometry', 'formatted_address', 'address_components']); //'formatted_address'

        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        autocomplete.addListener('place_changed', function () {
            //infowindow.close();
            //marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                //window.alert("Chọn địa chỉ chưa đúng: '" + place.name + "'");
                jAlert.Warning('Chọn địa chỉ chưa đúng');
                return;
            }

            if ($rootScope.isMapGoogle()) {
                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }
            }
            else {
                deleteMarkers();
                map.setCenter([place.geometry.location.lng(), place.geometry.location.lat()]);
                map.setZoom(17);
            }
            //marker.setPosition(place.geometry.location);
            //marker.setVisible(true);

            //console.log('lng:', place.geometry.location.lng(), 'lat:', place.geometry.location.lat());

            var address = '';
            //if (place.address_components) {
            //    address = [
            //        (place.address_components[0] && place.address_components[0].short_name || ''),
            //        (place.address_components[1] && place.address_components[1].short_name || ''),
            //        (place.address_components[2] && place.address_components[2].short_name || '')
            //    ].join(' ');
            //}
            if ($('#txtSeachAutoComplete').val()) {
                address = $('#txtSeachAutoComplete').val();
            }

            addMarker(place.geometry.location.lat(), place.geometry.location.lng(), address);

            $scope.GooglePlaceChoose = {};
            $scope.GooglePlaceChoose.Address = address;
            $scope.GooglePlaceChoose.Latitude = place.geometry.location.lat();
            $scope.GooglePlaceChoose.Longitude = place.geometry.location.lng();
            $scope.list_address_autocomplete = [];

            $timeout(() => {
                $scope.$apply();
            }, 0);
        });
    };
    $window.loadResourceDone = function () {
        if ($rootScope.isMapGoogle()) {
            $window.initMap();
        }
        else {
            connectMapboxglAPI();
        }
        $window.initAutocomplete();
    }
    $window.initMap = async function () {
        try {
            if ($rootScope.isMapGoogle()) {
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 17,
                    center: { lat: 10.7553411, lng: 106.4150235 },
                });
            }
            else {
                if (!DataSetting.MapboxglAccessToken) {
                    jAlert.Warning("mapboxgl token null");
                    return;
                }
                mapboxgl.accessToken = DataSetting.MapboxglAccessToken;
                map = new mapboxgl.Map({
                    container: 'map',
                    //style: 'mapbox://styles/mapbox/streets-v11', 
                    //style: 'http://10.10.13.2:10001/styles/klokantech-basic/style.json',
                    //style: 'http://192.168.12.135:8080/styles/klokantech-basic/style.json',
                    //style: 'https://maps..com/styles/basic/style.json',
                    style: 'https://maps..com/styles/osm-bright/style.json',
                    center: [106.4150235, 10.7553411],
                    zoom: 17,
                    attributionControl: false
                });
                map.addControl(new mapboxgl.AttributionControl({
                    //compact: true,
                    customAttribution: [
                        //`<a href="https://.com/" targer="_blank">Powerd by </a>`,
                        //`<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a>`,
                        //| <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>
                    ]
                }));
                map.addControl(new mapboxgl.FullscreenControl());
                map.addControl(new mapboxgl.NavigationControl());
            }
            $window.map = map;

            var geocoder = new google.maps.Geocoder();

            infowindow = new google.maps.InfoWindow();

            document.getElementById('btnSearchGoogleAPI').addEventListener('click', function () {
                geocodeAddress(geocoder, map);
            });

            $scope.PnGooglePlace.SearchGoogleAPI = () => {
                geocodeAddress(geocoder, map);
            };

            //var DistrictGoogleMap =
            //{
            //    ValueMap: "quận 9,quan 9,q.9,quận 2,quan 2,q.2",
            //    ValueReplace: "thủ đức"
            //};
            $scope.mappingDistrictGoogleMaps = {};
            var resultMDGoogleMaps = await $scope.GetMappingDistrictGoogleMaps();
            if (resultMDGoogleMaps) {
                $scope.mappingDistrictGoogleMaps = JSON.parse(resultMDGoogleMaps.Data);
            }

            isMapLoaded = true;
        } catch (e) {
            throw e;
        }
    };

    function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('txtGeocode').value;
        deleteMarkers();
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === 'OK') {
                let location = results[0].geometry.location;
                console.log('lng:', location.lng(), 'lat:', location.lat());

                if ($rootScope.isMapGoogle()) {
                    resultsMap.setCenter(results[0].geometry.location);
                }
                else {
                    resultsMap.setCenter([location.lng(), location.lat()]);
                }

                if (results[0].formatted_address) {
                    address = results[0].formatted_address;
                }
                addMarker(location.lat(), location.lng(), address);
                $timeout(() => {
                    $scope.GooglePlaceChoose = {};
                    $scope.GooglePlaceChoose.Address = address;
                    $scope.GooglePlaceChoose.Latitude = location.lat();
                    $scope.GooglePlaceChoose.Longitude = location.lng();
                    $scope.list_address_autocomplete = [];
                });

            } else {
                //alert('Geocode was not successful for the following reason: ' + status);
                $scope.GooglePlaceChoose = {};
                jAlert.Warning('Không tìm thấy địa chỉ ' + address);
            }
        });
    }

    // Adds a marker to the map and push to the array.
    $window.addMarker = function (lat, lng, address) {
        $scope.objSearchGooglePalce.keySearch = address;
        if (!$rootScope.isMapGoogle()) {
            addMarkerMapboxlg(lat, lng, address);
            return;
        }
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
        });
        markers.push(marker);

        infowindow.setContent(address);
        infowindow.open(map, marker);

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });

        map.panTo(new google.maps.LatLng(lat, lng));
    }

    function addMarkerMapboxlg(lat, lng, address) {
        var coordinates = [lng, lat];
        var el = document.createElement('div');
        el.className = 'marker';

        popup = new mapboxgl.Popup({})
            .setLngLat(coordinates)
            .setHTML(address);

        marker = new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);

        popup.addTo(map);
        markers.push(marker);

        map.panTo([lng, lat]);

    }
    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        if ($rootScope.isMapGoogle()) {
            setMapOnAll(null);
        }
        else {
            for (var i = 0; i < markers.length; i++) {
                markers[i].remove();
            }
        }
    }

    // Shows any markers currently in the array.
    function showMarkers() {
        setMapOnAll(map);
    }

    // Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    $scope.btnAcceptChoosePlace_OnClick = async () => {
        if (!$scope.objSearchGooglePalce.keySearch && $scope.list_address_autocomplete.length == 0) {
            jAlert.Warning('Vui lòng chọn địa chỉ');
            return;
        }
        if (!$scope.GooglePlaceChoose.Latitude || !$scope.GooglePlaceChoose.Longitude) {
            jAlert.Warning('Vui lòng chọn địa chỉ');
            return;
        }
        $('#PnGooglePlaceModal').modal('hide');
        if ($scope.PnGooglePlace.Type == 'Ahamove') {
            $('#PnOrderCreateFeeModal').modal({ backdrop: 'static', keyboard: false });
            if ($scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceAhamove_OnClick) {
                $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceAhamove_OnClick();
            }
        }
        else if ($scope.PnGooglePlace.Type == 'Grab') {
            $('#PnGrab_CreateOrderModal').modal({ backdrop: 'static', keyboard: false });
            if ($scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceGrab_OnClick) {
                $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceGrab_OnClick();
            }
        }
        else if ($scope.PnGooglePlace.Type == 'NhatTin') {
            //$('#PnNhatTin_CreateOrderModal').modal({ backdrop: 'static', keyboard: false });
            if ($scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceNhatTin_OnClick) {
                $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceNhatTin_OnClick();
            }
        }
        else if ($scope.PnGooglePlace.Type == 'Viettel') {
            //$('#PnNhatTin_CreateOrderModal').modal({ backdrop: 'static', keyboard: false });
            if ($scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceViettel_OnClick) {
                $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceViettel_OnClick();
            }
        }
        else if ($scope.PnGooglePlace.Type == 'Customer') {
            $('#PnOrderCreateFeeModal').modal({ backdrop: 'static', keyboard: false });
            if ($scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceCustomer_OnClick) {
                $scope.PnGooglePlace.CallBack.btnAcceptChoosePlaceCustomer_OnClick();
            }
        }

        //var rsPopup = await $scope.ppConfirmAddress.showModal();
        //if (!rsPopup) {
        //    return;
        //}

        //$scope.GooglePlaceChoose.ProvinceID = $scope.ppConfirmAddress.ProvinceID;
        //$scope.GooglePlaceChoose.DistrictID = $scope.ppConfirmAddress.DistrictID;
        //$scope.GooglePlaceChoose.WardID = $scope.ppConfirmAddress.WardID;
    };

    $scope.btnChoosePlace_OnClick = (item) => {
        if (item.Latitude != undefined && item.Longitude != undefined) {
            var lat = item.Latitude;
            var lng = item.Longitude;
            addMarker(lat, lng, item.Address);
            $scope.GooglePlaceChoose = {};
            $scope.GooglePlaceChoose.Address = item.Address;
            $scope.GooglePlaceChoose.Latitude = lat;
            $scope.GooglePlaceChoose.Longitude = lng;
        }
    };

    $('#PnGooglePlaceModal').on('hidden.bs.modal', function () {
        if ($scope.PnGooglePlace.Type == 'Ahamove') {
            $('#PnOrderCreateFeeModal').modal({ backdrop: 'static', keyboard: false });
        }
        else if ($scope.PnGooglePlace.Type == 'Grab') {
            $('#PnGrab_CreateOrderModal').modal({ backdrop: 'static', keyboard: false });
        }
        else if ($scope.PnGooglePlace.Type == 'Customer') {
            //call back here
        }
        else if ($scope.PnGooglePlace.Type == 'Viettel') {
            $('#PnViettel_CreateOrderModal').modal({ backdrop: 'static', keyboard: false });
        }
    });

    //#region mapboxgl 

    //#endregion mapboxgl

    //#region thay doi dia chi
    var isGetAddressFilterData;
    var typeMatch = ['tp.', 'thành phố', '70000', 'H.', 'Q.', 'huyện', 'quận', 'phường', 'xã', 'thị trấn', 'thị xã', 'tỉnh'];
    $window.getAddressFilterData = async function () {
        if (mAddress !== undefined) {
            return;
        }

        mAddress = await $q.all({
            Provinces_Get: DataFactory.Provinces_Get(),
            Districts_Get: DataFactory.Districts_Get(),
            Wards_Get: DataFactory.Wards_Get(),
            ProvinceMappingGoogle_Get: DataFactory.ProvinceMappingGoogle_Get(),
            DistrictMappingGoogle_Get: DataFactory.DistrictMappingGoogle_Get(),
            WardMappingGoogle_Get: DataFactory.WardMappingGoogle_Get(),
            wait: UtilFactory.WaitingLoadDirective([
                $scope.ddlProvince,
                $scope.ddlDistrict,
                $scope.ddlWard
            ])
        });

        mAddress.Provinces_Get.Data.filter(f => {
            f.dataMatch = mAddress.ProvinceMappingGoogle_Get.Data.filter(x => x.ProvinceID == f.ProvinceID).map(m => m.InfoMatch);
        });
        mAddress.Districts_Get.Data.filter(f => {
            f.dataMatch = mAddress.DistrictMappingGoogle_Get.Data.filter(x => x.DistrictID == f.DistrictID).map(m => m.InfoMatch);
        });
        mAddress.Wards_Get.Data.filter(f => {
            f.dataMatch = mAddress.WardMappingGoogle_Get.Data.filter(x => x.WardID == f.WardID).map(m => m.InfoMatch);
        });
        $scope.ddlProvince.Lst = [];
        $scope.ddlDistrict.Lst = [];
        $scope.ddlWard.Lst = [];

        $scope.ddlProvince.API.SetValue("", true);
        $scope.ddlDistrict.API.SetValue("", true);
        $scope.ddlWard.API.SetValue("", true);

        isGetAddressFilterData = true;
        return mAddress;
    }
    function getPlaceContain(place, lst, propKey) {
        //Tìm theo độ dài nhất của chuỗi giảm dần
        //VD: fix case lỗi nhập quận 11 -> bộ tìm thấy quận 1 trước lấy ra so thấy đang map đúng trả ra kết quả quận 1 -> đang sai.
        lst = lst.sort(function (a, b) {
            return b[propKey + 'Name'].length - a[propKey + 'Name'].length;
        });

        //ktra Tỉnh có Huyện và thành phố trùng tên nhau thì ko map -> return false
        lst.filter((x) => {
            x[propKey + 'Name_RemovedTypeName'] = x[propKey + 'Name'].replace(x.TypeName, '');
        });
        var duplicates = getDuplicateArrayElements(lst.ctmSelect(x => x[propKey + 'Name_RemovedTypeName']));
        if (duplicates && duplicates.length > 0) {
            return false;
        }

        return lst.ctmFind(x => {
            let isExist;
            let strCompare = place.nameLower;
            let strNameOriginal = x[propKey + 'NameOriginal'].ctmToLower();
            let strName = x[propKey + 'Name'].ctmToLower();
            if (UtilJS.String.IsContain(strCompare + ",", strName + ",")) {
                isExist = true;
            }
            else {
                let tm = typeMatch.ctmFind(tm => UtilJS.String.IsContain(strCompare, tm));
                if (tm !== undefined) {
                    strCompare = strCompare.replace(tm, '');
                }
                if (UtilJS.String.IsContain(strCompare + ",", strNameOriginal + ",")) {
                    isExist = true;
                }
                else if (x.dataMatch.ctmFind(dm => UtilJS.String.IsContain(strCompare + ",", dm + ",")) !== undefined) {
                    isExist = true;
                }
            }
            if (isExist) {
                place.type = propKey;
                place.objSelected = x;
                return true;
            }
            return false;
        });
    }
    var mAddress;
    var addressArr = [];
    $scope.ddlProvince = { Core: {}, CallBack: {} };
    $scope.ddlProvince.Core.Text = 'ProvinceName';
    $scope.ddlProvince.Core.IDValue = 'ProvinceID';
    $scope.ddlProvince.CallBack.OnValuechanged = function (ProvinceID) {
        console.log("ddlProvince.CallBack.OnValuechanged");
        $scope.ppConfirmAddress.ProvinceID = ProvinceID;
        let f1 = $scope.ddlProvince.Lst.ctmFind(x => x.ProvinceID == ProvinceID);
        let value = f1 != undefined ? f1.ProvinceName : null;
        if (f1 != undefined)
            $scope.ppConfirmAddress.ProvinceName = f1.ProvinceName;
        let u = addressArr.ctmFind(x => x.type === "Province");
        if (u) {
            u.name = value;
        }
        else {
            addressArr.push({
                name: value,
                type: "Province"
            });
        }

        $scope.ddlDistrict.Lst = [];
        $scope.ddlDistrict.API.SetValue("", true);
        if (f1 != undefined) {
            let districts = mAddress.Districts_Get.Data.filter(x => x.ProvinceID == f1.ProvinceID);
            $scope.ddlDistrict.Lst = districts;
        }
        $scope.ddlDistrict.CallBack.OnValuechanged();
        $scope.txtStreetNumber.onChange();
    };

    $scope.ddlDistrict = { Core: {}, CallBack: {} };
    $scope.ddlDistrict.Core.Text = 'DistrictName';
    $scope.ddlDistrict.Core.IDValue = 'DistrictID';
    $scope.ddlDistrict.CallBack.OnValuechanged = function (DistrictID) {
        //console.log(`ddlDistrict.CallBack.OnValuechanged DistrictID ${DistrictID} $scope.ddlDistrict.Value ${$scope.ddlDistrict.Value}`);
        $scope.ppConfirmAddress.isPassWard = false;
        $scope.ppConfirmAddress.DistrictID = DistrictID;
        let f1 = $scope.ddlDistrict.Lst.ctmFind(x => x.DistrictID == DistrictID);
        let value = f1 != undefined ? f1.DistrictName : null;
        if (f1 != undefined)
            $scope.ppConfirmAddress.DistrictName = f1.DistrictName;
        let u = addressArr.ctmFind(x => x.type === "District");
        if (u) {
            u.name = value;
        }
        else {
            addressArr.push({
                name: value,
                type: "District"
            });
        }
        $scope.ddlWard.Lst = [];
        $scope.ddlWard.API.SetValue("", true);
        if (f1 != undefined) {
            let wards = mAddress.Wards_Get.Data.filter(x => x.DistrictID == f1.DistrictID);
            $scope.ddlWard.Lst = wards;
            //#region cho lên đơn với trường hợp đã chọn tỉnh thành nhưng địa chỉ không có Phường/Xã vẫn cho lên đơn hàng
            if (wards.length == 0) {
                $scope.ppConfirmAddress.isPassWard = true;
            }
            //#endregion
        }
        $scope.ddlWard.CallBack.OnValuechanged();
        $scope.txtStreetNumber.onChange();
    };

    $scope.ddlWard = { Core: {}, CallBack: {} };
    $scope.ddlWard.Core.Text = 'WardName';
    $scope.ddlWard.Core.IDValue = 'WardID';
    $scope.ddlWard.CallBack.OnValuechanged = function (WardID) {
        //console.log(`ddlWard.CallBack.OnValuechanged`, { WardID: WardID, value: $scope.ddlWard, lst: $scope.ddlWard.Lst });
        $scope.ppConfirmAddress.WardID = WardID;
        let f1 = $scope.ddlWard.Lst.ctmFind(x => x.WardID == WardID);
        let value = f1 != undefined ? f1.WardName : null;
        if (f1 != undefined)
            $scope.ppConfirmAddress.WardName = f1.WardName;
        let u = addressArr.ctmFind(x => x.type === "Ward");
        if (u) {
            u.name = value;
        }
        else {
            addressArr.push({
                name: value,
                type: "Ward"
            });
        }
        $scope.txtStreetNumber.onChange();
    };

    $scope.txtStreetNumber = {};
    $scope.txtStreetNumber.text = "";
    $scope.txtStreetNumber.onChange = function () {
        let strFinal = $scope.txtStreetNumber.text;
        ["Ward", "District", "Province", "Country"].forEach(key => {
            let fe = addressArr.ctmFind(x => x.type === key);
            if (fe != undefined && fe.name) {
                if (strFinal) {
                    strFinal += ", " + fe.name
                }
                else {
                    strFinal += fe.name
                }
            }
        });
        $scope.ppConfirmAddress.txtAddressFinal = strFinal;
    }
    $window.detechInfoAdress = async function (address) {
        let provinceSelected, districtSelected, wardSelected;
        let provinces, districts, wards;
        address = address.replace(/  +/g, ' ');
        var i = 0;
        addressArr = [];
        address.split(",").filter(x => {
            let strCompare = x.replace(/  +/g, ' ');
            let obj = { index: i, name: strCompare, nameLower: strCompare.ctmToLower() };
            if (UtilJS.String.IsContain(strCompare, "việt nam")) {
                obj.type = "Country";
            }
            addressArr.push(obj);
            i++;
        });

        //match địa chỉ
        provinces = mAddress.Provinces_Get.Data;

        var isHasProvince;
        var isHasDistrict;
        var isHasWard;
        let addressF1 = addressArr.filter(f => !f.type);
        for (var i = addressF1.length - 1; i >= 0; i--) {
            let place = addressF1[i];
            isHasProvince = addressArr.ctmFind(cf => cf.type == "Province") !== undefined;
            isHasDistrict = addressArr.ctmFind(cf => cf.type == "District") !== undefined;
            isHasWard = addressArr.ctmFind(cf => cf.type == "Ward") !== undefined;
            if (isHasProvince && isHasDistrict && isHasWard) {
                place.type = null;
            }
            else if (!isHasProvince) {
                provinceSelected = getPlaceContain(place, provinces, 'Province');
            }
            else if (isHasProvince && !isHasDistrict) {
                districts = mAddress.Districts_Get.Data.filter(x => x.ProvinceID == provinceSelected.ProvinceID);
                //let placeOrigin = _.clone(place);
                if ($scope.mappingDistrictGoogleMaps) {
                    if ($scope.mappingDistrictGoogleMaps.ValueMap && $scope.mappingDistrictGoogleMaps.ValueReplace) {
                        if (UtilJS.String.IsContain($scope.mappingDistrictGoogleMaps.ValueMap.ctmToLower().trim(), place.nameLower.trim())) {
                            place.name = $scope.mappingDistrictGoogleMaps.ValueReplace;
                            place.nameLower = $scope.mappingDistrictGoogleMaps.ValueReplace.ctmToLower();
                        }
                    }
                }
                districtSelected = getPlaceContain(place, districts, 'District');
                //place.name = placeOrigin.name;
                //place.nameLower = placeOrigin.nameLower;
            }
            else if (isHasProvince && isHasDistrict && !isHasWard) {
                wards = mAddress.Wards_Get.Data.filter(x => x.DistrictID == districtSelected.DistrictID);
                wardSelected = getPlaceContain(place, wards, 'Ward');
            }
        }
        let isPassWard = false;
        if (districtSelected === undefined && provinceSelected !== undefined) {
            districts = mAddress.Districts_Get.Data.filter(x => x.ProvinceID == provinceSelected.ProvinceID);
        }
        if (wardSelected === undefined && districtSelected !== undefined) {
            wards = mAddress.Wards_Get.Data.filter(x => x.DistrictID == districtSelected.DistrictID);
            if (wards.length == 0) {
                isPassWard = true;
            }
        }
        //provinces districts wards
        //provinceSelected districtSelected wardSelected
        return {
            provinces,
            districts,
            wards,
            provinceSelected,
            districtSelected,
            wardSelected,
            isPassWard
        };
    }
    function isPlaceContain4CheckInfo(strAdress, x, propKey) {
        let isExist;
        let strCompare = strAdress.ctmToLower();
        let strNameOriginal = x[propKey + 'NameOriginal'].ctmToLower();
        let strName = x[propKey + 'Name'].ctmToLower();
        if (UtilJS.String.IsContain(strCompare + ",", strName + ",")) {
            isExist = true;
        }
        else {
            let tm = typeMatch.ctmFind(tm => UtilJS.String.IsContain(strCompare, tm));
            if (tm !== undefined) {
                strCompare = strCompare.replace(tm, '');
            }
            if (UtilJS.String.IsContain(strCompare + ",", strNameOriginal + ",")) {
                isExist = true;
            }
            else if (x.dataMatch.ctmFind(dm => UtilJS.String.IsContain(strCompare + ",", dm + ",")) !== undefined) {
                isExist = true;
            }
        }
        if (isExist) {
            return true;
        }
        return false;
    }
    $window.detechInfoAdressByID = async function (address, provinceID, districtID, wardID) {
        try {
            let provinces, districts, wards;
            address = address.replace(/  +/g, ' ');
            //match địa chỉ
            provinces = mAddress.Provinces_Get.Data;
            let province = provinces.ctmFind(x => x.ProvinceID == provinceID);
            if (!province || !isPlaceContain4CheckInfo(address, province, 'Province')) {
                return false;
            }

            districts = mAddress.Districts_Get.Data;
            let district = districts.ctmFind(x => x.DistrictID == districtID);
            if (!district || !isPlaceContain4CheckInfo(address, district, 'District')) {
                return false;
            }

            wards = mAddress.Wards_Get.Data;
            let ward = wards.ctmFind(x => x.WardID == wardID);
            if (!ward || !isPlaceContain4CheckInfo(address, ward, 'Ward')) {
                if ($scope.ppConfirmAddress.isPassWard) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    $scope.ppConfirmAddress = {};
    $scope.ppConfirmAddress.showModal = async function () {
        try {
            UtilJS.Loading.Show();
            $scope.ppConfirmAddress.IsPass = false;
            await UtilFactory.WaitingConditional({}, () => !($("#PnGooglePlaceModal").data('bs.modal') || {}).isShown);
            $('#ppConfirmAddress').modal({ backdrop: 'static', keyboard: false });

            customValidate.Reset('ppConfirmAddressForm');

            await $window.getAddressFilterData();
            await UtilFactory.WaitingConditional({}, () => isGetAddressFilterData !== undefined);

            let address = $scope.GooglePlaceChoose.Address;

            var result_detechAdress = await detechInfoAdress(address);

            //provinces districts wards
            //provinceSelected districtSelected wardSelected

            $scope.ddlProvince.Lst = result_detechAdress.provinces;
            $scope.ddlDistrict.Lst = [];
            $scope.ddlWard.Lst = [];


            $scope.ppConfirmAddress.ProvinceID = "";
            $scope.ppConfirmAddress.DistrictID = "";
            $scope.ppConfirmAddress.WardID = "";

            $scope.ppConfirmAddress.ProvinceName = "";
            $scope.ppConfirmAddress.DistrictName = "";
            $scope.ppConfirmAddress.WardName = "";

            if (result_detechAdress.provinceSelected != undefined) {
                $scope.ddlDistrict.Lst = result_detechAdress.districts;
                if (result_detechAdress.districtSelected != undefined) {
                    $scope.ddlWard.Lst = result_detechAdress.wards;
                }
            }
            $rootScope.beginBlockAllSelect2();

            //console.log(`$scope.ppConfirmAddress next`, { WardID: $scope.ppConfirmAddress.WardID, value: $scope.ddlWard, lst: $scope.ddlWard.Lst });

            //await $timeout(() => { }, 0);
            //$scope.$apply();
            await $timeout(() => { }, 1000);
            if (result_detechAdress.provinceSelected != undefined) {
                $scope.ppConfirmAddress.ProvinceID = result_detechAdress.provinceSelected.ProvinceID;
                $scope.ppConfirmAddress.ProvinceName = result_detechAdress.provinceSelected.ProvinceName;
                if (result_detechAdress.districtSelected != undefined) {
                    $scope.ppConfirmAddress.DistrictID = result_detechAdress.districtSelected.DistrictID;
                    $scope.ppConfirmAddress.DistrictName = result_detechAdress.districtSelected.DistrictName;
                    if (result_detechAdress.wardSelected != undefined) {
                        $scope.ppConfirmAddress.WardID = result_detechAdress.wardSelected.WardID;
                        $scope.ppConfirmAddress.WardName = result_detechAdress.wardSelected.WardName;
                    }
                    $scope.ppConfirmAddress.isPassWard = result_detechAdress.isPassWard;
                }
            }

            //console.log(`$scope.ppConfirmAddress`, { WardID: $scope.ppConfirmAddress.WardID, value: $scope.ddlWard, lst: $scope.ddlWard.Lst });

            $scope.ddlProvince.API.SetValue($scope.ppConfirmAddress.ProvinceID, true);
            $scope.ddlDistrict.API.SetValue($scope.ppConfirmAddress.DistrictID, true);
            if (!$scope.ppConfirmAddress.isPassWard) {
                $scope.ddlWard.API.SetValue($scope.ppConfirmAddress.WardID, true);
            }
            else {
                $scope.ddlWard.API.SetValue(null, true);
            }

            //console.log(`$scope.ppConfirmAddress SetValue`, { WardID: $scope.ppConfirmAddress.WardID, value: $scope.ddlWard, lst: $scope.ddlWard.Lst });

            $rootScope.endBlockAllSelect2();

            $scope.txtStreetNumber.text = "";
            addressArr.filter(f => !f.type).forEach(fe => {
                if ($scope.txtStreetNumber.text) {
                    $scope.txtStreetNumber.text += ", " + fe.name
                }
                else {
                    $scope.txtStreetNumber.text += fe.name
                }
            });
            $scope.txtStreetNumber.onChange();
            $scope.ppConfirmAddress.AddressGoogle = $scope.GooglePlaceChoose.Address;

            if ($scope.txtStreetNumber.text && addressArr.filter(f => !f.type).length > 1 && (!$scope.ppConfirmAddress.ProvinceID || !$scope.ppConfirmAddress.DistrictID || !$scope.ppConfirmAddress.WardID)) {
                let objReq = {};
                objReq.GoogleAddress = $scope.GooglePlaceChoose.Address;
                objReq.InfoMatchFail = $scope.txtStreetNumber.text;
                let strApiEndPoint = '/OutputFastSales/UpdateGoogleAddressNotMatch';
                await CommonFactory.PostMethod(strApiEndPoint, objReq);
            }

            //#region hotfix - xử lý người dùng không được thay đổi địa chỉ nếu địa chỉ từ google đã đúng
            //Tránh T/H, chọn goole -> có lat,long, vào thay đổi -> sẽ sai so với tọa độ của google
            $scope.ddlProvince.Core.IsDisabled = false;
            $scope.ddlDistrict.Core.IsDisabled = false;
            $scope.ddlWard.Core.IsDisabled = false;
            if ($scope.ddlProvince.Lst.length > 0 && $scope.ddlProvince.Value) {
                if ($scope.ddlDistrict.Lst.length > 0) {
                    $scope.ddlProvince.Core.IsDisabled = true;
                }
            }
            if ($scope.ddlDistrict.Lst.length > 0 && $scope.ddlDistrict.Value) {
                if ($scope.ddlWard.Lst.length > 0) {
                    $scope.ddlDistrict.Core.IsDisabled = true;
                }
            }
            if ($scope.ddlWard.Lst.length > 0 && $scope.ddlWard.Value) {
                $scope.ddlWard.Core.IsDisabled = true;
            }
            //#endregion hotfix - xử lý người dùng không được thay đổi địa chỉ nếu địa chỉ từ google đã đúng

            UtilJS.Loading.Hide();

            var rsPopup = await UtilFactory.WaittingPopup($scope.ppConfirmAddress, "#ppConfirmAddress");
            return rsPopup;
        } catch (response) {
            console.log(response);
            UtilJS.Loading.Hide();
            jAlert.Notify(response.objCodeStep);
        }
    }
    $scope.ppConfirmAddress.IsPass_OnChange = async function () {
        customValidate.Reset('ppConfirmAddressForm');
    }
    $scope.ppConfirmAddress.confirm = async function () {
        if (!$scope.ppConfirmAddress.IsPass && !$('#ppConfirmAddressForm').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        await $timeout(() => { }, 0);
        $scope.$apply();
        $('#ppConfirmAddress').modal('hide');
        $scope.ppConfirmAddress.rsPopup = true;
    }
    //#endregion thay doi dia chi

    //#region ECOM-483 - Cập nhật thông tin địa chỉ khách hàng cho đơn hàng & đi đơn tự động - 210729-ManualRollbackData
    $scope.ppConfirmAddress.btnManualRollbackData_OnClick = async function () {
        if (!$('#ppConfirmAddressForm').valid()) {
            $rootScope.scrollToTopInputValid();
            return;
        }
        let messageConfirm = DataSetting.MessageConfirm_ManualRollbackData;
        jConfirm('Thông báo', messageConfirm, async function (isOK) {
            if (isOK) {
                await $timeout(() => { }, 0);
                $scope.$apply();
                $('#ppConfirmAddress').modal('hide');
                $scope.ppConfirmAddress.IsManualRollbackData = true;
                $scope.ppConfirmAddress.rsPopup = true;
            }
            else {
                await $timeout(() => { }, 0);
                $scope.$apply();
                $scope.ppConfirmAddress.IsManualRollbackData = false;
                $scope.ppConfirmAddress.rsPopup = false;
            }
        });
    }
    //#endregion ECOM-483 - Cập nhật thông tin địa chỉ khách hàng cho đơn hàng & đi đơn tự động - 210729-ManualRollbackData

    $(function () {
        customValidate.SetForm('ppConfirmAddressForm', '');
    });
    function connectMapboxglAPI() {
        //DataSetting.MapboxglAccessToken = 'pk.eyJ1IjoiaGF1bnZkZXYiLCJhIjoiY2thNzZnMTFkMDAzYzJycGozNzNkZDBvNyJ9.VRWVcMWesnoElcDg-PzZsw';
        if (DataSetting.IsHasMapboxgl) {
            return;
        }
        let src = "https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js";
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = src;
        $("head").append(s);

        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: "https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css"
        }).appendTo("head");

        DataSetting.IsHasMapboxgl = true;
        $scope.MapboxglTimer = setInterval(() => {
            try {
                if (mapboxgl != undefined) {
                    clearInterval($scope.MapboxglTimer);
                    $window.initMap();
                }
            } catch (e) {

            }
        }, 100);
    }
    function connectGoogleAPI() {
        if (DataSetting.isLocal) {
            DataSetting.keyGooglePlaceID = 'AIzaSyCxn3R_qTP0tFWObfM-GM67FhFy_WGreho';
        }
        let src_map = `https://maps.googleapis.com/maps/api/js?key=${DataSetting.keyGooglePlaceID}&language=vi&libraries=places&callback=loadResourceDone`;
        //if ($scope.PnGooglePlace.Service == 'AutoComplete') {
        //    src_map = `https://maps.googleapis.com/maps/api/js?key=${DataSetting.keyGooglePlaceID}&language=vi&libraries=places&callback=initAutocomplete`;
        //}
        let urlExist = addLinkScript(src_map);
        if (!urlExist) {
            let src = src_map;
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = src;
            $("head").append(s);
        }
    }
    function addLinkScript(url) {
        if (!url) url = "https://maps.googleapis.com";
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length; i--;) {
            if (scripts[i].src == url) return true;
        }
        return false;
    }

    $(document.body).on('shown.bs.modal', function () {
        if ($('.modal:visible').length) {
            $('body').addClass('modal-open');
        }
    });

    function getDuplicateArrayElements(arr) {
        var sorted_arr = arr.slice().sort();
        var results = [];
        for (var i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] === sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    }

    $scope.GetMappingDistrictGoogleMaps = async () => {
        try {
            UtilJS.Loading.Show();
            let url = `/OnlineOrderAutoConfigs/GetMappingDistrictGoogleMaps`;
            var response = await CommonFactory.PostMethod(url, {});
            UtilJS.Loading.Hide();
            return response.objCodeStep;
        } catch (e) {
            UtilJS.Loading.Hide();
            let objCodeStep = {};
            objCodeStep.Data = {};
            return objCodeStep.Data;
        }
    };
};
GooglePlaceController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory", "$window", "$compile"];
addController("GooglePlaceController", GooglePlaceController);

function validWard(val) {
    if (!val) {
        let isPassWard = $('#txtWard').attr('data-ispassward');
        if (isPassWard != "true")
            return false;
    }
    return true;
}