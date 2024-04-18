using Core.DTO.Response;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using tpm.business;
using tpm.dto.admin;
using Microsoft.AspNetCore.Mvc.Rendering;
using Dapper;
using System;
using tpm.dto.admin.Response;

namespace tpm.web.contract.Controllers
{
    public class ServicesController : Controller
    {
        private readonly IServiceService _serviceService;
        private readonly ServiceCreateReqValidator _validator;
        private readonly IServiceTypeService _serviceTypeService;
        private readonly IUnitService _serviceUnit;
        public ServicesController(ServiceCreateReqValidator validator, IServiceTypeService serviceTypeService)
        {
            _validator = validator;
            _serviceTypeService = serviceTypeService;
        }
        [HttpGet]
        public IActionResult GetService(int Service_ID)
        {
            var getService = _serviceService.GetServicesByID(Service_ID);

            return Json(new { Service = getService });
        }
        public IActionResult Index()
        {
            var serviceTypes = _serviceTypeService.GetAllServiceTypes();

            ViewBag.ServiceTypes = serviceTypes;

            return View();
        }
        public IActionResult Create()
        {
            return View();
        }
        #region Create Post
        [HttpPost]
        public JsonResult Create(Service_TypeCreateReq objReq)
        {
            try
            {
                int newServiceTypeID = 0;

                bool result = _serviceTypeService.Create(objReq, out newServiceTypeID);

                if (result)
                {
                    // Gọi phương thức GetServiceById để lấy thông tin dịch vụ mới
                    var newServiceType = _serviceTypeService.GetServicesTypeByID(newServiceTypeID);

                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Success,
                            Message = "Tạo mới thành công"
                        },
                        Service = newServiceType // Trả về thông tin dịch vụ mới
                    });
                }
                else
                {
                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Deny,
                            Message = "Tạo mới không thành công"
                        }
                    });
                }
            }
            catch (Exception objEx)
            {
                return Json(new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi thực hiện tạo mới: " + objEx.Message
                });
            }

        }
        #endregion
    }
}
