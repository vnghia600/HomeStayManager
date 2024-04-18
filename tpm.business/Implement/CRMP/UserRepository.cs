using System;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using tpm.dto.admin;

namespace tpm.business
{
    public class UserRepository
    {
        private readonly IConfiguration configuration;

        public UserRepository(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public string ValidateLogin(UserPrincipal obj)
        {
            try
            {
                string connectionString = configuration.GetConnectionString("DefaultConnection");

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    string query = "SELECT COUNT(*) FROM USR.[User] WHERE (Phone = @PhoneOrEmail OR Email = @PhoneOrEmail) AND Password = @Password";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@PhoneOrEmail", obj.Email);
                    command.Parameters.AddWithValue("@Password", obj.Password);

                    connection.Open();
                    int result = (int)command.ExecuteScalar();

                    if (result > 0)
                    {
                        return "Success";
                    }
                    else
                    {
                        return "Invalid login credentials";
                    }
                }
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ ở đây
                return "An error occurred: " + ex.Message;
            }
        }
    }
}
