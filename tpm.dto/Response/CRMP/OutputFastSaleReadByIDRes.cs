using tpm.dto.admin.Common;
using System;
using System.Collections.Generic;

namespace tpm.dto.admin.Response
{
    public class OutputFastSaleReadByIDRes : BaseDTO
    {
        public int OFSID { get; set; }
        public int? OutputFastStatusID { get; set; }
        public string OutputFastStatusName { get; set; }
        public int? OutputFastTypeID { get; set; }
        public string OutputFastTypeName { get; set; }
        public int? RequestStoreID { get; set; }
        public string RequestStoreName { get; set; }
        public int? OutputStoreID { get; set; }
        public string OutputStoreName { get; set; }
        public string CustomerName { get; set; }
        public long? CustomerPhone { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerAddress { get; set; }
        public int? CustomerGender { get; set; }
        public string InvoiceTax { get; set; }
        public string InvoiceName { get; set; }
        public string InvoiceAddress { get; set; }
        public string InvoiceEmail { get; set; }
        public int? TotalQuantity { get; set; }
        public decimal? OrderDiscount { get; set; }
        public decimal? CustomerDiscount { get; set; }
        public decimal? ProductDiscount { get; set; }
        public decimal? TotalDiscount { get; set; }
        public decimal? TotalTaxAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string Description { get; set; }
        public int? DeliveryTypeID { get; set; }
        public string DeliveryTypeName { get; set; }
        public int? DeliveryID { get; set; }
        public string DeliveryPartnerName { get; set; }
        public decimal? DeliveryCompanyFee { get; set; }
        public decimal? DeliveryCustomerFee { get; set; }
        public int? PaymentTypeID { get; set; }
        public string PaymentTypeName { get; set; }
        public int? ProcessingUser { get; set; }
        public string ProcessingUsername { get; set; }
        public string ProcessingFullname { get; set; }
        public DateTime? ProcessingDate { get; set; }
        public int? ConfirmedUser { get; set; }
        public string ConfirmedUsername { get; set; }
        public string ConfirmedFullname { get; set; }
        public DateTime? ConfirmedDate { get; set; }
        public int CreatedUser { get; set; }
        public string CreatedUsername { get; set; }
        public string CreatedFullname { get; set; }
        public DateTime CreatedDate { get; set; }
        public long? ContactPhone { get; set; }
        public string ReceiptID { get; set; }
        public DateTime? RequiredOutputDate { get; set; }
        public int? RevokeTypeID { get; set; }
        public string RevokeTypeName { get; set; }
        public string DescriptionShowroom { get; set; }
        public string CustomerAddressDetail { get; set; }
        public double? AddressLongitude { get; set; }
        public double? AddressLatitude { get; set; }
        public long? PartnerType { get; set; }
        public string ShippingOrderID { get; set; }
        public string TransactionID { get; set; }
        public int? CustomerID { get; set; }
        public int? ShippingStatusID { get; set; }
        public bool? IsNeedCall { get; set; }
        public IEnumerable<OutputFastSaleDetailReadByIDRes> Details { get; set; }
        /// <summary>
        /// Trường custom, k có trong store procedure
        /// </summary>
        public bool IsCombo { get; set; }
        public int? OFWebStatusID { get; set; }
        public string CollectingInvoice { get; set; }

        public double? OutputStoreLatitude { get; set; }
        public double? OutputStoreLongitude { get; set; }
        public string OutputStoreAddress { get; set; }
        public string ConfirmedUserPhone { get; set; }
        public decimal Distance { get; set; }
        public int OutputStoreProvinceID { get; set; }
        public string PartnerTypeName { get; set; }
        public int ProvinceID { get; set; }
        public int SourceID { get; set; }
        public string SourceName { get; set; }
        public string DescriptionPartner { get; set; }
        public string AgentCreatedUsername { get; set; }
        public string FailReason { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string InvoiceReceiver { get; set; }
    }
}
