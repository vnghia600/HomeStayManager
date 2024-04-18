using Newtonsoft.Json;
using System.ComponentModel;
using tpm.dto;

namespace tpm.web.contract.Models
{
	public class CodeStep
	{
		public string Status { get; set; }
		[JsonIgnore]
		public int HTTPStatusCode { get; set; }
		/// <summary>
		/// Thông báo cho người dùng 
		/// </summary>
		public string Message { get; set; }

		/// <summary>
		/// Đã hoàn tất ở bước nào "1" || "2" || "3"
		/// </summary>
		private string _SuccessStep = string.Empty;
		public string SuccessStep
		{
			get
			{
				return (AppSetting.Common.APIDebug) ? this._SuccessStep : string.Empty;
			}
			set { this._SuccessStep = value; }
		}
		/// <summary>
		/// Chi tiết lỗi ở đoạn nào >> tương đương ErrorCaption, coder thay thoi
		/// </summary>
		private string _ErrorStep = string.Empty;
		public string ErrorStep
		{
			get
			{
				return (AppSetting.Common.APIDebug) ? this._ErrorStep : "Lỗi API";
			}
			set { this._ErrorStep = value; }
		}

		/// <summary>
		/// nội dung chi tiết lỗi, coder thay thoi
		/// </summary>
		private string _ErrorMessage = string.Empty;
		public string ErrorMessage
		{
			get
			{
				return (AppSetting.Common.APIDebug) ? this._ErrorMessage : string.Empty;
			}
			set { this._ErrorMessage = value; }
		}

		/// <summary>
		/// Dữ liệu cần trả về người dùng
		/// </summary>
		public object Data { get; set; }

		/// <summary>
		/// Dữ liệu cần trả về người dùng
		/// </summary>
		private object _DataSend = null;
		public object DataSend
		{
			get
			{
				if (AppSetting.Common.APIDebug)
				{
					JsonSerializerSettings settings = new JsonSerializerSettings();
					settings.Converters.Add(new datetimeConverter());
					return JsonConvert.SerializeObject(this._DataSend, settings);
				}
				else
				{
					return null;
				}
			}
			set { this._DataSend = value; }
		}

		public string SetStatusError()
		{
			if (Status == JsonStatusViewModels.Success || string.IsNullOrEmpty(Status))
			{
				return JsonStatusViewModels.Error;
			}
			else if (this.HTTPStatusCode == 204)
			{
				this.Message = Define204Message;
				return (!string.IsNullOrEmpty(this.Message) && this.Message.Contains("Lỗi")) ? JsonStatusViewModels.Error : JsonStatusViewModels.Warning;
			}

			return (!string.IsNullOrEmpty(this.Message) && this.Message.Contains("Lỗi")) ? JsonStatusViewModels.Error : JsonStatusViewModels.Warning;
		}

		public string GetSuccessStep()
		{
			return this._SuccessStep;
		}

		public string GetErrorStep()
		{
			return this._ErrorStep;
		}

		public string GetErrorMessage()
		{
			return this._ErrorMessage;
		}

		public string GetDataSend()
		{
			JsonSerializerSettings settings = new JsonSerializerSettings();
			settings.Converters.Add(new datetimeConverter());
			return JsonConvert.SerializeObject(this._DataSend, settings);
		}
		public string Define204Message { get; set; } = "Không có dữ liệu";

	}
}
