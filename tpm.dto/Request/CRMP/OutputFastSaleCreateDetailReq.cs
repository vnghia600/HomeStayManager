using tpm.dto.admin.Common;
using FluentValidation;

namespace CoC.Business.DTO
{
    public class OutputFastSaleCreateDetailReq : BaseDTO
    {
        public int? OutputStoreID { get; set; } // Web ko cần truyền
        public int OutputTypeID { get; set; } //Xuất trực tiếp: 1, xuất online 2, tặng kèm 6
        public int? PID { get; set; } // Web ko cần tuyền
        public string ProductID { get; set; } // mã sản phẩm
        public string ReferencedID { get; set; } // Web ko cần truyền
        public string ManagerCode { get; set; }
        public int? PromotionID { get; set; } // ID chương trình khuyến mãi
        public string ApplyProductID { get; set; } // ID SP chính áp dụng đi với CTKM
        public bool? IsGift { get; set; } // SP là phiếu quà tặng
        public string ComboID { get; set; } // ID CTKM là combo
        public string ComboName { get; set; }
        public int? VAT { get; set; }//web ko tuyền
        public decimal? QuotedPrice { get; set; } // Giá niêm yết
        public decimal? SalePriceBFVAT { get; set; } //Giá bán trước VAT //web ko truyền
        public decimal? SalePriceVAT { get; set; } //Giá bán
        public decimal? TaxAmount { get; set; } //web ko tuyền
        public decimal? PriceAmount { get; set; } //web ko tuyền
        public int? Quantity { get; set; } // SL sản phẩm bán
        public int? ComboQuantity { get; set; }//sl lấy từ CTKM
        public double? DiscountPercent { get; set; } // Số % KM của SP theo CTKM PromotionID đang có
        public decimal? DiscountProduct { get; set; } // Số tiền giảm giá của SP = (DiscountPercent * QuotedPrice)/100
        public decimal? DiscountFromOrder { get; set; } // Số tiền giảm giá theo CTKM đơn hàng, phan bo KM cua don hang theo SL SP
        public decimal? DiscountFromCustomer { get; set; } // phan bo KM cua PQT|member VIP theo SL SP
        public bool IsDelivery { get; set; }//sp là phí giao hàng
        public decimal OrderPointMembership { get; set; } //số điểm tích lũy theo đơn hàng
    }
    public class OutputFastSaleCreateDetailReqValidator : AbstractValidator<OutputFastSaleCreateDetailReq>
    {
        public OutputFastSaleCreateDetailReqValidator()
        {
            RuleFor(x => x.OutputStoreID).GreaterThan(0);
            RuleFor(x => x.OutputTypeID).GreaterThan(0);
            RuleFor(x => x.PID).GreaterThan(0);
            RuleFor(x => x.ProductID).NotNull().NotEmpty().Length(0, 13);
            RuleFor(x => x.ReferencedID).Length(0, 20);

            RuleFor(x => x.VAT).GreaterThanOrEqualTo(0);
            RuleFor(x => x.QuotedPrice).GreaterThanOrEqualTo(0);
            RuleFor(x => x.SalePriceBFVAT).GreaterThanOrEqualTo(0);
            RuleFor(x => x.SalePriceVAT).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);

            RuleFor(x => x.PromotionID).GreaterThan(0);
        }
    }
}
