﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication.Models
{
#nullable disable
    public class SignInModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
