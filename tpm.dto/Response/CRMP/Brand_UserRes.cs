using tpm.dto.admin.Common;
using System;

namespace tpm.dto.admin.Response
{
    public class Brand_UserRes : BaseDTO
    {
        public int BrandUserID { get; set; }
        public int BrandID { get; set; }
        public string ProductBrandName { get; set; }
        public int UserID { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int CreatedUser { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int UpdatedUser { get; set; }
        public bool IsDeleted { get; set; }
    }
}
