using Core.DataAccess.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;

namespace tpm.business
{
    public class DepartmentService : IDepartmentService
    {
        #region Private Fields

        private readonly Lazy<IRepository> _objRepository;
        private readonly Lazy<IReadOnlyRepository> _objReadOnlyRepository;
        private bool _disposedValue;

        #endregion

        #region Constructors

        public DepartmentService(Lazy<IRepository> objRepository, Lazy<IReadOnlyRepository> objReadOnlyRepository)
        {
            _objRepository = objRepository;
            _objReadOnlyRepository = objReadOnlyRepository;
        }

        #endregion

        #region GetAllDepartments
        public IEnumerable<DepartmentRes> GetAllDepartments()
        {
            var result = _objReadOnlyRepository.Value.StoreProcedureQuery<DepartmentRes>("MAT.Department_ReadAll");
            if (result == null)
            {
                result = new List<DepartmentRes>();
            }
            return result;
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

        ~DepartmentService()
        {
            Dispose(false);
        }
        #endregion
    }
}
