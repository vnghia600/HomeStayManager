namespace tpm.dto.admin.Response
{
    public class OutputFastSaleDetailReadByIDRes
    {
        public int OFSDID { get; set; }
        public int OFSID { get; set; }
        public int OutputStoreID { get; set; }
        public int PID { get; set; }
        public string ProductID { get; set; }
        public string ReferencedID { get; set; }
        public string ProductName { get; set; }
        public int? CategoryID { get; set; }
        public int? PromotionID { get; set; }
        public string ApplyProductID { get; set; }
        public int OutputTypeID { get; set; }
        public string OutputTypeName { get; set; }
        public int? Quantity { get; set; }
        public decimal? SalePriceVAT { get; set; }
        public double? DiscountPercent { get; set; }
        public decimal? DiscountProduct { get; set; }
        public decimal? DiscountFromOrder { get; set; }
        public decimal? DiscountFromCustomer { get; set; }
        public int? VAT { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? PriceAmount { get; set; }
        public decimal? QuotedPrice { get; set; }
        public int? ComboQuantity { get; set; }
        public string ComboID { get; set; }
        public string ComboName { get; set; }
        public bool IsDelivery { get; set; }
        public bool? IsGift { get; set; }
    }
}
