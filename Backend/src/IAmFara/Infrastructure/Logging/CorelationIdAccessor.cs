using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    public interface ICorelationIdAccessor
    {
        Guid CorelationId { get; set; }
    }

    internal class CorelationIdAccessor : ICorelationIdAccessor
    {
        public CorelationIdAccessor()
        {
            CorelationId = Guid.NewGuid();
        }

        public Guid CorelationId { get; set; }
    }
}
