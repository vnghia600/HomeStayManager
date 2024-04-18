using tpm.business.Helpers;
using Core.DTO.Response;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace tpm.business.Utilities
{
    public static class ExcelExtension
    {
        public static ExcelResult<IEnumerable<T>> ConvertExcelToList<T>(this object value, string filePath) where T : new()
        {
            T obj = new T();
            List<T> Datas = new List<T>();
            List<string> lstNameProp = typeof(T).GetProperties().Select(c => c.Name).ToList();
            List<string> lstNameFile = new List<string>();
            List<Mapping> lstMappingProp = new List<Mapping>();

            var fileBytes = FileHelper.GetFile(filePath).Result;

            if (fileBytes == null)
            {
                return new ExcelResult<IEnumerable<T>> { Status = false, Code = "1", Data = null };
            }

            using (var stream = new MemoryStream(fileBytes))
            {
                using (ExcelPackage package = new ExcelPackage(stream))
                {
                    ExcelWorksheet workSheet = package.Workbook.Worksheets["Values"];
                    int totalRows = workSheet.Dimension.Rows;//get total rows counts of excel file
                    int totalColumns = workSheet.Dimension.Columns;// get total columns count of excel file.
                    if (totalRows > 1)
                    {
                        for (int i = 2; i <= totalRows; i++)
                        {
                            var headerModel = new Dictionary<object, string>();
                            for (int j = 1; j <= totalColumns; j++)
                            {
                                if (workSheet.Cells[i, j].Value != null)
                                    headerModel.Add(workSheet.Cells[1, j].Value, workSheet.Cells[i, j].Value.ToString());
                                else
                                    headerModel.Add(workSheet.Cells[1, j].Value, "0");
                            }

                            var json = JsonConvert.SerializeObject(headerModel);
                            var header = JsonConvert.DeserializeObject<Mapping>(json);
                            lstMappingProp.Add(new Mapping { Name = header.Name, Title = header.Title, IsNull = header.IsNull });
                        }

                        lstNameFile = lstMappingProp.Select(c => c.Name).Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                        var temp = lstNameFile.Except(lstNameProp);//lay nhung phan tu co trong lstNameFile ma k co trong lstNameProp
                        if (temp.Count() >= 1)
                            return new ExcelResult<IEnumerable<T>> { Status = false, Code = "2", Data = null };

                        ExcelWorksheet workSheetData = package.Workbook.Worksheets.FirstOrDefault(x => x.Name.Contains("Data"));
                        totalRows = workSheetData.Dimension.Rows;//get total rows counts of excel file
                        totalColumns = workSheetData.Dimension.Columns;// get total columns count of excel file.

                        for (int i = 2; i <= totalRows; i++)
                        {
                            var excelViewModels = new Dictionary<object, string>();
                            for (int j = 1; j <= totalColumns; j++)
                            {
                                if (workSheetData.Cells[i, j].Value != null)
                                {
                                    var title = workSheetData.Cells[1, j].Text;
                                    var headerModel = lstMappingProp.FirstOrDefault(x => title.Equals(x.Title) && !string.IsNullOrWhiteSpace(x.Title));

                                    if (headerModel == null)
                                    {
                                        return new ExcelResult<IEnumerable<T>> { Status = false, Code = "2", Data = null };
                                    }

                                    if (!workSheetData.Cells[i, j].Style.Numberformat.Format.ToString().Contains("dd/mm/yyyy"))
                                    {
                                        excelViewModels.Add(headerModel.Name, workSheetData.Cells[i, j].Value.ToString());
                                    }
                                    else
                                    {
                                        if (workSheetData.Cells[i, j].Value is double)
                                        {
                                            double d = double.Parse(workSheetData.Cells[i, j].Value.ToString());
                                            DateTime conv = DateTime.FromOADate(d);
                                            excelViewModels.Add(headerModel.Name, conv.ToString());
                                        }
                                        else
                                        {
                                            string[] validFormats = { "dd/MM/yyyy", "dd/MM/yyyy HH:mm" };
                                            var cellValue = DateTime.TryParseExact(workSheetData.Cells[i, j].Value.ToString(), validFormats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime conv);

                                            excelViewModels.Add(headerModel.Name, conv.ToString());
                                        }
                                    }
                                }
                            }
                            string json = JsonConvert.SerializeObject(excelViewModels);
                            Datas.Add(JsonConvert.DeserializeObject<T>(json));
                        }
                    }
                }
            }
            return new ExcelResult<IEnumerable<T>> { Status = true, Code = "", Data = Datas };
        }
    }

    public class Mapping
    {
        public string Title { get; set; }
        public string Name { get; set; }
        public int IsNull { get; set; }
    }
}
