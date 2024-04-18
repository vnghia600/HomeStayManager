using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin.Response;
using tpm.dto.admin;

namespace tpm.business
{
    public interface IContractService : IDisposable
    {
        bool Create(ContractCreateReq objReq, out int newContractID);
        bool Update(ContractCreateReq objReq, int Contract_ID);
        bool Delete(int contractID);
        IEnumerable<ContractRes> ReadAll();
        IEnumerable<ContractRes> GetContractsByID(int contractID);
        IEnumerable<ContractRes> GetContractsWithTypeName();
    }
}
