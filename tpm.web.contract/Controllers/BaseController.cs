using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using tpm.business.Helpers;
using tpm.dto.admin;
using tpm.web.contract.Models;

namespace tpm.web.contract.Controllers
{
    public class BaseController : Controller
    {

        protected UserPrincipal CurrentUser
        {
            get { return User as UserPrincipal; }
        }

        protected void ResponseFileExcel(ExcelPackage excelPackage, string saveAsFileName)
        {
            Response.Headers.Clear();
            Response.ContentType = "application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            Response.Headers.Add("Content-Disposition", string.Format("attachment;filename={0}", saveAsFileName));
            Response.Headers.Add("FileName", saveAsFileName);
            Response.Body.Write(excelPackage.GetAsByteArray());
            Response.Body.Flush();
        }

        public BaseController()
        {

        }

    }
}
