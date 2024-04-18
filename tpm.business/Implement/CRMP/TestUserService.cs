using tpm.dto.admin.Response;
using Core.DataAccess.Interface;
using Core.DTO.Response;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace tpm.business
{
    public class TestUserService : ITestUserService
    {
        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        public TestUserService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        public IEnumerable<UserRes> List()
        {
            return ReadAll();
        }

        //public CRUDResult<Brand_UserRes> ReadByID(int ID)
        //{
        //    var result = ReadAll().SingleOrDefault(i => i.BrandUserID == ID);
        //    if (result == null) return new CRUDResult<Brand_UserRes> { StatusCode = CRUDStatusCodeRes.ResourceNotFound };
        //    return new CRUDResult<Brand_UserRes> { StatusCode = CRUDStatusCodeRes.Success, Data = result, };
        //}

        //public CRUDResult<IEnumerable<Brand_UserRes>> ReadByUserID(int UserID)
        //{
        //    var result = ReadAll().Where(i => i.UserID == UserID).ToList();
        //    if (result == null) return new CRUDResult<IEnumerable<Brand_UserRes>> { StatusCode = CRUDStatusCodeRes.ResourceNotFound };
        //    return new CRUDResult<IEnumerable<Brand_UserRes>> { StatusCode = CRUDStatusCodeRes.Success, Data = result };
        //}

        public IEnumerable<UserRes> ReadAll()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<UserRes>("USR.User_ReadAll_Test"); 
            if (result == null)
            {
                result = new List<UserRes>();
            }
            return result;
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

        ~TestUserService()
        {
            Dispose(false);
        }
    }
}
