using tpm.business.Configs;
using System.Collections.Generic;

namespace tpm.business
{
    public class Constants
    {
        public const string MODULE_NAME = "CRMPARTNER";
        public const string IMAGE_FILE_TYPE = ".tif,.tiff,.bmp,.jpg,.jpeg,.gif,.png,.eps,.raw,.cr2,.nef,.orf,.sr2";
        public const string SOUND_FILE_TYPE = ".3gp ,.aa ,.aac ,.aax ,.act ,.aiff ,.alac ,.amr ,.ape ,.au ,.awb ,.dss ,.dvf ,.flac ,.gsm ,.iklax ,.ivs ,.m4a ,.m4b ,.m4p ,.mmf ,.mp3 ,.mpc ,.msv ,.nmf ,.ogg, ,.opus ,.ra, ,.raw ,.rf64 ,.sln ,.tta ,.voc ,.vox ,.wav ,.wma ,.wv ,.webm ,.8svx ,.cda ,.rm";
        public const string DOCUMENT_FILE_TYPE = ".doc ,.docx ,.html ,.htm ,.odt ,.pdf ,.xls ,.xlsx ,.ods ,.ppt ,.pptx ,.txt";

        public const string SqlConfigurations = @"
            SET QUOTED_IDENTIFIER ON
            SET ANSI_NULLS ON
            SET ARITHABORT ON 
            ";
        public const int CurrencyUnitID = 1;
        public const decimal CurrencyExchange = 1;
        public const int DefaultPriceRegionID = 1;
        public const int DefaultOutputTypeID = 1;
        public const int PaymentStoreID = 162;
        public const int FormTypeIDForOrder = 3;
        public const int InitPayFormStatusID = 1;
        public const int PayFormApproveProcessInitStatus = -1;

        public static Dictionary<StockType, List<int>> InputTypeByStockType = new Dictionary<StockType, List<int>>()
        {
            { StockType.CrossStock, new List<int>(){ 21, 28, 29, 36 }},
            { StockType.SafetyStock, new List<int>(){ 22, 27, 31, 33 }},
            { StockType.ImportStock, new List<int>(){ 23 }},
            { StockType.Error, new List<int>(){ 26, 30 }},
            { StockType.Offset, new List<int>(){ 32 }},
            { StockType.Deposit, new List<int>(){ 34 }}
        };

        public static Dictionary<StockType, List<int>> OutputTypeByStockType = new Dictionary<StockType, List<int>>()
        {
            { StockType.CrossStock, new List<int>(){ 28 }},
            { StockType.SafetyStock, new List<int>(){ 29, 31, 34, 43 }},
            { StockType.ImportStock, new List<int>(){ 32, 36, 44 }},
            { StockType.Error, new List<int>(){ 35, 30, 37, 38 }},
            { StockType.Offset, new List<int>(){ 39, 41 }},
            { StockType.Deposit, new List<int>(){ 42, 45 }}
        };

        public static List<int> KeppelInputTypeIDs
        {
            get
            {
                var Result = new List<int>();
                Result.AddRange(InputTypeByStockType[StockType.CrossStock]);
                Result.AddRange(InputTypeByStockType[StockType.SafetyStock]);
                Result.AddRange(InputTypeByStockType[StockType.ImportStock]);
                Result.AddRange(InputTypeByStockType[StockType.Error]);
                Result.AddRange(InputTypeByStockType[StockType.Offset]);
                Result.AddRange(InputTypeByStockType[StockType.Deposit]);
                return Result;
            }
        }

        public static List<int> KeppelOutputTypeIDs
        {
            get
            {
                var Result = new List<int>();
                Result.AddRange(OutputTypeByStockType[StockType.CrossStock]);
                Result.AddRange(OutputTypeByStockType[StockType.SafetyStock]);
                Result.AddRange(OutputTypeByStockType[StockType.ImportStock]);
                Result.AddRange(OutputTypeByStockType[StockType.Error]);
                Result.AddRange(OutputTypeByStockType[StockType.Offset]);
                Result.AddRange(OutputTypeByStockType[StockType.Deposit]);
                return Result;
            }
        }
    }

    public enum ConnectionEnum
    {
        Default,
        SCM,
        PCS,
        MDM
    }
}
