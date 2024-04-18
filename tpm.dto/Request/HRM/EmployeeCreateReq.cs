using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin.Common;

namespace tpm.dto.admin
{
    public class EmployeeCreateReq : BaseDTO
    {
        public string EmployeeID { get; set; }  
        public string FullName { get; set; }
        public DateTime DOB { get; set; }
        public int DepartmentID { get; set; }
        public int PositionID { get; set; }
        public int GenderID { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public int EmployeeTypeID { get; set; }

    }
    public class EmployeeCreateReqValidator : AbstractValidator<EmployeeCreateReq>
    {
        public EmployeeCreateReqValidator()
        {
            RuleFor(x => x.EmployeeID)
                .NotEmpty().WithMessage("ID nhân viên không được để trống.");
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Tên đầy đủ không được để trống.");

            RuleFor(x => x.DOB)
                .Must(BeAValidDate).WithMessage("Ngày sinh không hợp lệ.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Số điện thoại không được để trống.")
                .Matches(@"^\d{10}$").WithMessage("Số điện thoại phải có 10 chữ số.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.");

            RuleFor(x => x.GenderID)
                .NotEmpty().WithMessage("ID giới tính không được để trống.");

            RuleFor(x => x.DepartmentID)
                .NotEmpty().WithMessage("ID phòng ban không được để trống.");

            RuleFor(x => x.PositionID)
                .NotEmpty().WithMessage("ID vị trí không được để trống.");

            RuleFor(x => x.EmployeeTypeID)
                .NotEmpty().WithMessage("ID loại nhân viên không được để trống.");
        }

        private bool BeAValidDate(DateTime date)
        {
            // Kiểm tra ngày sinh có nằm trong khoảng hợp lệ (ví dụ: từ năm 1900 đến ngày hiện tại)
            DateTime minDate = new DateTime(1900, 1, 1);
            DateTime maxDate = DateTime.Now.Date;
            return date >= minDate && date <= maxDate;
        }
    }

}
