using System;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;

namespace tpm.business
{
    public static class ServiceHelper
    {
        public static bool CheckVAT(int vatIn, int vatOut)
        {
            if (vatIn < 0 || vatIn > 100 || vatOut < 0 || vatOut > 100)
                return false;
            if ((vatIn != 0 && vatIn != vatOut) || vatOut == 0)
                return false;
            else
                return true;
        }

        public static string RandomString(int size)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToLower();
            var random = new Random();
            var result = new string(Enumerable.Repeat(chars, size)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result;
        }

        public static byte[] ObjectToByteArray(Object obj)
        {
            if (obj == null)
                return null;
            BinaryFormatter bf = new BinaryFormatter();
            using (MemoryStream ms = new MemoryStream())
            {
                bf.Serialize(ms, obj);
                return ms.ToArray();
            }
        }

        public static Object ByteArrayToObject(byte[] arrBytes)
        {
            MemoryStream memStream = new MemoryStream();
            BinaryFormatter binForm = new BinaryFormatter();
            memStream.Write(arrBytes, 0, arrBytes.Length);
            memStream.Seek(0, SeekOrigin.Begin);
            Object obj = (Object)binForm.Deserialize(memStream);
            return obj;
        }


        public static bool CheckSpecialCharacter(string input)
        {
            string[] arr = new string[] { "@", "#", "$", "%", "^", "&", "*", "'", "\"", "|", "!" };
            foreach (string str in arr)
            {
                if (input.Contains(str))
                    return true;
            }
            return false;
        }

        //public static string GenerateSecureLink(string RPath)
        //{
        //    if (string.IsNullOrEmpty(RPath))
        //        return "";
        //    OpenSSL openssl = new OpenSSL();
        //    DateTime expireDate = DateTime.Now.AddMinutes(ServiceConfigs.URLSecureExpire);
        //    var expire = openssl.UnixTimestamp(expireDate).ToString();// get unix datetime
        //    RPath = "/" + RPath.Replace("\\", "/");
        //    var input = expire.ToString() + RPath + " " + ServiceConfigs.URLSecureSecret;
        //    var md5_binary = openssl.MD5_Binary(input);// openssl md5 -binary
        //    var base64 = openssl.Base64(md5_binary);
        //    var md5 = openssl.Replace(base64);
        //    return $"{ServiceConfigs.URLSecureDomain}{RPath}?md5={md5}&expires={expire}";
        //}

        public static string GenerateFileName(string fileName)
        {
            string fileNameSaved = DateTime.Now.ToString("yyyyMMdd") + fileName + ".xlsx";
            return fileNameSaved;
        }

        /// <summary>
        /// Chuyển đổi định dạng ngày từ dd/MM/yyyy sang MM/dd/yyyy
        /// </summary>
        /// <param name="input"></param>
        /// <param name="isStartDay"></param>
        /// <returns></returns>
        public static DateTime? ConvertStringToDateTime(string input, bool isStartDay = true)
        {
            try
            {
                string[] arr = input.Split('-');
                if (isStartDay == true)
                    return new DateTime(Convert.ToInt32(arr[2]), Convert.ToInt32(arr[1]), Convert.ToInt32(arr[0]), 0, 0, 0);
                else
                    return new DateTime(Convert.ToInt32(arr[2]), Convert.ToInt32(arr[1]), Convert.ToInt32(arr[0]), 23, 59, 59);
            }
            catch
            {
                return null;
            }
        }

        public static T Clone<T>(T source)
        {
            if (!typeof(T).IsSerializable)
            {
                throw new ArgumentException("The type must be serializable.", "source");
            }
            // Don't serialize a null object, simply return the default for that object
            if (Object.ReferenceEquals(source, null))
            {
                return default(T);
            }
            IFormatter formatter = new BinaryFormatter();
            Stream stream = new MemoryStream();
            using (stream)
            {
                formatter.Serialize(stream, source);
                stream.Seek(0, SeekOrigin.Begin);
                return (T)formatter.Deserialize(stream);
            }
        }

        public enum EnumInputType
        {
            /// <summary>
            /// Nhập hàng công nợ kho Keppel
            /// </summary>
            Nhaphangcongno = 21,
            /// <summary>
            /// Nhập hàng dự trữ kho Keppel
            /// </summary>
            Nhaphangdutru = 22,
            /// <summary>
            /// Nhập hàng nhập khẩu kho Keppel
            /// </summary>
            Nhaphangnhapkhau = 23,
            /// <summary>
            /// Nhập hàng nhập khẩu nội bộ kho Keppel
            /// </summary>
            Nhaphangnhapkhaunoibo = 28,
            /// <summary>
            /// Nhập hàng dự trữ nội bộ kho Keppel
            /// </summary>
            Nhaphangdutrunoibo = 29,
            //nhập hàng ký gửi kho kepple
            NhaphangkiguikhoKeppel = 34,
            NhaphangkiguiNoiBokhoKeppel = 36
        }
    }

    public static class EnumHelper
    {
        public static T Parse<T>(string input)
        {
            return (T)Enum.Parse(typeof(T), input, true);
        }
    }
}