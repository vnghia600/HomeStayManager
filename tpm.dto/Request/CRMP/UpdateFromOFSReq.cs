using tpm.dto.admin.Common;
using FluentValidation;

namespace CoC.Business.DTO
{
    public class UpdateFromOFSReq : BaseDTO
    {
        public int? CustomerID { get; set; }
        public string CustomerName { get; set; }
        public long? CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public double? AddressLongitude { get; set; }
        public double? AddressLatitude { get; set; }
        public int? WardID { get; set; }
        public int? DistrictID { get; set; }
        public int? ProvinceID { get; set; }
        public int? UserID { get; set; }
    }
    public class CustomerUpdateReqValidator : AbstractValidator<UpdateFromOFSReq>
    {
        public CustomerUpdateReqValidator()
        {
            RuleFor(x => x.CustomerID).GreaterThan(0);
            RuleFor(x => x.CustomerName).Length(0, 300);
            RuleFor(x => x.CustomerPhone);
            RuleFor(x => x.CustomerAddress).Length(0, 500);
            //RuleFor(x => x.AddressLongitude);
            //RuleFor(x => x.AddressLatitude);
            //RuleFor(x => x.WardID).GreaterThan(0);
            //RuleFor(x => x.DistrictID).GreaterThan(0);
            //RuleFor(x => x.ProvinceID).GreaterThan(0);
            RuleFor(x => x.UserID).GreaterThan(0);
        }
    }
}
