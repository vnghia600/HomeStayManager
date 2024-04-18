using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;
using tpm.dto.admin.Response;

namespace tpm.business
{
    public interface IEmployeeService : IDisposable
    {
        bool Create(EmployeeCreateReq objReq, out int ID);
        bool Update(EmployeeCreateReq objReq, int ID);
        bool Delete(int ID);
        IEnumerable<EmployeeRes> ReadAll();
        IEnumerable<EmployeeRes> GetEmployeesByID(int ID);
        IEnumerable<EmployeeRes> GetEmployeesWithTypeName();
    }
}
