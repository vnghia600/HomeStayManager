var inputFormat = function ($filter) {
    return {
        require: '?ngModel',
        restrict: "A",
        link: function (scope, elem, attrs, ngModelCtrl) {
            if (ngModelCtrl == null) {
                return;
            }
            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            elem.bind('keypress', function (event) {
                var keyCode = event.which || event.keyCode;
                var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
                scope.allowdecimal = allowdecimal;
                if (((keyCode > 47) && (keyCode < 58)) || (keyCode == 8) || (keyCode == 9) || (keyCode == 190) || (keyCode == 39) || (keyCode == 37) || (keyCode == 43) || (allowdecimal && keyCode == 46))
                    setDisplayNumber(elem.val());
                else
                    event.preventDefault();

            });

            function setDisplayNumber(val, formatter) {
                var valStr = "", displayValue = "";

                if (val === "" || val === null || val === undefined) {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = scope.allowdecimal ? $filter(attrs.inputFormat)(displayValue ? displayValue : 0, 8) : $filter(attrs.inputFormat)(displayValue ? displayValue : 0);
                }

                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        if (valStr.slice(-1) === '.') {
                            displayValue += '.';
                        } else if (valStr.slice(-2) === '.0') {
                            displayValue += '.0';
                        } else if (valStr.slice(-3) === '.00') {
                            displayValue += '.00';
                        } else if (valStr.slice(-4) === '.000') {
                            displayValue += '.000';
                        } else if (valStr.slice(-5) === '.0000') {
                            displayValue += '.0000';
                        } else if (valStr.slice(-6) === '.00000') {
                            displayValue += '.00000';
                        } else if (valStr.slice(-7) === '.000000') {
                            displayValue += '.000000';
                        } else if (valStr.slice(-8) === '.0000000') {
                            displayValue += '.0000000';
                        }
                    }
                    // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue = valStr;
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }

                if (typeof formatter !== 'undefined') {
                    return (displayValue === '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue === '0') ? '0' : displayValue).trigger('change');
                }
            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                //----Math.round----
                //if (modelNum.toString().indexOf('.') !== -1) {
                //    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                //}
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };

    //return {
    //    require: '?ngModel',
    //    restrict: "A",
    //    link: function (scope, elem, attrs, ctrl) {
    //        function isFloat(n) {
    //            return Number(n) === n && n % 1 !== 0;
    //        }
    //        var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //        scope.allowdecimal = allowdecimal;
    //        scope.defaultValue = attrs["defaultValue"] ? attrs["defaultValue"] : false;
    //        if (!ctrl) return;

    //        elem.bind("keypress", function (event) {
    //            var keyCode = event.which || event.keyCode;
    //            var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //            if (((keyCode > 47) && (keyCode < 58)) || (keyCode == 8) || (keyCode == 9) || (keyCode == 190) || (keyCode == 39) || (keyCode == 37) || (keyCode == 43) || (allowdecimal && keyCode == 46))
    //                return true;
    //            else
    //                event.preventDefault();
    //        });

    //        ctrl.$formatters.unshift(function (a) {
    //            if (ctrl.$modelValue == undefined || ctrl.$modelValue.length == 0) {
    //                return "";
    //            }
    //            return $filter(attrs.inputFormat)(ctrl.$modelValue ? ctrl.$modelValue : 0);
    //        });

    //        ctrl.$parsers.unshift(function (viewValue) {
    //            var allowdecimal = (attrs["allowDecimal"] == 'true') ? true : false;
    //            if (scope.defaultValue && !parseInt(viewValue)) {
    //                viewValue = scope.defaultValue;
    //            }
    //            else if (!allowdecimal && isFloat(parseFloat(viewValue))) {
    //                viewValue = scope.defaultValue;
    //            }
    //            var plainNumber = viewValue.replace(/[^\d|\.|\-]/g, '');
    //            plainNumber = plainNumber || 0;
    //            if (plainNumber == '') return;
    //            var dots = plainNumber.match(/\./g);
    //            var dotAF = plainNumber.match(/\.$/g);
    //            dots = (dots != null && dots.length == 1 && dotAF != null) ? '.' : '';

    //            var temp = plainNumber.replace(/\.+/g, '.');
    //            var checkZero = temp.match(/^\d+\.0+$/g);
    //            if (!checkZero)
    //                temp = $filter(attrs.inputFormat)(plainNumber.replace(/\.+/g, '.'));

    //            elem.val(temp + dots).trigger('change');

    //            return parseFloat(plainNumber);
    //        });
    //    }
    //}
};
inputFormat.$inject = ['$filter'];