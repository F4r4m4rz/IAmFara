using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Exceptions
{
     public class IAmFaraException : Exception
    {
        public IAmFaraException(string message, Exception? inner) : base(message, inner)
        {

        }
    }

    public class HandledException : Exception
    {
        public HandledException(string message, Exception? inner) : base(message, inner)
        {

        }
    }
}
