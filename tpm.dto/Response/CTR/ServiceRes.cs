using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tpm.dto.admin.Response
{
    public class ServiceRes
    {
        public int Service_ID { get; set; }
        public int Quantity { get; set; }
        public decimal? Unit_Price { get; set; }
        public decimal? Total_Amount { get; set; }
        public string Service_Type_Name { get; set; }
        public string Unit { get; set; }

    }
}
