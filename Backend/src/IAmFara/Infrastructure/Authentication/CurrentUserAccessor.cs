using Infrastructure.Authentication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication
{
    internal interface ICurrentUserProvider
    {
        SecurityUser? CurrentUser { get; }
        string LogInPassword { get; }
        void SetCurrentUser(SecurityUser user, string loginPassword);
        void RemoveCurrentUser();
    }

    public interface ICurrentUserAccessor
    {
        SecurityUser? User { get; }
    }

    internal class CurrentUserProvider : ICurrentUserProvider
    {
        public CurrentUserProvider()
        {

        }

        public SecurityUser? CurrentUser { get; private set; } = null;
        public string? LogInPassword { get; private set; } = null;

        public void SetCurrentUser(SecurityUser user, string loginPassword)
        {
            CurrentUser = user;
            LogInPassword = loginPassword;
        }
        public void RemoveCurrentUser() 
        {
            CurrentUser = null;
            LogInPassword = null;
        }
    }

    internal class CurrentUserAccessor : ICurrentUserAccessor
    {
        private readonly ICurrentUserProvider _provider;

        public CurrentUserAccessor(ICurrentUserProvider provider)
        {
            _provider = provider;
        }

        public SecurityUser? User => _provider.CurrentUser;
    }
}
