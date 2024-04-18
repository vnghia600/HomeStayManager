using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tpm.dto.admin
{
    public class ContractRes
    {
        public int Contract_ID { get; set; }
        public string Contract_Type_Name { get; set; }
        public string Contract_Number { get; set; }
        public string Customer_Company_Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string MobilePhone { get; set; }
        public string TIN { get; set; }
        public string Email { get; set; }


    }
}
