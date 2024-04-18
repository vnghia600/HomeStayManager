using tpm.dto.admin.Common;
using FluentValidation;
using System;

namespace tpm.dto.admin.Request.SCM
{
    public class CustomerTransactionStatisticByStatusReq : BaseDTO
    {
        public DateTime CreatedDateFrom { get; set; }
        public DateTime CreatedDateTo { get; set; }
        public int BrandID { get; set; }
        public bool IsExport { get; set; }
    }
    public class CustomerTransactionStatisticByStatusReqValidator : AbstractValidator<CustomerTransactionStatisticByStatusReq>
    {
        public CustomerTransactionStatisticByStatusReqValidator()
        {

            RuleFor(x => x.CreatedDateFrom).LessThanOrEqualTo(x => x.CreatedDateTo);
            RuleFor(x => x.CreatedDateTo).GreaterThanOrEqualTo(x => x.CreatedDateFrom);
        }
    }
}
