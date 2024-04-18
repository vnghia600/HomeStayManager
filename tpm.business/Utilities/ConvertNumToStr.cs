using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace tpm.business
{
    public class ConvertNumToStr
    {
        #region Variable
        private readonly string[] _strSo = { "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };
        /* đoạn này lấy từ chương trình của bạn đã đưa lên 
        private string[] strDonViNho = { "linh", "lăm", "mười", "mươi", "mốt", "trăm" };
        private string[] strDonViLon = { "", "ngàn", "triệu", "tỷ" };*/
        int a, b, c;
        #endregion

        #region Function
        public string[] SlipArray(string input)
        {
            int i = 0;
            string[] strArray;
            int length = input.Length;
            if (length % 3 == 0)//Nếu chỗi chia hết cho 3 thì lấy độ dài bằng phần nguyên
                strArray = new string[length / 3];
            else//Nếu chỗi không chia hết cho 3 thì lấy độ dài bằng phần nguyên+1
                strArray = new string[length / 3 + 1];
            if (length < 3)
                strArray[0] = input;
            else
            {
                while (length >= 3)
                {
                    strArray[i] = input.Remove(0, length - 3);
                    input = input.Remove(length - 3, 3);
                    i++;
                    length = length - 3;
                }
                if (length > 0)
                    strArray[i] = input;
            }
            return strArray;
        }
        public string ConverNumToString(string[] list)
        {
            //string[] list = SlipArray(input);
            int i;
            string results = "";
            int length = list.Length;
            if (length <= 4)
            {
                if (length == 1)
                    results = ReadThousand(list[0]);
                if (length == 2)
                    results = ReadThousand(list[1]) + " nghìn " + ReadThousand(list[0]);
                if (length == 3)
                {
                    if (ReadThousand(list[1]) != "" && ReadThousand(list[2]) != "")
                        results = ReadThousand(list[2]) + " triệu " + ReadThousand(list[1]) + " nghìn " + ReadThousand(list[0]);
                    if (ReadThousand(list[1]) == "" && ReadThousand(list[2]) != "")
                        results = ReadThousand(list[2]) + " triệu";
                    if (ReadThousand(list[1]) == "" && ReadThousand(list[2]) == "")
                        results = "";
                }
                if (length == 4)
                {
                    if (ReadThousand(list[2]) != "" && ReadThousand(list[1]) != "")
                        results = ReadThousand(list[3]) + " tỷ " + ReadThousand(list[2]) + " triệu " + ReadThousand(list[1]) + " nghìn " + ReadThousand(list[0]);
                    if (ReadThousand(list[2]) == "" && ReadThousand(list[1]) != "")
                        results = ReadThousand(list[3]) + " tỷ " + ReadThousand(list[1]) + " nghìn " + ReadThousand(list[0]);
                    if (ReadThousand(list[2]) != "" && ReadThousand(list[1]) == "")
                        results = ReadThousand(list[3]) + " tỷ " + ReadThousand(list[2]) + " triệu " + ReadThousand(list[0]);
                    if (ReadThousand(list[2]) == "" && ReadThousand(list[1]) == "")
                        results = ReadThousand(list[3]) + " tỷ " + ReadThousand(list[0]);
                }
            }
            if (length > 4)
            {
                string[] strArray1 = new string[3];
                string[] strArray2 = new string[length - 3];
                for (i = 0; i < 3; i++)
                {
                    strArray1[i] = list[i];
                }
                for (i = 0; i < length - 3; i++)
                {
                    strArray2[i] = list[3 + i];
                }
                //Gọi đệ quy
                results = ConverNumToString(strArray2) + " tỷ " + ConverNumToString(strArray1);
            }
            return results;
        }
        //hàm đọc một chuỗi có 3 chữ số ra chữ
        public string ReadThousand(string input)
        {
            string output = "";
            input = input.Trim();
            string numStr = input;
            int length = numStr.Length;
            if (length == 1)
                output = _strSo[Convert.ToInt32(input)];
            if (length == 2)
            {
                a = Convert.ToInt32(Convert.ToString(numStr[0]));
                b = Convert.ToInt32(Convert.ToString(numStr[1]));
                if (a != 1)
                {
                    if (b != 5 && b != 0 && b != 1)
                        output = _strSo[a] + " mươi " + ReadThousand(Convert.ToString(numStr[1]));
                    if (b == 5)
                        output = _strSo[a] + " mươi lăm";
                    if (b == 0)
                        output = _strSo[a] + " mươi";
                    if (b == 1)
                        output = _strSo[a] + " mươi mốt";
                }
                if (a == 1)
                {
                    if (b != 5)//chỗ này phải thêm đoạn &&b!==0 khưng mà nó đè ở dưới rồi nên lười viết kết quả vẫn đúng
                        output = "mười " + ReadThousand(Convert.ToString(numStr[1]));
                    else
                        output = "mười lăm";
                    if (b == 0)
                        output = "mười";
                }
            }
            if (length == 3)
            {
                a = Convert.ToInt32(Convert.ToString(numStr[0]));
                b = Convert.ToInt32(Convert.ToString(numStr[1]));
                c = Convert.ToInt32(Convert.ToString(numStr[2]));
                if (b == 0 && c != 0)
                    output = _strSo[a] + " trăm linh " + ReadThousand(Convert.ToString(numStr[2]));
                if (b != 0 && c != 0)
                    output = _strSo[a] + " trăm " + ReadThousand(Convert.ToString(numStr[1]) + Convert.ToString(numStr[2]));
                if (b == 0 && c == 0)
                {
                    output = _strSo[a] + " trăm";
                }
                if (a != 0 && b != 0 && c == 0)
                {
                    output = _strSo[a] + " trăm " + ReadThousand(Convert.ToString(numStr[1]) + Convert.ToString(numStr[2]));
                }
                if (a == 0 && b == 0 && c == 0)
                {
                    output = "";
                }
            }
            return output;
        }

        public string ConvertObjectToStringInsert(IEnumerable<object> LstObj, string TableName)
        {
            if (LstObj.Count() > 1000)
                return string.Empty;
            string result = "INSERT INTO " + TableName + "(";
            string strValues = string.Empty;
            PropertyInfo[] PropertyName = LstObj.ToList()[0].GetType().GetProperties();
            for (int i = 0; i < PropertyName.Count(); i++)
            {
                result += PropertyName[i].Name + ",";
            }
            result = result.TrimEnd(',') + ") OUTPUT INSERTED.* VALUES";
            // Genarate Values
            List<object> lst = LstObj.ToList();
            for (int j = 0; j < lst.Count; j++)
            {
                object obj = lst[j];
                strValues += "(";
                for (int k = 0; k < PropertyName.Count(); k++)
                {
                    if (PropertyName[k].PropertyType == typeof(string))
                        strValues += "'" + PropertyName[k].GetValue(obj) + "',";
                    else if (PropertyName[k].PropertyType == typeof(DateTimeOffset))
                        strValues += "'" + ((DateTimeOffset)PropertyName[k].GetValue(obj)).ToString("dd/MM/yyyy hh:mm:ss") + "',";
                    else if (PropertyName[k].PropertyType == typeof(bool) || PropertyName[k].Name == "ProductCycleType")
                    {
                        bool value = (bool)PropertyName[k].GetValue(obj);
                        strValues += (value == true ? 1 : 0) + ",";
                    }
                    else
                        strValues += PropertyName[k].GetValue(obj) + ",";
                }
                strValues = strValues.TrimEnd(',') + "),";
            }
            strValues = strValues.TrimEnd(',');
            return result + strValues;
        }

        public static string ReadNumber(decimal number)
        {
            string s = number.ToString("#");
            string[] so = new string[] { "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };
            string[] hang = new string[] { "", "nghìn", "triệu", "tỷ" };
            int i, j, donvi, chuc, tram;
            string str = " ";
            bool booAm = false;
            decimal decS = 0;
            //Tung addnew
            try
            {
                decS = Convert.ToDecimal(s.ToString());
            }
            catch
            {
            }
            if (decS < 0)
            {
                decS = -decS;
                s = decS.ToString();
                booAm = true;
            }
            i = s.Length;
            if (i == 0)
                str = so[0] + str;
            else
            {
                j = 0;
                while (i > 0)
                {
                    donvi = Convert.ToInt32(s.Substring(i - 1, 1));
                    i--;
                    if (i > 0)
                        chuc = Convert.ToInt32(s.Substring(i - 1, 1));
                    else
                        chuc = -1;
                    i--;
                    if (i > 0)
                        tram = Convert.ToInt32(s.Substring(i - 1, 1));
                    else
                        tram = -1;
                    i--;
                    if ((donvi > 0) || (chuc > 0) || (tram > 0) || (j == 3))
                        str = hang[j] + str;
                    j++;
                    if (j > 3) j = 1;
                    if ((donvi == 1) && (chuc > 1))
                        str = "một " + str;
                    else
                    {
                        if ((donvi == 5) && (chuc > 0))
                            str = "lăm " + str;
                        else if (donvi > 0)
                            str = so[donvi] + " " + str;
                    }
                    if (chuc < 0)
                        break;
                    else
                    {
                        if ((chuc == 0) && (donvi > 0)) str = "lẻ " + str;
                        if (chuc == 1) str = "mười " + str;
                        if (chuc > 1) str = so[chuc] + " mươi " + str;
                    }
                    if (tram < 0) break;
                    else
                    {
                        if ((tram > 0) || (chuc > 0) || (donvi > 0)) str = so[tram] + " trăm " + str;
                    }
                    str = " " + str;
                }
            }
            if (booAm) str = "Âm " + str;
            return str;
        }
        #endregion
    }
}
