using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;
using System;
using tpm.business;
using tpm.business.Helpers;
using tpm.dto.admin;
using tpm.web.contract.Models;

namespace tpm.web.contract.Controllers
{
    public class ContractServiceTypesController : Controller
    {
        private readonly IServiceTypeService _service;
		public CodeStep objCodeStep = new CodeStep();

		public ContractServiceTypesController(IServiceTypeService service)
        {
			_service = service;
         
        }

		[HttpGet]
		[MvcAuthorize]
		public IActionResult Index()
        {
            return View();
        }

		[HttpPost]
		[MvcAuthorize(false)]
		public JsonResult Search()
		{
			try
			{
				objCodeStep.Message = "Lỗi danh sách loại dịch vụ";
				#region check sp trong cache all
				var types = _service.GetAllServiceTypes();
				if (types == null)
				{
					objCodeStep.Status = JsonStatusViewModels.Warning;
					objCodeStep.Message = $"Không tìm thấy loại dịch vụ";
					return Json(new
					{
						objCodeStep = objCodeStep
					});
				}
				#endregion

				objCodeStep.Status = JsonStatusViewModels.Success;
				return Json(new
				{
					objCodeStep = objCodeStep,
					ServiceTypes = types
				});
			}
			catch (Exception ex)
			{
				objCodeStep.Status = JsonStatusViewModels.Error;
				return Json(new
				{
					objCodeStep = objCodeStep
				});
			}
		}
	}
}
