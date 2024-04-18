using tpm.dto.admin.Common;
using System;

namespace tpm.dto.admin.Response
{

    //[Serializable]
    public class Price4PartnerRes : BaseDTO
    {

        public int PID { get; set; }
        public decimal SalePrice { get; set; }
        public decimal SalePriceAfter { get; set; }
        public decimal? Discount { get; set; }
        public int VAT { get; set; }
    }
}
