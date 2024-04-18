using tpm.business.Helpers;
using Core.DataAccess;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using OfficeOpenXml.Table;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;

namespace tpm.business
{
    public static class ConvertHelper
    {
        public static DataTable ToDataTable<T>(this IList<T> data)
        {
            DataTable table = new DataTable();
            if (typeof(T) == typeof(int))
            {
                table.Columns.Add("IntValue", typeof(int));
                if (data == null)
                    return table;
                PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));
                foreach (T item in data)
                {
                    DataRow row = table.NewRow();
                    row["IntValue"] = item;
                    table.Rows.Add(row);
                }
                return table;
            }
            else if (typeof(T) == typeof(long))
            {
                table.Columns.Add("BigIntValue", typeof(long));
                if (data == null)
                    return table;
                PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));
                foreach (T item in data)
                {
                    DataRow row = table.NewRow();
                    row["BigIntValue"] = item;
                    table.Rows.Add(row);
                }
                return table;
            }
            else if (typeof(T) == typeof(string))
            {
                if (data == null)
                    return table;
                table.Columns.Add("StringValue", typeof(string));
                foreach (T item in data)
                {
                    DataRow row = table.NewRow();
                    row["StringValue"] = item;
                    table.Rows.Add(row);
                }
                return table;
            }
            else
            {

                DataTable dataTable = new DataTable(typeof(T).Name);

                //Get all the properties
                PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                var correctProps = new List<PropertyInfo>();
                foreach (PropertyInfo prop in Props)
                {
                    //Defining type of data column gives proper data table 
                    var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                    //Setting column names as Property names
                    object[] attrs = prop.GetCustomAttributes(true);
                    bool ignore = false;
                    foreach (var attr in attrs)
                    {
                        TableConvertAtribute tableAtribute = attr as TableConvertAtribute;
                        if (tableAtribute != null)
                            ignore = tableAtribute.Ignore;
                    }
                    if (ignore == false)
                    {
                        correctProps.Add(prop);
                        dataTable.Columns.Add(prop.Name, type);
                    }
                }
                if (data != null)
                    foreach (T item in data)
                    {
                        var values = new object[correctProps.Count()];
                        for (int i = 0; i < correctProps.Count; i++)
                        {
                            //inserting property values to datatable rows
                            values[i] = correctProps[i].GetValue(item, null);
                        }
                        dataTable.Rows.Add(values);
                    }
                //put a breakpoint here and check datatable
                return dataTable;
            }
        }

        public class DatatableConvertAttribute : Attribute
        {
            public bool Ignore { get; set; }
            public DatatableConvertAttribute(bool ignore)
            {
                Ignore = ignore;
            }

        }

        public static Int32 ConvertINT32(object obj, int valuedefault)
        {
            try
            {
                int value;
                if (obj == null || string.IsNullOrEmpty(obj.ToString()))
                    value = valuedefault;
                else
                    value = Convert.ToInt32(obj);
                return value;
            }
            catch
            {
                return valuedefault;
            }
        }
        public static long ConvertINT64(object obj, long valuedefault)
        {
            try
            {
                long value;
                if (obj == null || string.IsNullOrEmpty(obj.ToString()))
                    value = valuedefault;
                else
                    value = Convert.ToInt64(obj);
                return value;
            }
            catch
            {
                return valuedefault;
            }
        }
        public static decimal ConvertDecimal(object obj, decimal valueDefault)
        {
            try
            {
                decimal value;
                if (obj == null || string.IsNullOrEmpty(obj.ToString()))
                    value = valueDefault;
                else
                {
                    obj = String.Format(new CultureInfo("en-US"), "{0:C}", obj.ToString());
                    value = Convert.ToDecimal(obj);
                }
                return value;
            }
            catch
            {
                return valueDefault;
            }
        }
        public static string ConvertString(object obj, string valueDefault)
        {
            try
            {
                string value;
                if (obj == null || string.IsNullOrEmpty(obj.ToString()))
                    value = valueDefault;
                else
                    value = obj.ToString();
                return value;
            }
            catch
            {
                return valueDefault;
            }
        }
        public static bool ConvertBool(object obj, bool valueDefault)
        {
            try
            {
                bool value;
                if (obj == null || string.IsNullOrEmpty(obj.ToString()))
                    value = valueDefault;
                else
                    value = bool.Parse(obj.ToString());
                return value;
            }
            catch
            {
                return valueDefault;
            }
        }

        public static bool ContainsAll<T>(IEnumerable<T> source, IEnumerable<T> values)
        {
            return values.All(value => source.Contains(value));
        }

        public static async Task<string> ExportExcel(this List<DataTable> objTable, string fileName, bool sum, List<string> columnName)
        {
            if (objTable.Count > 0)
            {
                using (ExcelPackage pack = new ExcelPackage())
                {
                    foreach (DataTable dataTable in objTable)
                    {
                        ExcelWorksheet ws = pack.Workbook.Worksheets.Add(dataTable.TableName);
                        ws.Cells["A1"].LoadFromDataTable(dataTable, true, TableStyles.Dark10);

                        foreach (DataColumn objTableColumn in dataTable.Columns)
                        {
                            int colindex = Convert.ToInt32(dataTable.Columns.IndexOf(objTableColumn)) + 1;
                            ws.Column(colindex).AutoFit();
                            switch (System.Type.GetType(objTableColumn.DataType.ToString()).FullName)
                            {
                                case "System.Int32":
                                    ws.Column(colindex).Style.Numberformat.Format = "#,###,###,##0";
                                    break;
                                case "System.Int64":
                                    ws.Column(colindex).Style.Numberformat.Format = "#,###,###,##0";
                                    break;
                                case "System.Double":
                                    ws.Column(colindex).Style.Numberformat.Format = "#,###,###,##0";
                                    break;
                                case "System.Decimal":
                                    ws.Column(colindex).Style.Numberformat.Format = "#,###,###,##0";
                                    break;
                                case "System.DateTime":
                                    ws.Column(colindex).Style.Numberformat.Format = "dd/MM/yyyy HH:mm:ss";
                                    break;
                            }
                        }

                        ws.Cells.AutoFitColumns();
                        ws.Cells[1, 1, 1, dataTable.Columns.Count].Style.Fill.PatternType = ExcelFillStyle.Solid;
                        ws.Cells[1, 1, 1, dataTable.Columns.Count].Style.Fill.BackgroundColor
                            .SetColor(Color.FromArgb(155, 194, 230));
                        ws.Cells[1, 1, 1, dataTable.Columns.Count].Style.Font.Bold = true;

                        int lastRow = ws.Dimension.End.Row;
                        if (sum)
                        {
                            ws.Cells[lastRow + 1, 1, lastRow + 1, dataTable.Columns.Count].Style.Font.Bold = true;
                            columnName.ForEach(x =>
                            {
                                ws.Cells[lastRow + 1, Convert.ToInt32(x)].Formula = "SUM(" + ws.Cells[2, Convert.ToInt32(x)] + ":" + ws.Cells[lastRow, Convert.ToInt32(x)] + ")";
                                ws.Cells[lastRow + 1, Convert.ToInt32(x)].Style.Numberformat.Format = "#,###,###,##0";
                            });
                        }
                    }

                    var multiContent = new MultipartFormDataContent();
                    multiContent.Add(new ByteArrayContent(pack.GetAsByteArray()), "file", fileName);
                    //var apiHelper = Engine.ContainerManager.Resolve<IApiHelper>();
                    //var result = await GCSFileHelper.UploadTempDocument(apiHelper, multiContent);
                    var result = await FileHelper.Upload(multiContent);
                    return result.FilePath;
                }
            }
            return string.Empty;
        }
    }
}
