using AutoMapper;
using System;

namespace tpm.business.AutoMap
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DateTimeOffset?, DateTime?>().ConvertUsing<DateTimeOffsetToDateTimeNullAble>();
            CreateMap<DateTimeOffset, DateTime>().ConvertUsing<DateTimeOffsetToDateTime>();
        }

        //protected override void Configure()
        //{
        //    //CreateMap<DepartmentInsertReq, Department>();
        //    //CreateMap<DepartmentUpdateReq, Department>().ForMember(d => d.DepartmentID, o => o.Ignore());

        //    CreateMap<DateTimeOffset?, DateTime?>().ConvertUsing<DateTimeOffsetToDateTimeNullAble>();
        //    CreateMap<DateTimeOffset, DateTime>().ConvertUsing<DateTimeOffsetToDateTime>();
        //}

        public class DateTimeOffsetToDateTimeNullAble : ITypeConverter<DateTimeOffset?, DateTime?>
        {
            public DateTime? Convert(DateTimeOffset? source, DateTime? destination, ResolutionContext context)
            {
                if (source == null)
                {
                    return null;
                }
                else
                {
                    return source.Value.DateTime;
                }
            }
        }

        public class DateTimeOffsetToDateTime : ITypeConverter<DateTimeOffset, DateTime>
        {
            public DateTime Convert(DateTimeOffset source, DateTime destination, ResolutionContext context)
            {
                return source.DateTime;
            }
        }
    }
}
