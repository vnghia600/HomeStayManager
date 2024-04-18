using tpm.dto.admin.Common;

namespace tpm.dto.admin.Response
{
    public class BrandPartnerProductRes : BaseDTO
    {
        public int TotalRecord { get; set; }
        public int PID { get; set; }
        public string ProductID { get; set; }
        public string ProductName { get; set; }
        public string ReferenceID { get; set; }
        public int? VAT { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Price { get; set; }
        public int Quantity { get; set; }
    }
}
