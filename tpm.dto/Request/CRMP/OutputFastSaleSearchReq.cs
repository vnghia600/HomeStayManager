using tpm.dto.admin.Common;
using tpm.dto.admin.Helper;
using FluentValidation;
using System;
using System.Collections.Generic;

namespace CoC.Business.DTO
{
    public class OutputFastSaleSearchReq : BaseDTO
    {
        public string Keyword { get; set; }
        public List<int> OutputFastStatusIDs { get; set; }
        //public List<int> StoreIDs { get; set; }
        public DateTime? CreatedDateFrom { get; set; }
        public DateTime? CreatedDateTo { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
    public class OutputFastSaleSearchReqValidator : AbstractValidator<OutputFastSaleSearchReq>
    {
        public OutputFastSaleSearchReqValidator()
        {
            RuleFor(x => x.CreatedDateFrom).LessThanOrEqualTo(x => x.CreatedDateTo);
            RuleFor(x => x.CreatedDateTo).GreaterThanOrEqualTo(x => x.CreatedDateFrom);
            RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(-1); RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(0).When(c => c.PageSize > 0);
            RuleFor(x => x.PageSize).GreaterThanOrEqualTo(-1).LessThanOrEqualTo(CommonHelper.PageSizeMaxValue); RuleFor(x => x.PageSize).GreaterThan(0).When(c => c.PageIndex >= 0);
        }
    }
}
