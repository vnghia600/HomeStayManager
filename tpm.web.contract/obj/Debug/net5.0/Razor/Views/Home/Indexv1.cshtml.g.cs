#pragma checksum "E:\Source\HomeStayManager\tpm.web.contract\Views\Home\Indexv1.cshtml" "{8829d00f-11b8-4213-878b-770e8597ac16}" "5610684b77b922b88e482beb598ec580d11f94acd32de339ccbe94a96e78cb7a"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Views_Home_Indexv1), @"mvc.1.0.view", @"/Views/Home/Indexv1.cshtml")]
namespace AspNetCore
{
    #line hidden
    using global::System;
    using global::System.Collections.Generic;
    using global::System.Linq;
    using global::System.Threading.Tasks;
    using global::Microsoft.AspNetCore.Mvc;
    using global::Microsoft.AspNetCore.Mvc.Rendering;
    using global::Microsoft.AspNetCore.Mvc.ViewFeatures;
#nullable restore
#line 1 "E:\Source\HomeStayManager\tpm.web.contract\Views\_ViewImports.cshtml"
using tpm.web.contract;

#line default
#line hidden
#nullable disable
#nullable restore
#line 2 "E:\Source\HomeStayManager\tpm.web.contract\Views\_ViewImports.cshtml"
using tpm.web.contract.Models;

#line default
#line hidden
#nullable disable
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"Sha256", @"5610684b77b922b88e482beb598ec580d11f94acd32de339ccbe94a96e78cb7a", @"/Views/Home/Indexv1.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"Sha256", @"4f6ea84b5937f879fbf6ef0ab5d0e2705299a1f53bdbbb98a6425e65faeefcc6", @"/Views/_ViewImports.cshtml")]
    #nullable restore
    public class Views_Home_Indexv1 : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<dynamic>
    #nullable disable
    {
        private static readonly global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute __tagHelperAttribute_0 = new global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute("src", new global::Microsoft.AspNetCore.Html.HtmlString("~/script-handler/home/home.js"), global::Microsoft.AspNetCore.Razor.TagHelpers.HtmlAttributeValueStyle.DoubleQuotes);
        #line hidden
        #pragma warning disable 0649
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperExecutionContext __tagHelperExecutionContext;
        #pragma warning restore 0649
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner __tagHelperRunner = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner();
        #pragma warning disable 0169
        private string __tagHelperStringValueBuffer;
        #pragma warning restore 0169
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __backed__tagHelperScopeManager = null;
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __tagHelperScopeManager
        {
            get
            {
                if (__backed__tagHelperScopeManager == null)
                {
                    __backed__tagHelperScopeManager = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager(StartTagHelperWritingScope, EndTagHelperWritingScope);
                }
                return __backed__tagHelperScopeManager;
            }
        }
        private global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper;
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
#nullable restore
#line 1 "E:\Source\HomeStayManager\tpm.web.contract\Views\Home\Indexv1.cshtml"
  
    ViewData["Title"] = "Home Page";
    List<string> BreadCrumb = new List<string>();
    //BreadCrumb.Add("<a href='index.html' class='breadcrumb-item'>name</a>");
    BreadCrumb.Add("<span class='breadcrumb-item active'> Trang chủ</span>");
    ViewBag.BreadCrumb = BreadCrumb;

#line default
#line hidden
#nullable disable
            WriteLiteral(@"
<div class=""content-inner"" ng-controller=""IndexController"">
    <div class=""card"">
        <div class=""card-body"">
            <div class=""table-responsive"">
                <table class=""table table-bordered datatable-basic table-hover"">
                    <thead>
                        <tr>
                            <th style=""text-align: center;"">Tên phòng</th>
                            <th style=""text-align: center;"">Khách thuê</th>
                            <th style=""text-align: center;"">Thời gian</th>
                            <th style=""text-align: center;"">Ghi chú</th>
                            <th style=""text-align:center; width: 10rem;"">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr ng-repeat=""item in home.roomInfo"">
                            <td>{{item.RoomName}}</td>
                            <td>{{item.CustomerName}}</td>
                            <td>{{item.Time}}</td>
      ");
            WriteLiteral(@"                      <td>{{item.Note}}</td>
                            <td style=""text-align: center;vertical-align: middle; padding: 0px; margin: 0;"">
                                <a href=""/ProductUnits/Edit/{{item.ProductUnitID}}""
                            <i class=""icon-pencil7 icon-1x"" title=""Cập nhật""></i>
                        </a>
                                <a href=""#"" ng-click=""ProductUnits.Delete(item.ProductUnitID)"" class=""text-danger"">
                                    <i class=""icon-bin icon-1x"" title=""Xóa""></i>
                                </a>
                            </td>
                        </tr>
                        <tr ng-show=""home.roomInfo == 0"" style=""text-align:center"" class=""ng-hide"">
                            <td colspan=""6"">Không có dữ liệu</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>


");
            DefineSection("jsScript", async() => {
                WriteLiteral("\r\n    ");
                __tagHelperExecutionContext = __tagHelperScopeManager.Begin("script", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "5610684b77b922b88e482beb598ec580d11f94acd32de339ccbe94a96e78cb7a6234", async() => {
                }
                );
                __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper = CreateTagHelper<global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper>();
                __tagHelperExecutionContext.Add(__Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper);
                __tagHelperExecutionContext.AddHtmlAttribute(__tagHelperAttribute_0);
                await __tagHelperRunner.RunAsync(__tagHelperExecutionContext);
                if (!__tagHelperExecutionContext.Output.IsContentModified)
                {
                    await __tagHelperExecutionContext.SetOutputContentAsync();
                }
                Write(__tagHelperExecutionContext.Output);
                __tagHelperExecutionContext = __tagHelperScopeManager.End();
                WriteLiteral("\r\n");
            }
            );
        }
        #pragma warning restore 1998
        #nullable restore
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.ViewFeatures.IModelExpressionProvider ModelExpressionProvider { get; private set; } = default!;
        #nullable disable
        #nullable restore
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IUrlHelper Url { get; private set; } = default!;
        #nullable disable
        #nullable restore
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IViewComponentHelper Component { get; private set; } = default!;
        #nullable disable
        #nullable restore
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IJsonHelper Json { get; private set; } = default!;
        #nullable disable
        #nullable restore
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<dynamic> Html { get; private set; } = default!;
        #nullable disable
    }
}
#pragma warning restore 1591
