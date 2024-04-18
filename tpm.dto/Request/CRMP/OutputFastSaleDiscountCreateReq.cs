using tpm.dto.admin.Common;
using FluentValidation;

namespace CoC.Business.DTO
{
    public class OutputFastSaleDiscountCreateReq : BaseDTO
    {
        public int? DiscountTypeID { get; set; }
        public int? PromotionID { get; set; }
        public string ManagerCode { get; set; }
        public string CodeCard { get; set; }
        public decimal? DiscountValue { get; set; }
        public double? DiscountPercent { get; set; }
        public bool IsSale { get; set; }
    }
    public class OutputFastSaleDiscountCreateReqValidator : AbstractValidator<OutputFastSaleDiscountCreateReq>
    {
        public OutputFastSaleDiscountCreateReqValidator()
        {
            RuleFor(x => x.DiscountTypeID).GreaterThan(0);
            RuleFor(x => x.PromotionID).GreaterThan(0);

            RuleFor(x => x.ManagerCode).Length(0, 20);
            RuleFor(x => x.CodeCard).Length(0, 20);

            RuleFor(x => x.DiscountValue).GreaterThanOrEqualTo(0);
            RuleFor(x => x.DiscountPercent).GreaterThanOrEqualTo(0);
        }
    }
}
