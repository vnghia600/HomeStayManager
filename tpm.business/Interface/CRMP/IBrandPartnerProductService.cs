using tpm.dto.admin;
using tpm.dto.admin.Response;
using Core.DTO.Response;
using System;
using System.Collections.Generic;

namespace tpm.business
{
    public interface IBrandPartnerProductService : IDisposable
    {
        CRUDResult<IEnumerable<BrandPartnerProductRes>> List();
        PagingResponse<BrandPartnerProductSearchByUserRes> SearchByUser(BrandPartnerProductSeachByUserReq obj, int userID);
        CRUDResult<BrandPartnerProductRes> ReadByProductID(string ID, int userID);
    }
}
