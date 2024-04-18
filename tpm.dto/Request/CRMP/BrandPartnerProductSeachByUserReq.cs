using tpm.dto.admin.Common;
using tpm.dto.admin.Helper;
using FluentValidation;

namespace tpm.dto.admin
{
    public class BrandPartnerProductSeachByUserReq : BaseDTO
    {
        public string KeySearch { get; set; }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
    }
    public class BrandPartnerProductSeachReqValidator : AbstractValidator<BrandPartnerProductSeachByUserReq>
    {
        public BrandPartnerProductSeachReqValidator()
        {
            RuleFor(x => x.PageIndex).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.PageSize).NotNull().GreaterThan(0).LessThanOrEqualTo(CommonHelper.PageSizeMaxValue);
        }
    }
}
