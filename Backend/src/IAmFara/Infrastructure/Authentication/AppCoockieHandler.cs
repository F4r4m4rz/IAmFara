using Data.Model;
using Data.Repositories;
using Infrastructure.Authentication.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Authentication
{
    internal interface IAppCoockieHandler
    {
        AppCoockie? Decrypt(string encrypted);
        string Encrypt(AppCoockie coockie);
    }

    internal class AppCoockieHandler : IAppCoockieHandler
    {
        private readonly ILogger<AppCoockieHandler> _logger;
        private readonly IDataProtectionProvider _provider;
        private readonly IPasswordHandler _passwordHandler;

        public AppCoockieHandler(ILogger<AppCoockieHandler> logger, IDataProtectionProvider provider, IPasswordHandler passwordHandler)
        {
            _logger = logger;
            _provider = provider;
            _passwordHandler = passwordHandler;
        }

        public string Encrypt(AppCoockie coockie)
        {
            var protector = _provider.CreateProtector("Coockie encryption");
            var json = JsonSerializer.Serialize(coockie);

            return protector.Protect(json);
        }

        public AppCoockie? Decrypt(string encrypted)
        {
            var protector = _provider.CreateProtector("Coockie encryption");
            var json = protector.Unprotect(encrypted);

            return JsonSerializer.Deserialize<AppCoockie>(json);
        }
    }
}
