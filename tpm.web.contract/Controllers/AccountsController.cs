using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using tpm.business.Helpers;
using tpm.business;
using tpm.dto.admin;
using tpm.web.contract.Models;
using System.Net;

namespace tpm.web.contract.Controllers
{
    public class AccountsController : BaseController
    {
        private readonly IUserService _userService;

        public AccountsController(IUserService userService)
        {
			_userService = userService;
        }
        public ActionResult Login()
        {
            var user = SessionHelper.Get<UserPrincipal>(HttpContext.Session, SessionKeys.CurrentUser);
            if (user != null && user.UserID > 0)
                return RedirectToAction("Index", "Home");
            return PartialView("Loginv1");
        }

        [HttpPost]
        public async Task<ActionResult> Login(UserLoginReq obj)
        {
            try
            {
                var userresult = await _userService.login(obj);
                if (userresult.StatusCode != Core.DTO.Response.CRUDStatusCodeRes.Success || userresult.Data == null)
				{
					// Thông báo lỗi đăng nhập không hợp lệ
					ModelState.AddModelError("", "Thông tin đăng nhập không chính xác.");
					return PartialView("Loginv1");
				}
                var objuser = userresult.Data;
				if (!objuser.Password.Equals(obj.password))
				{
					ModelState.AddModelError("", "Thông tin đăng nhập không chính xác.");
					return PartialView("Loginv1");
				}
                UserPrincipal userPrincipal = new UserPrincipal() { 
                    FullName = objuser.FullName,
                    UserID= objuser.UserID,
                    Phone = $"0{objuser.Phone}",
                    Email = objuser.Email
                };
				List<string> splitName = userPrincipal.FullName.Split(' ').ToList();
				string name = splitName[splitName.Count - 1].Substring(0, 1);
				string DisplayName = userPrincipal.FullName;
				if (splitName.Count > 2)
				{
					DisplayName = string.Format("{0} {1}", splitName[splitName.Count - 2], splitName[splitName.Count - 1]);
				}
				userPrincipal.CFName = StringHelper.ToUnsignString(name);
				userPrincipal.DisplayName = DisplayName;

				// Lưu thông tin người dùng vào session
				SessionHelper.Set(HttpContext.Session, SessionKeys.CurrentUser, userPrincipal);

                var url = HttpContext.Request.Cookies["returnUrl"] ?? string.Empty;

                if (!string.IsNullOrEmpty(url))
                {
                    return Redirect(url);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
                
            }
            catch (Exception)
            {
                throw;
            }
        }





        public ActionResult Logout()
        {
            //var userPricinpal = SessionHelper.Get<UserPrincipal>(HttpContext.Session, SessionKeys.UserPricinpal);
            //if (userPricinpal == null)
            //{
            //    return Redirect("/");
            //}

            //var idtoken = userPricinpal.Token;
            //HttpContext.Session.Remove(SessionKeys.UserPricinpal);

            //var idsEndPoint = AppCoreConfig.URLConnection.IDSUrl;
            //var redirectUrl = AppConfig.URLConnection.ClientUrl;

            //var url = string.Format(@"{0}/connect/endsession?post_logout_redirect_uri={1}&id_token_hint={2}&state={3}",
            //    idsEndPoint, redirectUrl, WebUtility.UrlDecode(idtoken),
            //    Guid.NewGuid().ToString("N"));

            SessionHelper.Remove(HttpContext.Session, SessionKeys.CurrentUser);
            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        [MvcAuthorize(AuthorizeAction: false)]
        public ActionResult ReLogin()
        {
            //ViewBag.UserName = CurrentUser.Username;
            return View();
        }
    }
}
