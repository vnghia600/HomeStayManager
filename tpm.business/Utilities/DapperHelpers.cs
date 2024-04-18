using System.Collections.Generic;
using System.Dynamic;

namespace tpm.business
{
    public static class DapperHelpers
    {
        public static dynamic ToExpandoObject(object value)
        {
            IDictionary<string, object> dapperRowProperties = value as IDictionary<string, object>;

            IDictionary<string, object> expando = new ExpandoObject();

            foreach (KeyValuePair<string, object> property in dapperRowProperties)
                expando.Add(property.Key, property.Value);

            return expando as ExpandoObject;
        }
        public static List<Dictionary<string, object>> ConvertParamToDynamic<T>(IEnumerable<T> obj)
        {
            var dicts = new List<Dictionary<string, object>>();

            foreach (var item in obj)
            {
                var dict = new Dictionary<string, object>();
                foreach (var pro in item.GetType().GetProperties())
                {
                    dict.Add(pro.Name, item.GetType().GetProperty(pro.Name).GetValue(item, null));
                }
                dicts.Add(dict);
            }
            return dicts;

        }        

    }
}
