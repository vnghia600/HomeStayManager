using Core.DTO.Response;
using System;
using System.Threading.Tasks;
using tpm.dto.admin;
using tpm.dto.admin.Response;

namespace tpm.business
{
	public interface IUserService : IDisposable
    {
		Task<CRUDResult<UserRes>> login(UserLoginReq obj);
	}
}
