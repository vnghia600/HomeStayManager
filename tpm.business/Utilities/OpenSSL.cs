using System;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;

namespace tpm.business
{

    /// <summary>
    /// OpenSSL
    /// </summary>
    public class OpenSSL
    {
        #region OpenSSL
        /// <summary>
        /// MD5_Binary
        /// </summary>
        /// <param name="relativeUrl"></param>
        /// <param name="ip"></param>
        /// <param name="key"></param>
        /// <param name="isExpire"></param>
        /// <returns></returns>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        protected internal byte[] MD5_Binary(string relativeUrl, string ip, string key, bool isExpire = true)
        {
            return isExpire ? MD5_Binary($"{relativeUrl}{ip} {key}") : MD5_Binary($"{relativeUrl}{ip}{key}");
        }

        /// <summary>
        /// MD5_Binary
        /// </summary>
        /// <param name="relativeUrl"></param>
        /// <returns></returns>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public  byte[] MD5_Binary(string relativeUrl)
        {
            var md5provider = new MD5CryptoServiceProvider();
			
            return md5provider.ComputeHash(new UTF8Encoding().GetBytes(relativeUrl));
        }

        /// <summary>
        /// Hex
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public string Hex(byte[] data)
        {
            var sBuilder = new StringBuilder();
            for (var i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }
            return sBuilder.ToString();
        }

        /// <summary>
        /// Base64
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        protected internal string Base64(byte[] data)
        {
            return Convert.ToBase64String(data);
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="input">Input will replace tr +/ -_ | tr -d =</param>
        /// <returns></returns>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        protected internal string Replace(string input)
        {
            return input.Replace("+", "-").Replace("/", "_").Replace("=", "");
        }
        /// <summary>
        /// DateTimeToUnixTimestamp
        /// </summary>
        /// <param name="dateTime"></param>
        /// <returns></returns>
        protected internal long UnixTimestamp(DateTime dateTime)
        {
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            long unixTimeStampInTicks = (dateTime.ToUniversalTime() - unixStart).Ticks;
            return (long)unixTimeStampInTicks / TimeSpan.TicksPerSecond;
        }

        /// <summary>
        /// UnixTimestampToDateTime
        /// </summary>
        /// <param name="unixTime"></param>
        /// <returns></returns>
        protected DateTime UnixTimestampToDateTime(double unixTime)
        {
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            var unixTimeStampInTicks = (long)(unixTime * TimeSpan.TicksPerSecond);
            return new DateTime(unixStart.Ticks + unixTimeStampInTicks, System.DateTimeKind.Utc);
        }
        #endregion
    }
}