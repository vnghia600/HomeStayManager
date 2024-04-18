using tpm.dto.admin.Common;
using System;

namespace tpm.dto.admin.Response
{
    public class BonusPointAccountRes : BaseDTO
    {
        public int ID { get; set; }
        public int CustomerID { get; set; }
        public decimal BonusPoint { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedUser { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int UpdatedUser { get; set; }
        public bool IsDeleted { get; set; }
    }
}
