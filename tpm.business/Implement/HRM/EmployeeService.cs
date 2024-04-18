using Core.DataAccess.Interface;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;
using tpm.dto.admin.Response;

namespace tpm.business
{
    public class EmployeeService : IEmployeeService
    {
        #region Private Fields

        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        #endregion

        #region Constructors

        public EmployeeService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        #endregion

        #region List, ReadALL
        public IEnumerable<EmployeeRes> List()
        {
            return ReadAll();
        }


        public IEnumerable<EmployeeRes> ReadAll()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<EmployeeRes>("HRM.Employee_ReadAll");
            if (result == null)
            {
                result = new List<EmployeeRes>();
            }
            return result;
        }
        #endregion

        #region GetEmployeesWithTypeName
        public IEnumerable<EmployeeRes> GetEmployeesWithTypeName()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<EmployeeRes>("HRM.GetEmployeeWithTypeName");
            if (result == null)
            {
                result = new List<EmployeeRes>();
            }
            return result;
        }
        #endregion

        #region GetEmployeesByID
        public IEnumerable<EmployeeRes> GetEmployeesByID(int ID)
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<EmployeeRes>("HRM.GetEmployeeByID", new { ID });
            if (result == null)
            {
                result = new List<EmployeeRes>();
            }
            return result;
        }
        #endregion

        #region Create
        public bool Create(EmployeeCreateReq objReq, out int newID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm các tham số với giá trị từ các thuộc tính của đối tượng obj truyền vào
                param.Add("@EmployeeID", objReq.EmployeeID);
                param.Add("@FullName", objReq.FullName);
                param.Add("@DOB", objReq.DOB);
                param.Add("@DepartmentID", objReq.DepartmentID);
                param.Add("@PositionID", objReq.PositionID);
                param.Add("@GenderID", objReq.GenderID);
                param.Add("@Phone", objReq.Phone);
                param.Add("@Email", objReq.Email);
                param.Add("@EmployeeTypeID", objReq.EmployeeTypeID);

                // Thực hiện gọi stored procedure để thêm dữ liệu vào database
                newID = _objReadOnlyRepository.Value.Connection.ExecuteScalar<int>("HRM.Employee_Create", param, commandType: CommandType.StoredProcedure);

                // Kiểm tra Service_ID mới
                if (newID > 0)
                {
                    // Trả về kết quả thành công
                    return true;
                }

                // Trả về false nếu không tạo mới được dữ liệu
                return false;
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và ném ra ngoại lệ
                throw new Exception("Có lỗi xảy ra trong quá trình thực thi stored procedure.", ex);
            }
        }
        #endregion

        #region Update
        public bool Update(EmployeeCreateReq objReq, int ID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm các tham số với giá trị từ các thuộc tính của đối tượng obj truyền vào
                param.Add("@ID", ID);
                param.Add("@EmployeeID", objReq.EmployeeID);
                param.Add("@FullName", objReq.FullName);
                param.Add("@DOB", objReq.DOB);
                param.Add("@DepartmentID", objReq.DepartmentID);
                param.Add("@PositionID", objReq.PositionID);
                param.Add("@GenderID", objReq.GenderID);
                param.Add("@Phone", objReq.Phone);
                param.Add("@Email", objReq.Email);
                param.Add("@EmployeeTypeID", objReq.EmployeeTypeID);

                // Thực hiện gọi stored procedure để cập nhật dữ liệu trong database
                _objReadOnlyRepository.Value.Connection.Execute("HRM.Employee_Update", param, commandType: CommandType.StoredProcedure);

                // Trả về kết quả thành công
                return true;
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và ném ra ngoại lệ
                throw new Exception("Có lỗi xảy ra trong quá trình thực thi stored procedure.", ex);
            }
        }
        #endregion

        #region Delete
        public bool Delete(int ID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm tham số với giá trị từ serviceId truyền vào
                param.Add("@ID", ID);

                // Thực hiện gọi stored procedure để xóa dữ liệu trong database
                var storedProcedureResult = _objReadOnlyRepository.Value.Connection.Execute("HRM.Employee_Detete", param, commandType: CommandType.StoredProcedure);

                // Kiểm tra số dòng trả về
                if (storedProcedureResult > 0)
                {
                    // Trả về kết quả thành công
                    return true;
                }

                // Trả về false nếu không tìm thấy dữ liệu trong kết quả trả về
                return false;
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và ném ra ngoại lệ
                throw new Exception("Có lỗi xảy ra trong quá trình thực thi stored procedure.", ex);
            }
        }
        #endregion

        #region Dispose
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    if (_objRepository.IsValueCreated)
                        _objRepository.Value.Dispose();
                    if (_objReadOnlyRepository.IsValueCreated)
                        _objReadOnlyRepository.Value.Dispose();
                }
                _disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        ~EmployeeService()
        {
            Dispose(false);
        }
        #endregion
    }
}
