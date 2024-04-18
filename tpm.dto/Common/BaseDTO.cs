using Dapper;

namespace tpm.dto.admin.Common
{
    public class BaseDTO
    {
        public DynamicParameters ToDynamicParameters()
        {
            var parameter = new DynamicParameters();
            foreach (var prop in this.GetType().GetProperties())
            {
                parameter.Add($"@{prop.Name}", prop.GetValue(this));
            }
            return parameter;
        }
    }
}
