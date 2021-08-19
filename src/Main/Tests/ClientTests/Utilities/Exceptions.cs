using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.ClientTests.Utilities.Exceptions
{
    public class AssemblyLoadException : Exception
    {
        public AssemblyLoadException(string message, Exception innerException) : base(message, innerException)
        {

        }

        public AssemblyLoadException(string message, IEnumerable<AssemblyLoadException> loadExceptions) : base(message)
        {
            LoadExceptions = loadExceptions;
        }

        public IEnumerable<AssemblyLoadException> LoadExceptions { get; }
    }
}
