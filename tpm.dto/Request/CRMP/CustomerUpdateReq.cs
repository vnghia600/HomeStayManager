using tpm.dto.admin.Common;
using System;

namespace tpm.dto.admin.Request.CRMPARTNER
{
    public class CustomerUpdateReq : BaseDTO
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerNameEn { get; set; }
        public int? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public string PersonalId { get; set; }
        public long? Phone { get; set; }
        public string Email { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public int? DistrictId { get; set; }
        public int? ProvinceId { get; set; }
        public string TaxNo { get; set; }
        public bool? DoNotSms { get; set; }
        public DateTime? DueDate { get; set; }
        public string CustomerFullname { get; set; }
        public int WardID { get; set; }
    }
}
