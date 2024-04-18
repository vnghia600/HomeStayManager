namespace tpm.business.Utilities
{
    public static class UriExtension
    {
        public static string ToUrl(this string url)
        {
            if (url.EndsWith("/"))
            {
                url = url.Remove(url.Length - 1, 1);
            }

            return url;
        }
    }
}
