using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tpm.dto.admin.Response
{
    public class EmployeeRes
    {
        public int ID { get; set; } 
        public string EmployeeID { get; set; }
        public string FullName { get; set; }
        public DateTime DOB { get; set; }
        public string PositionName { get; set; }
        public string DepartmentName { get; set; }
        public string GenderName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string EmployeeTypeName { get; set; }
    }
}
