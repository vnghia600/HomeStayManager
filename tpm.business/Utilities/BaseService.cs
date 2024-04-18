using  Core.DTO.Response;
using Core.DataAccess.Interface;
using System;

namespace tpm.business
{
    public class BaseService
    {
        private readonly Lazy<IRepository> _repository;
        protected IRepository Repository => _repository.Value;

        private readonly Lazy<IReadOnlyRepository> _readOnlyRepository;
        protected IReadOnlyRepository ReadRepository => _readOnlyRepository.Value;

        public BaseService(Lazy<IRepository> repository, Lazy<IReadOnlyRepository> readOnlyRepository)
        {
            _repository = repository;
            _readOnlyRepository = readOnlyRepository;
        }

        #region Function
        protected CRUDResult<T> Success<T>(T data)
        {
            var result = new CRUDResult<T>()
            {
                Data = data,
                StatusCode = CRUDStatusCodeRes.Success,
                ErrorMessage = string.Empty
            };

            return result;
        }

        protected CRUDResult<T> Error<T>(T data = default(T), CRUDStatusCodeRes statusCode = CRUDStatusCodeRes.InvalidData, string message = "")
        {
            var result = new CRUDResult<T>()
            {
                Data = data,
                StatusCode = statusCode,
                ErrorMessage = message
            };

            return result;
        }
        #endregion

        #region Dispose
        private bool _disposedValue;

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    if (_repository.IsValueCreated)
                    {
                        _repository.Value.Dispose();
                    }

                    if (_readOnlyRepository.IsValueCreated)
                    {
                        _readOnlyRepository.Value.Dispose();
                    }
                }
                _disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        ~BaseService()
        {
            Dispose(false);
        }
        #endregion
    }
}
