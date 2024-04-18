using tpm.dto.admin.Common;
using tpm.dto.admin.Request.SCM;
using FluentValidation;
using System;
using System.Collections.Generic;

namespace tpm.dto.admin
{
    public class UserLoginReq
    {      
        public string keyword { get; set; }
        public string password { get; set; }   
    }

    public class UserLoginReqValidator : AbstractValidator<UserLoginReq>
    {
        public UserLoginReqValidator()
        {
            RuleFor(x => x.keyword).NotEmpty().WithMessage("SĐT hoặc email không được rỗng");
            RuleFor(x => x.password).NotEmpty().WithMessage("Mật khẩu phải không được rỗng");
        }
    }
}
