using System;
using System.Collections.Generic;

namespace tpm.web.contract.Models
{
	public static class JsonStatusViewModels
	{
		public static string Success = "Success";
		public static string Error = "Error";
		public static string Warning = "Warning";
		public static string Info = "Info";

		public static IDictionary<int, string> StatusCode = new Dictionary<int, string>(){
			{ 204,  "Không có dữ liệu"},
			{ 205,  "Dữ liệu yêu cầu không hợp lệ"},
			{ 400,  "Dữ liệu không hợp lệ"},
			{ 401,  "Hết phiên đăng nhập, bạn vui lòng đăng nhập lại"},
			{ 403,  "Bạn không có quyền thực hiện thao tác này"},
			{ 404,  "Không tìm thấy tài nguyên"},
			{ 405,  "Sai phương thức của tài nguyên"},
			{ 406,  "Dữ liệu không hợp lệ"},
			{ 500,  "Lỗi hệ thống"},
			{ 502,  "Đường truyền kém"},
			{ 503,  "Dịch vụ ngưng hoạt động"},
			{ 504,  "Hết thời gian chờ"}
		};

		public static string Get(int code)
		{
			if (StatusCode.ContainsKey(code))
			{
				return StatusCode[code];
			}

			return "Chưa xác định";
		}
	}
}
