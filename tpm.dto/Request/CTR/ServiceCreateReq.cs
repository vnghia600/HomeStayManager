using tpm.dto.admin.Common;
using tpm.dto.admin.Request.SCM;
using FluentValidation;
using System;
using System.Collections.Generic;

namespace tpm.dto.admin
{
    public class ServiceCreateReq : BaseDTO
    {      
        public int Unit_ID { get; set; }
        public int Quantity { get; set; }
        public decimal Unit_Price { get; set; }
        public decimal Total_Amount { get; set; }
        public int Service_Type_ID { get; set; }      
    }

    public class ServiceCreateReqValidator : AbstractValidator<ServiceCreateReq>
    {
        public ServiceCreateReqValidator()
        {
            RuleFor(x => x.Unit_ID).NotEmpty().WithMessage("Đơn vị không được để trống");
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0");
            RuleFor(x => x.Unit_Price).GreaterThan(0).WithMessage("Đơn giá phải lớn hơn 0");
            RuleFor(x => x.Total_Amount).GreaterThan(0).WithMessage("Tổng giá trị phải lớn hơn 0");
            RuleFor(x => x.Service_Type_ID).GreaterThan(0).WithMessage("ID loại dịch vụ phải lớn hơn 0"); // Sửa đổi tên thuộc tính từ Name thành Service_Type_ID         
        }
    }
}
