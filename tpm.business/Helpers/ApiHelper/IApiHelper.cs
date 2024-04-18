using System.Net.Http;
using System.Threading.Tasks;

namespace tpm.business.Helpers
{
    public interface IApiHelper
    {
        Task<T> GetAsync<T>(string url, object parameters = null);
        Task<T> PostAsync<T>(string url, object dataToPost = null);
        Task<T> PostFileAsync<T>(string url, MultipartFormDataContent formDataContent);
        Task<T> DeleteAsync<T>(string url);
        Task<T> PutAsync<T>(string url, object dataToPut = null);
    }
}
