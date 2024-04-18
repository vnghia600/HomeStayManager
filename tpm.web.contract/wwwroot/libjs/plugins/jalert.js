//Alert
var ALERT_TITLE = "Oops!";
var ALERT_BUTTON_TEXT = "Xác nhận";

if (document.getElementById) {
    window.jAlert = function (txt, clas, loaiThongBao, icon, callback) {
        createCustomAlert(txt, clas, loaiThongBao, icon, callback);
    }
    window.jAlert.Status = { Success: "Success", Error: "Error", Warning: "Warning", Info: "Info" };
    window.jAlert.Success = function (message, callback) {
        BoxNotify.Callback = callback;
        BoxNotify.Success(message);
    }
    window.jAlert.Error = function (message, callback) {
        BoxNotify.Callback = callback;
        BoxNotify.Error(message);
    }
    window.jAlert.Warning = function (message, callback) {
        BoxNotify.Callback = callback;
        BoxNotify.Warning(message);
    }

    window.jAlert.Info = function (message, callback) {
        BoxNotify.Callback = callback;
        BoxNotify.Info(message);
    }
    window.jAlert.Notify = function (objCodeStep, callback) {
        BoxNotify.Callback = callback;
        if (objCodeStep.Status == window.jAlert.Status.Success)
            BoxNotify.Success(objCodeStep.Message);
        else if (objCodeStep.Status == window.jAlert.Status.Warning)
            BoxNotify.Warning(objCodeStep.Message);
        else if (objCodeStep.Status == window.jAlert.Status.Error)
            BoxNotify.Error(objCodeStep.Message);
        else if (objCodeStep.Status == window.jAlert.Status.Info)
            BoxNotify.Info(objCodeStep.Message);
    }
}

function createCustomAlert(txt, clas, loaiThongBao, icon, callback) {
    d = document;
    if (d.getElementById("modalContainer")) return;
    mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    mObj.id = "modalContainer";
    //mObj.style.height = d.documentElement.scrollHeight + "px";
    mObj.className = "lockscreenCustom";

    alertObj = mObj.appendChild(d.createElement("div"));
    alertObj.id = "alertBox";
    if (d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
    //alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth) / 2 + "px";
    //alertObj.style.visiblity = "visible";
    alertObj.className = "SmallBox animated fadeInRight fast " + clas;

    imageObj = alertObj.appendChild(d.createElement("div"));
    imageObj.id = "imageBox"
    imageObj.className = "foto";

    i = imageObj.appendChild(d.createElement("i"));
    i.className = "fa fa- " + icon + " swing animated";

    titleObj = alertObj.appendChild(d.createElement("div"));
    titleObj.className = "textoFoto";

    span = titleObj.appendChild(d.createElement("span"));
    span.appendChild(d.createTextNode(loaiThongBao));
    p = titleObj.appendChild(d.createElement("p"));
    p.style.maxHeight = 300 + "px";
    p.style.overflow = "auto";
    p.innerHTML = txt;

    p1 = titleObj.appendChild(d.createElement("p"));
    p1.className = "text-align-right";

    btn = p1.appendChild(d.createElement("a"));
    btn.id = "closeBtn";
    btn.appendChild(d.createTextNode(ALERT_BUTTON_TEXT));
    btn.href = "#";
    btn.focus();
    btn.className = "btn btn-primary btn-sm";
    btn.onclick = function () {
        removeCustomAlert();
        if (callback != undefined)
            callback(callback);
        return false;
    }

    alertObj.style.display = "block";
}
function removeCustomAlert() {
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}

function jConfirm(caption, message, callback) {
    $.SmartMessageBox({
        title: caption,
        content: message,
        buttons: '[Không][Đồng ý]'
    }, function (ButtonPressed) {
        if (ButtonPressed === "Đồng ý") {
            $('.MessageBoxButtonSection').remove();
            callback(true);
        }
        if (ButtonPressed === "Không") {
            callback(false);
        }
    });
    $('.MessageBoxButtonSection').find('#bot1-Msg1').focus();
}

var BoxNotify = {
    Callback: undefined,
    Ini: function (message, icon, style) {
        var div = '<div class="boxNotify animated fadeInDown ' + style + '" >';
        div += '<div class="boxIcon"><i class="' + icon + '"></i></div>';
        div += '<div class="boxText">';
        div += message;
        div += '</div></div>';
        var div = $(div);
        if ($("#divSmallBoxes").length > 0) {
            $("#divSmallBoxes").prepend(div);
            this.autoRemove(div, BoxNotify.Callback);
        } else {
            $("body").append('<div id="divSmallBoxes">' + div + '</div>');
            this.autoRemove(div, BoxNotify.Callback);
        }
    },
    Success: function (message) {
        this.Ini(message, 'fa fa-check-circle animated bounce', 'boxNotifySuccess');
    },
    Error: function (message) {
        this.Ini(message, 'fa fa-times-circle shake animated', 'boxNotifyError');
    },
    Warning: function (message) {
        this.Ini(message, 'fa fa-warning animated swing', 'boxNotifyWarning');
    },
    Info: function (message) {
        this.Ini(message, 'fa fa-info-circle animated rotateIn', 'boxNotifyInfo');
    },
    autoRemove: function (obj, callback) {
        $(obj).click(function () {
            $(obj).animate({
                right: "-=410",
            }, 500, function () {
                this.remove();
                if (callback != undefined && typeof callback === "function")
                    callback();
            });
        });
        var time = setTimeout(function () {
            $(obj).animate({
                right: "-=410",
            }, 500, function () {
                this.remove();
                if (callback != undefined && typeof callback === "function")
                    callback();
            });
        }, 5000);
        $(obj).hover(function () {
            clearTimeout(time);
        }, function () {
            $(obj).animate({
                right: "-=410",
            }, 500, function () {
                this.remove();
                if (callback != undefined && typeof callback === "function")
                    callback();
            });
        });
    }
};