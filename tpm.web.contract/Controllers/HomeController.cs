using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using tpm.web.contract.Models;

namespace tpm.web.contract.Controllers
{
    public class HomeController : BaseController
    {

        public HomeController()
        {
        }

        [MvcAuthorize]
        public IActionResult Index()
        {
            return View("Indexv1");
        }

        [MvcAuthorize]
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

    }
}
