using CoC.Business.DTO;
using Core.DTO.Response;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;
using tpm.dto.admin.MBM;
using tpm.dto.admin.Response;

namespace tpm.business
{
    public interface IServiceService : IDisposable
    {
        bool Create(ServiceCreateReq objReq, out int newServiceID);
        bool Update(ServiceCreateReq objReq, int Service_ID);
        bool Delete(int serviceid);
        IEnumerable<ServiceRes> ReadAll();
        IEnumerable<ServiceRes> GetServicesByID(int Service_ID);
        IEnumerable<ServiceRes> GetServicesWithTypeName();
       



        /* CRUDResult<ServiceRes> Update(int service_id, ServiceCreateReq obj);*/
    }
}

