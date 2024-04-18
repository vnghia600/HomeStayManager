using tpm.dto.admin;
using tpm.dto.admin.Response;
using Core.DataAccess.Interface;
using Core.DTO.Response;
using Dapper;
using Dapper.FastCrud;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace tpm.business
{
    public class BrandPartnerProductService : IBrandPartnerProductService
    {
        private readonly Lazy<IRepository> _ObjRepository;
        private readonly Lazy<IReadOnlyRepository> _ObjReadOnlyRepository;

        private bool disposedValue = false;

        public BrandPartnerProductService(Lazy<IRepository> ObjRepository, Lazy<IReadOnlyRepository> ObjReadOnlyRepository)
        {
            _ObjRepository = ObjRepository;
            _ObjReadOnlyRepository = ObjReadOnlyRepository;
        }

        public IEnumerable<BrandPartnerProductRes> ReadAll()
        {

            var result = _ObjReadOnlyRepository.Value.StoreProcedureQuery<BrandPartnerProductRes>("MAT.BrandPartnerProduct_ReadAll");
            if (result == null)
                result = new List<BrandPartnerProductRes>();
            return result;
        }

        public CRUDResult<IEnumerable<BrandPartnerProductRes>> List()
        {
            return new CRUDResult<IEnumerable<BrandPartnerProductRes>> { StatusCode = CRUDStatusCodeRes.Success, Data = ReadAll(), };
        }

        public PagingResponse<BrandPartnerProductSearchByUserRes> SearchByUser(BrandPartnerProductSeachByUserReq obj, int userID)
        {
            if (obj == null) return new PagingResponse<BrandPartnerProductSearchByUserRes> { StatusCode = CRUDStatusCodeRes.InvalidData, ErrorMessage = "Dữ liệu truyền vào không hợp lệ", Records = null };

            var param = new DynamicParameters();
            param.Add("@UserID", userID);
            param.Add("@KeySearch", obj.KeySearch);
            param.Add("@PageIndex", obj.PageIndex);
            param.Add("@PageSize", obj.PageSize);

            var data = _ObjReadOnlyRepository.Value.StoreProcedureQuery<BrandPartnerProductSearchByUserRes>("[SCM].[BrandPartnerProduct_GetByUser]", param)?.ToList();

            if (data == null || !data.Any())
                return new PagingResponse<BrandPartnerProductSearchByUserRes> { StatusCode = CRUDStatusCodeRes.ResourceNotFound };
            return new PagingResponse<BrandPartnerProductSearchByUserRes>()
            {
                StatusCode = CRUDStatusCodeRes.Success,
                CurrentPageIndex = obj.PageIndex,
                PageSize = obj.PageSize,
                Records = data,
                TotalRecord = data?.FirstOrDefault().TotalRecord ?? 0
            };
        }

        public CRUDResult<BrandPartnerProductRes> ReadByProductID(string productID, int userID)
        {
            if (string.IsNullOrEmpty(productID)) return new CRUDResult<BrandPartnerProductRes> { StatusCode = CRUDStatusCodeRes.ResourceNotFound };
            var param = new DynamicParameters();
            param.Add("@UserID", userID);
            param.Add("@ProductID", productID);
            var data = _ObjReadOnlyRepository.Value.Connection.QueryFirstOrDefault<BrandPartnerProductRes>("[SCM].[BrandPartnerProduct_ReadByProductID]", param, commandType: CommandType.StoredProcedure);
            if (data == null)
                return new CRUDResult<BrandPartnerProductRes> { StatusCode = CRUDStatusCodeRes.InvalidData, ErrorMessage ="test" };
            return new CRUDResult<BrandPartnerProductRes> { StatusCode = CRUDStatusCodeRes.Success, Data = data };
        }
        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    if (_ObjRepository.IsValueCreated)
                        _ObjRepository.Value.Dispose();
                    if (_ObjReadOnlyRepository.IsValueCreated)
                        _ObjReadOnlyRepository.Value.Dispose();
                }
                disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        ~BrandPartnerProductService()
        {
            Dispose(false);
        }

    }

}
