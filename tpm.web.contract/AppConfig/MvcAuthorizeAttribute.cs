using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System;
using tpm.dto.admin;

namespace tpm.web.contract
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class MvcAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly FormOptions _formOptions;

        private bool IsAuthorizeAction { get; set; }
        public MvcAuthorizeAttribute(bool AuthorizeAction = true)
        {
            IsAuthorizeAction = AuthorizeAction;
            _formOptions = new FormOptions() { ValueCountLimit = 50000 };
        }

        public void OnAuthorization(AuthorizationFilterContext filterContext)
        {
            var features = filterContext.HttpContext.Features;
            var formFeature = features.Get<IFormFeature>();

            if (formFeature == null || formFeature.Form == null)
            {
                // Request form has not been read yet, so set the limits
                features.Set<IFormFeature>(new FormFeature(filterContext.HttpContext.Request, _formOptions));
            }

            if (filterContext == null)
            {
                filterContext.Result = new UnauthorizedResult();
                return;
            }
            var user = SessionHelper.Get<UserPrincipal>(filterContext.HttpContext.Session, SessionKeys.CurrentUser);
            if (user == null)
            {
                if (filterContext.HttpContext.Request.IsAjaxRequest())
                {
                    filterContext.Result = new UnauthorizedResult();
                    return;
                }
                string currentUrl = filterContext.HttpContext.Request?.Path.Value;
                CookieOptions option = new()
                {
                    Expires = DateTime.Now.AddMinutes(30)
                };
                filterContext.HttpContext.Response.Cookies.Append("returnUrl", currentUrl, option);
                //auth failed, redirect to login page
                filterContext.Result = new RedirectResult("~/accounts/login");
                return;
            }
            filterContext.HttpContext.User = user;
        }
    }

}
