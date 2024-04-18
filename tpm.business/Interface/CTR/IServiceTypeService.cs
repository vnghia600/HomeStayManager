using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;
using tpm.dto.admin.Response;

namespace tpm.business
{
    public interface IServiceTypeService : IDisposable
    {
        bool Create(Service_TypeCreateReq objReq, out int newService_Type_ID);
        //bool Update(Service_TypeCreateReq objReq, int Service_Type_ID);
        //bool Delete(int Service_Type_ID);
        IEnumerable<ServiceTypeRes> GetAllServiceTypes();
        IEnumerable<ServiceTypeRes> GetServicesTypeByID(int Service_Type_ID);

    }
}

