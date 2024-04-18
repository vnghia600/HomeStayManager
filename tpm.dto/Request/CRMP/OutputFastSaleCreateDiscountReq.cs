using tpm.dto.admin.Common;
using FluentValidation;

namespace tpm.dto.admin.Request.SCM
{
    public class OutputFastSaleCreateDiscountReq : BaseDTO
    {
        public int? DiscountTypeID { get; set; } //= 4
        public int? PromotionID { get; set; }
        public string ManagerCode { get; set; }
        public string CodeCard { get; set; }
        public decimal? DiscountValue { get; set; }
        public double? DiscountPercent { get; set; }
        public bool IsSale { get; set; }//lấy từ PQT, ko có thì  = false
    }
    public class OutputFastSaleCreateDiscountReqValidator : AbstractValidator<OutputFastSaleCreateDiscountReq>
    {
        public OutputFastSaleCreateDiscountReqValidator()
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
