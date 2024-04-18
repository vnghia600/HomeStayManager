using tpm.dto.admin.Response;
using Core.DataAccess.Interface;
using Core.DTO.Response;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using tpm.dto.admin;
using System.Threading.Tasks;
using Dapper;

namespace tpm.business
{
    public class UserService : IUserService
	{
        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        public UserService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        public async Task<CRUDResult<UserRes>> login(UserLoginReq obj)
        {
            var result = await _objReadOnlyRepository.Value.Connection.QuerySingleOrDefaultAsync<UserRes>("[USR].[User_GetDataLogin]", new {
				@Keyword = obj.keyword
			}, commandType: CommandType.StoredProcedure);
			if (result == null) 
                return new CRUDResult<UserRes> { StatusCode = CRUDStatusCodeRes.ResourceNotFound };

            return new CRUDResult<UserRes> { StatusCode = CRUDStatusCodeRes.Success, Data = result };
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    if (_objRepository.IsValueCreated)
                        _objRepository.Value.Dispose();
                    if (_objReadOnlyRepository.IsValueCreated)
                        _objReadOnlyRepository.Value.Dispose();
                }
                _disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        ~UserService()
        {
            Dispose(false);
        }
    }
}
