using Core.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace tpm.business
{
    public static class QueryExtension
    {
        public static string ToQueryString(this object obj)
        {
            var properties = from p in obj.GetType().GetProperties()
                             where p.GetValue(obj, null) != null
                             select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(obj, null).ToString());

            return string.Join("&", properties.ToArray());
        }

        private static string ToSQLSelectStatement_ListInt<T>(this IEnumerable<T> data)
        {
            var lsValues = new List<string>();
            foreach (T item in data)
            {
                lsValues.Add(string.Concat("(", item.ToString(), ")"));
            }

            return string.Concat("SELECT * FROM(VALUES ", string.Join(",", lsValues), ") AS T(intValue)");
        }
        private static string ToSQLSelectStatement_ListString<T>(this IEnumerable<T> data)
        {
            var lsValues = new List<string>();
            foreach (T item in data)
            {
                if (string.IsNullOrEmpty(item.ToString()))
                {
                    lsValues.Add("('')");
                }
                else
                    lsValues.Add(string.Concat("(N'", item.ToString().Replace("'", "''"), "')"));
            }

            return string.Concat("SELECT * FROM(VALUES ", string.Join(",", lsValues), ") AS T(stringValue)");
        }
        private static string ToSQLSelectStatement_ListObject<T>(this IEnumerable<T> data, List<PropertyInfo> correctProps, List<string> tCol)
        {
            var lsValues = new List<string>();
            foreach (T item in data)
            {
                var lsPropValue = new List<string>();
                for (int i = 0; i < correctProps.Count; i++)
                {
                    var prop = correctProps[i];
                    var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                    if (prop.GetValue(item, null) == null)
                    {
                        lsPropValue.Add("NULL");
                    }
                    else
                    {
                        if (type.Name == "Boolean")
                        {
                            lsPropValue.Add((bool)prop.GetValue(item, null) ? "1" : "0");
                        }
                        else
                        if (type.Name == "String" || type.Name == "Date" || type.Name == "DateTime")
                        {
                            if (string.IsNullOrEmpty(prop.GetValue(item, null).ToString()))
                            {
                                lsPropValue.Add("''");
                            }
                            else if (type.Name == "DateTime")
                            {
                                lsPropValue.Add(string.Concat("N'", Convert.ToDateTime(prop.GetValue(item, null).ToString()).ToString("yyyy-MM-dd HH:mm:ss"), "'"));
                            }
                            else
                                lsPropValue.Add(string.Concat("N'", prop.GetValue(item, null).ToString().Replace("'", "''"), "'"));
                        }
                        else if (type.Name == "Decimal" || type.Name == "Float" || type.Name == "Double")

                            lsPropValue.Add(prop.GetValue(item, null).ToString().Replace(",", "."));
                        else
                            lsPropValue.Add(prop.GetValue(item, null).ToString());
                    }
                }
                lsValues.Add(string.Concat("(", string.Join(",", lsPropValue), ")"));
            }

            return string.Concat(
                "SELECT * FROM(VALUES "
                , string.Join(",", lsValues)
                , ") AS T("
                , string.Join(",", tCol)
                , ")"
                );
        }

        public static string ToSQLSelectStatement<T>(this IEnumerable<T> data)
        {
            string result = string.Empty;
            if (data == null || !data.Any())
                return result;
            int totalData = data.Count();
            int iCount = totalData % ServiceConfigs.SQLInsertMaxRow > 0 ? totalData / ServiceConfigs.SQLInsertMaxRow + 1 : totalData / ServiceConfigs.SQLInsertMaxRow;
            if (iCount > 1)
            {
                if (typeof(T) == typeof(int))
                {
                    for (int i = 0; i < iCount; i++)
                    {
                        var dataSkip = data.Skip(i * ServiceConfigs.SQLInsertMaxRow).Take(ServiceConfigs.SQLInsertMaxRow);
                        result += dataSkip.ToSQLSelectStatement_ListInt<T>();
                    }
                    return result;
                }
                else if (typeof(T) == typeof(string))
                {

                    for (int i = 0; i < iCount; i++)
                    {
                        var dataSkip = data.Skip(i * ServiceConfigs.SQLInsertMaxRow).Take(ServiceConfigs.SQLInsertMaxRow);
                        result += dataSkip.ToSQLSelectStatement_ListString<T>();
                    }
                    return result;
                }
                else
                {
                    //Get all the properties
                    var Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                    var correctProps = new List<PropertyInfo>();
                    foreach (PropertyInfo prop in Props)
                    {
                        //Setting column names as Property names
                        object[] attrs = prop.GetCustomAttributes(true);
                        bool ignore = false;
                        foreach (var attr in attrs)
                        {
                            var tableAtribute = attr as TableConvertAtribute;
                            if (tableAtribute != null)
                                ignore = tableAtribute.Ignore;
                        }
                        if (ignore == false)
                        {
                            correctProps.Add(prop);
                        }
                    }

                    var tCol = new List<string>();
                    for (int i = 0; i < correctProps.Count; i++)
                    {
                        tCol.Add("col_" + i.ToString());
                    }
                    for (int i = 0; i < iCount; i++)
                    {
                        var dataSkip = data.Skip(i * ServiceConfigs.SQLInsertMaxRow).Take(ServiceConfigs.SQLInsertMaxRow);
                        result += dataSkip.ToSQLSelectStatement_ListObject<T>(correctProps, tCol);
                    }
                    return result;
                }
            }
            else
            {
                if (typeof(T) == typeof(int))
                {
                    result = data.ToSQLSelectStatement_ListInt<T>();
                }
                else if (typeof(T) == typeof(string))
                {
                    result = data.ToSQLSelectStatement_ListString<T>();
                }
                else
                {
                    //Get all the properties
                    var Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                    var correctProps = new List<PropertyInfo>();
                    foreach (PropertyInfo prop in Props)
                    {
                        //Setting column names as Property names
                        object[] attrs = prop.GetCustomAttributes(true);
                        bool ignore = false;
                        foreach (var attr in attrs)
                        {
                            var tableAtribute = attr as TableConvertAtribute;
                            if (tableAtribute != null)
                                ignore = tableAtribute.Ignore;
                        }
                        if (ignore == false)
                        {
                            correctProps.Add(prop);
                        }
                    }

                    var tCol = new List<string>();
                    for (int i = 0; i < correctProps.Count; i++)
                    {
                        tCol.Add("col_" + i.ToString());
                    }

                    result = data.ToSQLSelectStatement_ListObject<T>(correctProps, tCol);
                }
            }
            return result;
        }
    }
}
