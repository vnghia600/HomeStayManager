using Autofac;
using Autofac.Extensions.DependencyInjection;
using CoC.MoonSheep.Business;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using tpm.business;
using CoC.Business.DTO;
using FluentValidation;
using tpm.dto.admin;

namespace tpm.web.contract
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.ConfigAPI(Configuration);
            services.AddScoped<UserRepository>();
            services.AddControllersWithViews();
            services.AddTransient<ServiceCreateReqValidator>();
            services.AddTransient<EmployeeCreateReqValidator>();
            services.AddTransient<ContractCreateReqValidator>();


        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            builder.RegisterServiceDependencyAutofac();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            Engine.ContainerManager = new ContainerManager(app.ApplicationServices.GetAutofacRoot());

            app.UseSession();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }
            app.ConfigAPI();
            app.UseResponseCaching();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
