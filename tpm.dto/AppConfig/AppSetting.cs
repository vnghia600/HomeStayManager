namespace tpm.dto
{
    public class AppSetting
    {
        public static AppSettingLogger Logger;
        public static ConnectionStrings Connection;
        public static AppSettingCommon Common;
    }
    public class AppSettingLogger
    {
        public bool SerilogEnable { get; set; }
        public string SeqURI { get; set; }
        public string ClientName { get; set; }
        public bool SerilogDebug { get; set; }
    }
    public class ConnectionStrings
    {
        public string DefaultConnection { get; set; }
    }
	public class AppSettingCommon
	{
        public bool APIDebug { get; set; } = false;
	}
}
