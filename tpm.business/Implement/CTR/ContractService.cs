using Core.DataAccess.Interface;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin.Response;
using tpm.dto.admin;

namespace tpm.business
{
    public class ContractService : IContractService
    {
        #region Private Fields

        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        #endregion

        #region Constructors

        public ContractService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        #endregion

        #region List, ReadAll
        public IEnumerable<ContractRes> List()
        {
            return ReadAll();
        }


        public IEnumerable<ContractRes> ReadAll()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<ContractRes>("CTR.Contract_ReadAll");
            if (result == null)
            {
                result = new List<ContractRes>();
            }
            return result;
        }
        #endregion

        #region GetContractsWithTypeName
        public IEnumerable<ContractRes> GetContractsWithTypeName()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<ContractRes>("CTR.GetContractsWithTypeName");
            if (result == null)
            {
                result = new List<ContractRes>();
            }
            return result;
        }
        #endregion

        #region GetContractsByID
        public IEnumerable<ContractRes> GetContractsByID(int Contract_ID)
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<ContractRes>("CTR.GetContractByID", new { Contract_ID });
            if (result == null)
            {
                result = new List<ContractRes>();
            }
            return result;
        }
        #endregion

        #region Create
        public bool Create(ContractCreateReq objReq, out int newContractID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm các tham số với giá trị từ các thuộc tính của đối tượng obj truyền vào             
                param.Add("@Contract_Type_ID", objReq.Contract_Type_ID);
                param.Add("@Contract_Number", objReq.Contract_Number);
                param.Add("@Customer_Company_Name", objReq.Customer_Company_Name);
                param.Add("@Address", objReq.Address);
                param.Add("@Phone", objReq.Phone);
                param.Add("@MobilePhone", objReq.MobilePhone);
                param.Add("@TIN", objReq.TIN);
                param.Add("@Email", objReq.Email);
               


                // Thực hiện gọi stored procedure để thêm dữ liệu vào database
                newContractID = _objReadOnlyRepository.Value.Connection.ExecuteScalar<int>("CTR.Contract_Create", param, commandType: CommandType.StoredProcedure);

                // Kiểm tra Service_ID mới
                if (newContractID > 0)
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
        public bool Update(ContractCreateReq objReq, int Contract_ID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm các tham số với giá trị từ các thuộc tính của đối tượng obj truyền vào
                param.Add("@Contract_ID", Contract_ID);
                param.Add("@Contract_Type_ID", objReq.Contract_Type_ID);
                param.Add("@Contract_Number", objReq.Contract_Number);
                param.Add("@Customer_Company_Name", objReq.Customer_Company_Name);
                param.Add("@Address", objReq.Address);
                param.Add("@Phone", objReq.Phone);
                param.Add("@MobilePhone", objReq.MobilePhone);
                param.Add("@TIN", objReq.TIN);
                param.Add("@Email", objReq.Email);
            

                // Thực hiện gọi stored procedure để cập nhật dữ liệu trong database
                _objReadOnlyRepository.Value.Connection.Execute("CTR.Contract_Update", param, commandType: CommandType.StoredProcedure);

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
        public bool Delete(int contractID)
        {
            try
            {
                // Tạo một đối tượng DynamicParameters để lưu trữ các tham số truyền vào stored procedure
                var param = new DynamicParameters();

                // Thêm tham số với giá trị từ serviceId truyền vào
                param.Add("@Contract_ID", contractID);

                // Thực hiện gọi stored procedure để xóa dữ liệu trong database
                var storedProcedureResult = _objReadOnlyRepository.Value.Connection.Execute("CTR.Contract_Delete", param, commandType: CommandType.StoredProcedure);

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


        ~ContractService()
        {
            Dispose(false);
        }
        #endregion
    }
}
