using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace tpm.business.Helpers
{
    public class ApiHelper : IApiHelper
    {
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContext;

        public ApiHelper(HttpClient client, IHttpContextAccessor httpContext)
        {
            _client = client;
            _httpContext = httpContext;
            Init();
        }

        private void Init()
        {

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _httpContext.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", ""));
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
        public async Task<T> GetAsync<T>(string url, object parameters = null)
        {
            var query = parameters != null ? parameters.ToQueryString() : string.Empty;
            var requestMessage = GetHttpRequestMessage(HttpMethod.Get, url + query);

            return await GetResources<T>(requestMessage, query);
        }

        public async Task<T> PostAsync<T>(string url, object dataToPost = null)
        {
            var requestMessage = GetHttpRequestMessage(HttpMethod.Post, url);

            var objRequest = JsonConvert.SerializeObject(dataToPost, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            requestMessage.Content = new StringContent(objRequest, Encoding.UTF8, "application/json");

            return await GetResources<T>(requestMessage, objRequest);
        }

        public async Task<T> PostFileAsync<T>(string url, MultipartFormDataContent formDataContent)
        {
            var requestMessage = GetHttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Content = formDataContent;

            return await GetResources<T>(requestMessage);
        }

        public async Task<T> DeleteAsync<T>(string url)
        {
            var requestMessage = GetHttpRequestMessage(HttpMethod.Delete, url);

            return await GetResources<T>(requestMessage, string.Empty);
        }

        public async Task<T> PutAsync<T>(string url, object dataToPut = null)
        {
            var requestMessage = GetHttpRequestMessage(HttpMethod.Put, url);

            var objRequest = JsonConvert.SerializeObject(dataToPut, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            requestMessage.Content = new StringContent(objRequest, Encoding.UTF8, "application/json");

            return await GetResources<T>(requestMessage, objRequest);
        }

        private HttpRequestMessage GetHttpRequestMessage(HttpMethod method, string url)
        {

            var request = new HttpRequestMessage(method, url);

            return request;
        }

        private async Task<T> GetResources<T>(HttpRequestMessage requestMessage, string jsonBody = null)
        {
            using (var response = _client.SendAsync(requestMessage).Result)
            {
                try
                {
                    var result = await GetResponse<T>(response);

                    //_logger.Info(_logIdentify, $"API: {requestMessage.RequestUri} " +
                    //    $"\r\nMethod: {requestMessage.Method}" +
                    //    $"\r\nHttpstatus: {response.StatusCode} " +
                    //    $"\r\nDateTime: {DateTime.Now} " +
                    //    $"\r\n\tReq: {jsonBody}");

                    return result;
                }
                catch (Exception ex)
                {
                    var logMessage = $"Lỗi gọi API: {requestMessage.RequestUri} " +
                        $"\r\nMethod: {requestMessage.Method}" +
                        $"\r\nHttpstatus: {response.StatusCode} " +
                        $"\r\nDateTime: {DateTime.Now} " +
                        $"\r\nException message: {ex.Message} " +
                        $"\r\n\tReq: {jsonBody}";

                    //_logger.Error(_logIdentify, logMessage);

                    return default(T);
                }
            }
        }

        private async Task<T> GetResponse<T>(HttpResponseMessage response)
        {
            using (var content = response.Content)
            {
                var responseData = await content.ReadAsStringAsync();

                return JsonConvert.DeserializeObject<T>(responseData);
            }
        }
    }
}
