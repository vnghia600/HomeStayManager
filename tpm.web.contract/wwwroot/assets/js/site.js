const toggleBtn = document.querySelector('.toggle-btn');
let isToggleOn = true;

toggleBtn.addEventListener('click', function () {
    isToggleOn = !isToggleOn;
    toggleBtn.innerHTML = isToggleOn ? '<i class="fa-solid fa-toggle-on fa-lg"></i>' : '<i class="fa-solid fa-toggle-off fa-lg"></i>';
});



function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    // Lưu tab hiện tại vào sessionStorage
    var currentTab = '#' + evt.currentTarget.id;
    sessionStorage.setItem('defaultTab', currentTab);
}

// Xử lý sự kiện khi tải trang
window.onload = function () {
    // Kiểm tra xem tab mặc định đã được lưu trong sessionStorage chưa
    var defaultTab = sessionStorage.getItem('defaultTab');
    if (defaultTab) {
        // Nếu đã có tab mặc định, nhấp vào tab tương ứng để duy trì tab hiện tại
        document.querySelector(defaultTab).click();
    } else {
        // Nếu chưa có tab mặc định, nhấp vào tab đầu tiên để đặt tab mặc định
        document.getElementById("tab1").click();
    }
};

// hàm đóng popup
function closePopupE() {
    $("#myPopup").hide();
    $(".overlay").hide();
    $("body").removeClass("popup-active");

    $("#employeeID").val("");
    $("#fullName").val("");
    $("#phone").val("");
    $("#email").val("");
    $("#dob").val("");
}

function closePopupS() {
    $("#myPopup").hide();
    $(".overlay").hide();
    $("body").removeClass("popup-active");

    $("#unitPrice").val("");
    $("#quantity").val("");
    $("#totalAmount").val("");
}

function closePopupC() {
    $("#myPopupC").hide();
    $(".overlay").hide();
    $("body").removeClass("popup-active");

    $("#contractNumber").val("");
    $("#customerCompanyName").val("");
    $("#address").val("");
    $("#phone").val("");
    $("#mobilePhone").val("");
    $("#tin").val("");
    $("#email").val("");
}


// hàm mở popup create
function openCreatePopup() {
    $("#myPopup").show();
    $(".overlay").show();
    $("body").addClass("popup-active");
}

// hàm mở popup create contract
function openCreatePopupC() {
    $("#myPopupC").show();
    $(".overlay").show();
    $("body").addClass("popup-active");
}

// hàm mở popup edit contract
function openEditPopupC(contractID) {
    $("#myPopupC").show();
    $(".overlay").show();
    $("body").addClass("popup-active");
    selectedContractID = contractID;

    if (contractID) {
        getContractByID(contractID, function (getContract) {
            if (getContract) {
                var contractTypeName = getContract.contract_Type_Name;
                var $contractsTypeDropdown = $("#contractsTypeDropdown");


                $contractsTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === contractTypeName;
                    })
                    .prop("selected", true);

                $("#contractNumber").val(getContract.contract_Number);
                $("#customerCompanyName").val(getContract.customer_Company_Name);
                $("#address").val(getContract.address);
                $("#address2").val(getContract.address);
                $("#phone").val(getContract.phone);
                $("#mobilePhone").val(getContract.mobilePhone);
                $("#tin").val(getContract.tin);
                $("#email").val(getContract.email);
            }
        });
    }
}


// hàm lấy contract theo id
function getContractByID(contractID, callback) {
    $.ajax({
        url: "/Contracts/GetContract",
        type: "GET",
        dataType: "json",
        data: { Contract_ID: contractID },
        success: function (data) {
            var getContract = data.contract[0];

            if (typeof callback === "function") {
                callback(getContract);
            }
        },
        error: function (xhr, status, error) {
            console.log("Lỗi khi lấy dữ liệu:", error);
            alert("Lỗi khi lấy dữ liệu. Vui lòng kiểm tra console log.");
        },
    });
}


// hàm mở popup edit Employee
function openEditPopupE(id) {
    $("#myPopup").show();
    $(".overlay").show();
    $("body").addClass("popup-active");
    selectedID = id;


    if (id) {
        getEmployeeByID(id, function (getEmployee) {
            if (getEmployee) {
                var genderName = getEmployee.genderName;
                var departmentName = getEmployee.departmentName;
                var positionName = getEmployee.positionName;
                var employeeTypeName = getEmployee.employeeTypeName;
                var $genderTypeDropdown = $("#genderTypeDropdown");
                var $departmentTypeDropdown = $("#departmentTypeDropdown");
                var $positionTypeDropdown = $("#positionTypeDropdown");
                var $employeeTypeDropdown = $("#employeeTypeDropdown");
                var dob = new Date(getEmployee.dob);
                var year = dob.getFullYear().toString().padStart(4, "0");
                var month = (dob.getMonth() + 1).toString().padStart(2, "0");
                var day = dob.getDate().toString().padStart(2, "0");
                var formattedDOB = year + "-" + month + "-" + day;



                $genderTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === genderName;
                    })
                    .prop("selected", true);

                $departmentTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === departmentName;
                    })
                    .prop("selected", true);
                $positionTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === positionName;
                    })
                    .prop("selected", true);
                $employeeTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === employeeTypeName;
                    })
                    .prop("selected", true);
                $("#employeeID").val(getEmployee.employeeID);
                $("#dob").val(formattedDOB);
                $("#fullName").val(getEmployee.fullName);
                $("#phone").val(getEmployee.phone);
                $("#email").val(getEmployee.email);
            }
        });
    }
}

// hàm mở popup edit Service
function openEditPopupS(serviceID) {
    $("#myPopup").show();
    $(".overlay").show();
    $("body").addClass("popup-active");
    selectedServiceID = serviceID;

    if (serviceID) {
        getServiceByID(serviceID, function (getService) {
            if (getService) {
                var serviceTypeName = getService.service_Type_Name;
                var unit = getService.unit;
                var $serviceTypeDropdown = $("#serviceTypeDropdown");
                var $unitDropdown = $("#unitDropdown");

                $serviceTypeDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === serviceTypeName;
                    })
                    .prop("selected", true);

                $unitDropdown
                    .find("option")
                    .filter(function () {
                        return $(this).text().trim() === unit;
                    })
                    .prop("selected", true);

                $("#unitPrice").val(getService.unit_Price);
                $("#quantity").val(getService.quantity);
                $("#totalAmount").val(getService.total_Amount);
            }
        });
    }
}

// Hàm lấy gia trị value
function getIndexByValue(selectElement, value) {
    return selectElement.find("option[value='" + value + "']").index();
}

// hàm lấy dữ liệu theo id
function getEmployeeByID(id, callback) {
    $.ajax({
        url: "/Employees/GetEmployee",
        type: "GET",
        dataType: "json",
        data: { ID: id },
        success: function (data) {
            var getEmployee = data.employee[0];

            if (typeof callback === "function") {
                callback(getEmployee);
            }
        },
        error: function (xhr, status, error) {
            console.log("Lỗi khi lấy dữ liệu:", error);
            alert("Lỗi khi lấy dữ liệu. Vui lòng kiểm tra console log.");
        },
    });
}

// hàm lấy dữ liệu Service id
function getServiceByID(serviceID, callback) {
    $.ajax({
        url: "/Contracts/GetService",
        type: "GET",
        dataType: "json",
        data: { Service_ID: serviceID },
        success: function (data) {
            var getService = data.service[0];

            if (typeof callback === "function") {
                callback(getService);
            }
        },
        error: function (xhr, status, error) {
            console.log("Lỗi khi lấy dịch vụ:", error);
            alert("Lỗi khi lấy dịch vụ. Vui lòng kiểm tra console log.");
        },
    });
}

// hàm delete nhân viên
function deleteEmployee(event, id) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết

    var $deletedRow = $(event.target).closest('tr'); // Lấy thẻ cha là <tr> chứa dòng

    // Gửi Ajax request để xóa dịch vụ
    $.ajax({
        url: '/Employees/Delete',
        type: 'DELETE',
        dataType: 'json',
        data: { ID: id },
        success: function (result) {
            alert("Xóa thành công!");

            // Loại bỏ dòng vừa click xoá khỏi bảng
            $deletedRow.remove();
        },
        error: function () {
            alert("Lỗi: Xóa không thành công!");
        }
    });
}

// hàm delete dịch vụ
function deleteService(event, serviceID) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết

    var $deletedRow = $(event.target).closest('tr'); // Lấy thẻ cha là <tr> chứa dòng

    // Gửi Ajax request để xóa dịch vụ
    $.ajax({
        url: '/Contracts/Delete',
        type: 'DELETE',
        dataType: 'json',
        data: { serviceID: serviceID },
        success: function (result) {
            alert("Xóa dịch vụ thành công!");

            // Loại bỏ dòng vừa click xoá khỏi bảng
            $deletedRow.remove();
        },
        error: function () {
            alert("Lỗi: Xóa dịch vụ không thành công!");
        }
    });
}

// hàm delete contract
function deleteContract(event, contractID) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết

    var $deletedRow = $(event.target).closest('tr'); // Lấy thẻ cha là <tr> chứa dòng

    // Gửi Ajax request để xóa dịch vụ
    $.ajax({
        url: '/Contracts/DeleteContract',
        type: 'DELETE',
        dataType: 'json',
        data: { contractID: contractID },
        success: function (result) {
            alert("Xóa dịch vụ thành công!");

            // Loại bỏ dòng vừa click xoá khỏi bảng
            $deletedRow.remove();
        },
        error: function () {
            alert("Lỗi: Xóa dịch vụ không thành công!");
        }
    });
}

// hàm tính toán dịch vụ
function initializeScript() {
    $('#unitPrice').inputmask({
        alias: 'numeric',
        groupSeparator: ',',
        autoGroup: true,
        digits: 0,
        prefix: '',
        rightAlign: false
    });

    var unitPrice = parseFloat($('#unitPrice').val().replace(/,/g, ''));
    var quantity = parseFloat($('#quantity').val());
    var totalAmount = unitPrice * quantity;

    // Định dạng và gán giá trị mặc định cho totalAmount
    $('#totalAmount').val(totalAmount.toLocaleString() + ' VNĐ');

    $('#unitPrice, #quantity').on('input', calculateTotalAmount);

    function calculateTotalAmount() {
        var unitPrice = parseFloat($('#unitPrice').val().replace(/,/g, ''));
        var quantity = parseFloat($('#quantity').val());
        var totalAmount = unitPrice * quantity;

        $('#totalAmount').val(totalAmount.toLocaleString() + ' VNĐ');
    }
}




$(document).ready(function () {
    initializeScript();
});

