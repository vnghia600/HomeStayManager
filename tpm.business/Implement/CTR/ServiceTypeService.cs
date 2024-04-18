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
    public class ServiceTypeService : IServiceTypeService
    {
        #region Private Fields

        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        #endregion

        #region Constructors

        public ServiceTypeService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        #endregion

        #region GetAllServiceTypes
        public IEnumerable<ServiceTypeRes> GetAllServiceTypes()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<ServiceTypeRes>("CTR.ServiceType_ReadAll");
            if (result == null)
            {
                result = new List<ServiceTypeRes>();
            }
            return result;
        }
        #endregion

        #region GetServicesTypeByID
        public IEnumerable<ServiceTypeRes> GetServicesTypeByID(int Service_Type_ID)
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<ServiceTypeRes>("CTR.GetServicesTypeByID", new { Service_Type_ID });
            if (result == null)
            {
                result = new List<ServiceTypeRes>();
            }
            return result;
        }
        #endregion

        #region Create
        public bool Create(Service_TypeCreateReq objReq, out int newService_Type_ID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm các tham số với giá trị từ các thuộc tính của đối tượng obj truyền vào             
                param.Add("@Service_Type_ID", objReq.Service_Type_ID);
                param.Add("@Name", objReq.Name);



                // Thực hiện gọi stored procedure để thêm dữ liệu vào database
                newService_Type_ID = _objReadOnlyRepository.Value.Connection.ExecuteScalar<int>("CTR.ServiceType_Create", param, commandType: CommandType.StoredProcedure);

                // Kiểm tra Service_ID mới
                if (newService_Type_ID > 0)
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

        ~ServiceTypeService()
        {
            Dispose(false);
        }
        #endregion
    }
}
