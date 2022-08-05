using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication.Exceptions
{
    public class WrongCredentialsException : Exception
    {
        public WrongCredentialsException() : base("Provided email and/or password is not correct")
        {

        }
    }
}
