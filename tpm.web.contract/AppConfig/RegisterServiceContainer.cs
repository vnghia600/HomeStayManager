using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System;
using Autofac;
using Core.DataAccess.Implement;
using Core.DataAccess.Interface;
using System.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net.Http;
using System.Net;
using tpm.business;
using tpm.dto;

namespace tpm.web.contract
{
    public static class RegisterServiceContainer
    {
        public static void RegisterServiceDependencyAutofac(this ContainerBuilder builder)
        {
            RegisterInstanceInBusinessProjectToUsingCache(builder);
            RegisterDefaultConnection(builder);
        }
        private static void RegisterInstanceInBusinessProjectToUsingCache(ContainerBuilder builder)
        {
            builder.Register(c => new HttpClient(new HttpClientHandler()
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
            })).As<HttpClient>().InstancePerLifetimeScope();
            builder.RegisterModule<AutoFacModule>();

            var assembly = System.AppDomain.CurrentDomain.GetAssemblies().SingleOrDefault(i => i.GetName().Name.ToLower().Contains("business"));
            if (assembly != null)
            {
                builder.RegisterAssemblyTypes(assembly).AsImplementedInterfaces().InstancePerLifetimeScope();
            }
        }
        private static void RegisterDefaultConnection(ContainerBuilder builder)
        {
            builder.Register(c => new SqlConnection(AppSetting.Connection.DefaultConnection)).As<IDbConnection>().InstancePerLifetimeScope();
            builder.RegisterType<DapperReadOnlyRepository>().As<IReadOnlyRepository>().InstancePerLifetimeScope();
            builder.RegisterType<DapperRepository>().As<IRepository>().InstancePerLifetimeScope();
        }
        
        public static IServiceCollection RegisterAssemblyTypes<T>(this IServiceCollection services, ServiceLifetime lifetime, List<Func<TypeInfo, bool>> predicates = null)
        {
            var scanAssemblies = AppDomain.CurrentDomain.GetAssemblies().ToList();
            scanAssemblies.SelectMany(x => x.GetReferencedAssemblies())
                .Where(t => false == scanAssemblies.Any(a => a.FullName == t.FullName))
                .Distinct()
                .ToList()
                .ForEach(x => scanAssemblies.Add(AppDomain.CurrentDomain.Load(x)));

            var interfaces = scanAssemblies
                .SelectMany(o => o.DefinedTypes
                    .Where(x => x.IsInterface)
                    .Where(x => x != typeof(T))
                    .Where(x => typeof(T).IsAssignableFrom(x))
                );

            foreach (var @interface in interfaces)
            {
                var types = scanAssemblies
                    .SelectMany(o => o.DefinedTypes
                        .Where(x => x.IsClass)
                        .Where(x => @interface.IsAssignableFrom(x))
                    );

                if (predicates?.Count > 0)
                {
                    foreach (var predict in predicates)
                    {
                        types = types.Where(predict);
                    }
                }

                foreach (var type in types)
                {
                    services.TryAdd(new ServiceDescriptor(
                        @interface,
                        type,
                        lifetime)
                    );
                }
            }

            return services;
        }

    }
}
