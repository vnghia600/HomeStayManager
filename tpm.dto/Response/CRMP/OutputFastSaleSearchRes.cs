using tpm.dto.admin.Common;
using System;
namespace tpm.dto.admin.Response
{
    public class OutputFastSaleSearchRes : BaseDTO
    {
        public int TotalRecord { get; set; }
        public decimal? SumTotalAmount { get; set; }
        public int? SumTotalQuantity { get; set; }
        public int OFSID { get; set; }
        public int? TotalQuantity { get; set; }
        public string CustomerName { get; set; }
        public long? CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public int? OutputFastTypeID { get; set; }
        public string OutputFastTypeName { get; set; }
        public int? OutputFastStatusID { get; set; }
        public string OutputFastStatusName { get; set; }
        public string CreatedFullName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? OutputStoreID { get; set; }
        public string OutputStoreName { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? RequestStoreID { get; set; }
        public string RequestStoreName { get; set; }
        public DateTime? RequiredOutputDate { get; set; }
        public int? RevokeTypeID { get; set; }
        public string RevokeTypeName { get; set; }
        public string ReceiptID { get; set; }
        public string PaymentTypeName { get; set; }
        public string CustomerAddressDetail { get; set; }
        public double? AddressLongitude { get; set; }
        public double? AddressLatitude { get; set; }
        public int? DeliveryPartnerID { get; set; }
        public string DeliveryPartnerName { get; set; }
        public int? ShippingStatusID { get; set; }
        public string ShippingStatusName { get; set; }
        public string ShippingOrderID { get; set; }
        public string ShippingOrderCreatedUserName { get; set; }
        public string ShippingOrderCreatedFullName { get; set; }
        public long? ContactPhone { get; set; }
        public string Description { get; set; }
        public int PartnerType { get; set; }
        public int? ConfirmedUser { get; set; }
        public int? CustomerID { get; set; }
        public string TransactionID { get; set; }
        public int? PaymentTypeID { get; set; }
        public string DeliveryName { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string ProductBrandName { get; set; }
        public string AgentCreatedUsername { get; set; }
        public string FailReason { get; set; }
        public string ProvinceName { get; set; }
    }
}
