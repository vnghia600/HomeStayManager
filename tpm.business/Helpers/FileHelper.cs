using CCI.DTO.CRMP.Response;
using System.Net.Http;
using System.Threading.Tasks;

namespace tpm.business.Helpers
{
    public static class FileHelper
    {
        public static async Task<FileUploadRes> Upload(MultipartFormDataContent formData)
        {
            //var apiHelper = Engine.ContainerManager.Resolve<IApiHelper>();
            //var result = await apiHelper.PostFileAsync<FileUploadRes>(EndPoint.UploadFileResource + $"/Upload?module={Constants.MODULE_NAME.ToLower()}", formData);

            //return result;
            throw new System.Exception();
        }

        public static async Task<byte[]> GetFile(string filePath)
        {
            //var url = EndPoint.UploadFileResource + $"/getfile?filePath={filePath}";
            //var httpContext = Engine.ContainerManager.Resolve<IHttpContextAccessor>();
            //using (var client = new HttpClient())
            //{
            //    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", httpContext.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", ""));

            //    using (var result = await client.GetAsync(url))
            //    {
            //        if (result.IsSuccessStatusCode)
            //        {
            //            return await result.Content.ReadAsByteArrayAsync();
            //        }

            //    }
            //}

            //return null;
            throw new System.Exception();
        }
    }
}
