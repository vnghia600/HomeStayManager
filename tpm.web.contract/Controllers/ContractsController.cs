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
    public class ContractsController : Controller
    {
        private readonly IServiceService _serviceService;
        private readonly ServiceCreateReqValidator _validator;
        private readonly IServiceTypeService _serviceTypeService;
        private readonly IUnitService _serviceUnit;
        private readonly IContractService _contractService;
        private readonly IContractTypeService _contractTypeService;
        private readonly ContractCreateReqValidator _validationRules;

        public ContractsController(IServiceService serviceService, ServiceCreateReqValidator validator, 
            IServiceTypeService serviceTypeService, IUnitService serviceUnit,IContractService contractService, 
            IContractTypeService contractTypeService,ContractCreateReqValidator validationRules)
        {
            _serviceService = serviceService;
            _validator = validator;
            _serviceTypeService = serviceTypeService;
            _serviceUnit = serviceUnit;
            _contractService = contractService;
            _contractTypeService = contractTypeService;
            _validationRules = validationRules;
        }
       
        public IActionResult Index()
        {
            return View();
        }

        #region GetService
        [HttpGet]
        public IActionResult GetService(int Service_ID)
        {
            var getService = _serviceService.GetServicesByID(Service_ID);

            return Json(new { Service = getService });
        }
        #endregion

        #region GetContract
        [HttpGet]
        public IActionResult GetContract(int Contract_ID)
        {
            var getContract = _contractService.GetContractsByID(Contract_ID);

            return Json(new { Contract = getContract });
        }
        #endregion

        #region Create
        public IActionResult Create()
        {
            var services = _serviceService.GetServicesWithTypeName();
            var serviceTypes = _serviceTypeService.GetAllServiceTypes();
            var units = _serviceUnit.GetAllUnits();
            var contracts = _contractService.GetContractsWithTypeName();
            var contractTypes = _contractTypeService.GetAllContractTypes();
           

            ViewBag.Services = services;
            ViewBag.ServiceTypes = serviceTypes;
            ViewBag.Unit = units;
            ViewBag.Contracts = contracts;
            ViewBag.ContractTypes = contractTypes;
       

            return View();
        }
        #endregion

        #region Create Post
        [HttpPost]
        public JsonResult Create(ServiceCreateReq objReq)
        {
            try
            {
                int newServiceID = 0;

                bool result = _serviceService.Create(objReq, out newServiceID);

                if (result)
                {
					// Gọi phương thức GetServiceById để lấy thông tin dịch vụ mới
					var newService = _serviceService.GetServicesByID(newServiceID);

                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Success,
                            Message = "Tạo mới thành công"
                        },
                        Service = newService // Trả về thông tin dịch vụ mới
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

        #region Update
        [HttpPost]
        public IActionResult Update(ServiceCreateReq objReq, int Service_ID)
        {
            try
            {
                bool result = _serviceService.Update(objReq, Service_ID);

                if (result)
                {
                    // Gọi phương thức GetServiceById để lấy thông tin dịch vụ mới
                    var updateService = _serviceService.GetServicesByID(Service_ID);

                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Success,
                            Message = "Tạo mới thành công"
                        },
                        Service = updateService // Trả về thông tin dịch vụ mới
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

        #region Delete
        [HttpDelete]
        public JsonResult Delete(int serviceID)
        {
            try
            {
                // Gọi phương thức xóa dịch vụ từ service
                bool deleteResult = _serviceService.Delete(serviceID);

                if (deleteResult)
                {
                    return Json(new { success = true });
                }
                else
                {
                    return Json(new { success = false, message = "Xóa dịch vụ không thành công!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra trong quá trình xóa dịch vụ!", error = ex.Message });
            }
        }
        #endregion

        #region Create Contract Post
        [HttpPost]
        public JsonResult CreateContract(ContractCreateReq objReq)
        {
            try
            {
                int newContractID = 0;

                bool result = _contractService.Create(objReq, out newContractID);

                if (result)
                {
                    // Gọi phương thức GetServiceById để lấy thông tin dịch vụ mới
                    var newContract = _contractService.GetContractsByID(newContractID);

                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Success,
                            Message = "Tạo mới thành công"
                        },
                        Contract = newContract // Trả về thông tin dịch vụ mới
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

        #region Update Contract
        [HttpPost]
        public IActionResult UpdateContract(ContractCreateReq objReq, int Contract_ID)
        {
            try
            {
                bool result = _contractService.Update(objReq, Contract_ID);

                if (result)
                {
                    // Gọi phương thức GetServiceById để lấy thông tin dịch vụ mới
                    var updateContract = _contractService.GetContractsByID(Contract_ID);

                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Success,
                            Message = "Cập nhật thành công"
                        },
                        Contract = updateContract // Trả về thông tin dịch vụ mới
                    });
                }
                else
                {
                    return Json(new
                    {
                        objCodeStep = new
                        {
                            Status = CRUDStatusCodeRes.Deny,
                            Message = "Cập nhật không thành công"
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

        #region Delete
        [HttpDelete]
        public JsonResult DeleteContract(int contractID)
        {
            try
            {
                // Gọi phương thức xóa dịch vụ từ service
                bool deleteResult = _contractService.Delete(contractID);

                if (deleteResult)
                {
                    return Json(new { success = true });
                }
                else
                {
                    return Json(new { success = false, message = "Xóa không thành công!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra trong quá trình xóa!", error = ex.Message });
            }
        }
        #endregion

        #region ServiceDetail
        public IActionResult ServiceDetail()
        {
            return View();
        }
        #endregion
    }
}

