using Data.Model;
using Data.Repositories;
using Infrastructure.Authentication.Exceptions;
using Infrastructure.Authentication.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication
{
    public interface IUserManager
    {
        void SignUp(SignUpModel model);
        void SilentLogin(SignInModel model);
        void LogIn(SignInModel model);
        void LogOut();
    }

    internal class UserManager : IUserManager
    {
        private readonly ILogger<UserManager> _logger;
        private readonly IAppUserRepository _userRepository;
        private readonly IAppCoockieHandler _coockieHandler;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPasswordHandler _passwordHandler;
        private readonly ICurrentUserProvider _currentUserProvider;

        public UserManager(
            ILogger<UserManager> logger, 
            IAppUserRepository userRepository, 
            IAppCoockieHandler coockieHandler, 
            IHttpContextAccessor httpContextAccessor, 
            IPasswordHandler passwordHandler,
            ICurrentUserProvider currentUserProvider)
        {
            _logger = logger;
            _userRepository = userRepository;
            _coockieHandler = coockieHandler;
            _httpContextAccessor = httpContextAccessor;
            _passwordHandler = passwordHandler;
            _currentUserProvider = currentUserProvider;
        }

        public void SignUp(SignUpModel model)
        {
            var hashedPassword = _passwordHandler.HashPassword(model.Password);

            var appUser = Mapper.ToAppUser(model, hashedPassword); 

            _userRepository.AddUser(appUser);

            _currentUserProvider.SetCurrentUser(Mapper.ToSecurityUser(appUser), model.Password);
        }

        public void SilentLogin(SignInModel model)
        {
            try
            {
                LogIn(model);
            }
            catch (WrongCredentialsException)
            {

            }
        }

        public void LogIn(SignInModel model)
        {
            var user = _userRepository.GetUser(model.Email);
            if (user is null || !_passwordHandler.PasswordIsValid(user, model.Password))
                throw new WrongCredentialsException();

            _currentUserProvider.SetCurrentUser(Mapper.ToSecurityUser(user), model.Password);
        }

        public void LogOut()
        {
            _currentUserProvider.RemoveCurrentUser();
        }
    }
}
