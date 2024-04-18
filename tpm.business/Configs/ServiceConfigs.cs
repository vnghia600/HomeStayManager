namespace tpm.business
{
    public class ServiceConfigs
    {
        public static int SQLInsertMaxRow = 1000;
        public static string URLSecureDomain = string.Empty;
        public static string URLSecureSecret = string.Empty;
        public static double URLSecureExpire = 0;

        public static GoogleCloudStorageConfig GoogleCloudStorage;
    }

    public class GoogleCloudStorageConfig
    {
        public string ProjectId { get; set; }
        public string BucketName { get; set; }
        public string Location { get; set; }
        public string StorageClass { get; set; }
        public string Host { get; set; }
    }
}
