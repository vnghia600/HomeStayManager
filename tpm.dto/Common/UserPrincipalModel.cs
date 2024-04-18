using System.Security.Claims;

namespace tpm.dto.admin
{
    public class UserPrincipal : ClaimsPrincipal
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }   
        public string Email { get; set; }
		public string CFName { get; set; }
		public string DisplayName { get; set; }
	}
}
