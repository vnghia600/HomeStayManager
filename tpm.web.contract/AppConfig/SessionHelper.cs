using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace tpm.web.contract
{
    public static class SessionHelper
    {
        public static void Set<T>(ISession session, string key, T value)
        {
            if (value != null)
            {
                session.SetString(key, JsonConvert.SerializeObject(value));
                session.CommitAsync().Wait();
            }
        }

        public static T Get<T>(ISession session, string key)
        {
            session.LoadAsync().Wait();
            var value = session.GetString(key);

            return value == null ? default(T) :
                JsonConvert.DeserializeObject<T>(value);
        }

        public static int? GetInt(ISession session, string key)
        {
            session.LoadAsync().Wait();
            return session.GetInt32(key);
        }

        public static string GetString(ISession session, string key)
        {
            session.LoadAsync().Wait();
            return session.GetString(key);
        }

        public static void SetInt(ISession session, string key, int value)
        {
            session.SetInt32(key, value);
            session.CommitAsync().Wait();
        }

        public static void SetString(ISession session, string key, string value)
        {
            session.SetString(key, value);
            session.CommitAsync().Wait();
        }

        public static void Remove(ISession session, string key)
        {
            session.Remove(key);
            session.CommitAsync().Wait();
        }
    }
    public static class SessionKeys
    {
        public const string CurrentUser = "CurrentUser";
        public const string NeedUpdate = "NeedUpdate";
        public const string UrlReferrer = "UrlReferrer";
    }
}
