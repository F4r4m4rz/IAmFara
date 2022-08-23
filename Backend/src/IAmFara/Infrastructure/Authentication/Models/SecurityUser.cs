﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication.Models
{
#nullable disable
    public class SecurityUser
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public UserRole[] UserRoles { get; set; } = new UserRole[0];
    }

    public class UserRole
    {
        public string role { get; set; }
    }
}