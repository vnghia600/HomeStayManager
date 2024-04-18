using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using tpm.business;
using tpm.dto;

namespace tpm.web.contract
{
    public static class CoreExtensions
    {
        public static void ConfigAPI(this IServiceCollection services, IConfiguration Configuration)
        {
            AppSetting.Logger = new AppSettingLogger();
            AppSetting.Connection = new ConnectionStrings();
            AppSetting.Common = new AppSettingCommon();
            Configuration.Bind("Logger", AppSetting.Logger);
            Configuration.Bind("ConnectionStrings", AppSetting.Connection);
            Configuration.Bind("CommonStrings", AppSetting.Common);

            //services.AddAutoMapper();
            services.AddHttpContextAccessor();
            services.AddMemoryCache();

			services.AddControllersWithViews();
            services.AddControllers()
                    .AddJsonOptions(opts => opts.JsonSerializerOptions.PropertyNamingPolicy = null);
            services.AddDistributedMemoryCache();
            services.AddRouting(options => options.LowercaseUrls = true);
            services.AddSession(options =>
            {
                // Set a short timeout for easy testing.
                options.IdleTimeout = TimeSpan.FromSeconds(60 * 30);
                options.Cookie.HttpOnly = true;
				options.Cookie.IsEssential = true;
			});
            
            MemoryCacheOptions memCacheOption = new MemoryCacheOptions();
            //MemoryCacheManager memCache = new MemoryCacheManager(new MemoryCache(memCacheOption));
            //services.AddSingleton<IMemoryCacheManager>(memCache);

            services.AddResponseCompression(options =>
            {
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
                options.MimeTypes =
                    ResponseCompressionDefaults.MimeTypes.Concat(
                        new[] { "image/svg+xml" });
            });
            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest;
            });

            services.Configure<FormOptions>(options =>
            {
                options.ValueCountLimit = int.MaxValue;
            });
        }

        public static void ConfigAPI(this IApplicationBuilder app)
        {
            app.UseResponseCompression();
        }
    }
}
