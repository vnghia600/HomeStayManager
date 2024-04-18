using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tpm.dto.admin;

namespace tpm.business
{
    public interface IPositionService : IDisposable
    {
        IEnumerable<PositionRes> GetAllPositions();
    }
}
