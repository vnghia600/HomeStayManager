using Newtonsoft.Json;
using System;

namespace tpm.web.contract.Models
{
	public class datetimeConverter : JsonConverter
	{
		public override bool CanConvert(Type objectType)
		{
			return (objectType == typeof(DateTime) || objectType == typeof(DateTime?));
		}

		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			DateTime date = (DateTime)value;
			writer.WriteValue(date.ToString("MM/dd/yyyy HH:mm"));
		}

		public override bool CanRead
		{
			get { return false; }
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			throw new NotImplementedException();
		}

		public class HeaderMediaType
		{
			public static readonly string json = "application/json";
			public static readonly string protobuf = "application/x-protobuf";
			public static readonly string text_plain = "text/plain";
		}
	}
}
