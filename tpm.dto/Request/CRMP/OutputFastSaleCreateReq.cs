using tpm.dto.admin.Common;
using tpm.dto.admin.Request.SCM;
using FluentValidation;
using System;
using System.Collections.Generic;

namespace CoC.Business.DTO
{
    public class OutputFastSaleCreateReq : BaseDTO
    {
        public int? OutputFastStatusID { get; set; }
        public int CustomerID { get; set; }// nếu KH mới = 0
        public string CustomerName { get; set; }
        public long? CustomerPhone { get; set; }// bigint NULL
        public string CustomerEmail { get; set; }
        public string CustomerAddress { get; set; }
        public int? CustomerGender { get; set; } //Giới tính nam =1, nữ = 2
        public string CustomerAddressDetail { get; set; }
        public double? AddressLongitude { get; set; } //kinh độ lấy từ google map
        public double? AddressLatitude { get; set; } //vĩ độ lấy từ google map

        public string InvoiceTax { get; set; }
        public string InvoiceName { get; set; }
        public string InvoiceAddress { get; set; }
        public string InvoiceEmail { get; set; }

        public decimal? OrderDiscount { get; set; } //tổng giảm giá đơn hàng theo % trong config
        public decimal? CustomerDiscount { get; set; } //tổng giảm giá % của khách hàng theo VIP  
        public string Description { get; set; }
        public int? PaymentTypeID { get; set; } //hình thức thanh toán

        public int TotalQuantity { get; set; } //tổng số lượng SP
        public decimal ProductDiscount { get; set; } //int NULL
        public decimal TotalDiscount { get; set; } //int NULL
        public decimal TotalTaxAmount { get; set; } //int NULL
        public decimal TotalAmount { get; set; } //int NULL
        public string ReceiptID { get; set; } //mã đơn hàng từ web

        public long? ContactPhone { get; set; } //int NULL
        public DateTime? RequiredOutputDate { get; set; } //DateTime NULL
        public string RequiredOutputDateByText { get; set; }// nvarchar(200) NULL
        public int? WardID { get; set; } // int NULL
        public int? DistrictID { get; set; } // int NULL
        public string DistrictName { get; set; } // int NULL
        public int? ProvinceID { get; set; } // int NULL
        public string ProvinceName { get; set; } // int NULL

        public string TransactionID { get; set; } // nvarchar(50) NULL
        public int? TransactionStatusID { get; set; } // Trạng thái giao dịch: 1-Giao dịch thành công; 2-Giao dịch thất bại
        public int? OutputStoreID { get; set; }//web bên a Thiên truyền null
        public int OutputFastTypeID { get; set; }//web bên a Thiên truyền 1
        //1 = Web PC, 2 = Web Mobile, 3 = iOS app, 4 = Android app, 5 = Nguồn AT, 6 = Nguồn Ecomobi, 9 = App tư vấn
        public int? CreatedFromEnvironment { get; set; }
        public bool? IsNeedCall { get; set; } // int NULL
        public decimal? TempDeliveryFee { get; set; } // phí giao hàng tạm tính dùng bên CC web

        public List<OutputFastSaleCreateDetailReq> Details { get; set; }
        public List<OutputFastSaleCreateDiscountReq> Discounts { get; set; }
    }
    public class OutputFastSaleCreateReqValidator : AbstractValidator<OutputFastSaleCreateReq>
    {
        public OutputFastSaleCreateReqValidator()
        {
            RuleFor(x => x.OutputFastTypeID).GreaterThan(0);

            RuleFor(x => x.CustomerID).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CustomerName).NotNull().NotEmpty().Length(0, 300);
            RuleFor(x => x.CustomerEmail).Length(0, 100);
            RuleFor(x => x.CustomerAddress).Length(0, 500);

            RuleFor(x => x.InvoiceTax).Length(0, 50);
            RuleFor(x => x.InvoiceName).Length(0, 300);
            RuleFor(x => x.InvoiceAddress).Length(0, 500);
            RuleFor(x => x.InvoiceEmail).Length(0, 100);
            RuleFor(x => x.Description).Length(0, 4000);

            RuleFor(x => x.PaymentTypeID).GreaterThan(0);
            RuleFor(x => x.TotalQuantity).GreaterThan(0);
            RuleFor(x => x.ProductDiscount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TotalDiscount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TotalTaxAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TotalAmount).GreaterThanOrEqualTo(0);

            //RuleFor(x => x.RequiredOutputDate).NotNull().NotEmpty();//bỏ theo rule mới
            RuleFor(x => x.WardID).GreaterThan(0);
            RuleFor(x => x.DistrictID).GreaterThan(0);
            RuleFor(x => x.ProvinceID).GreaterThan(0);
        }
    }
}
