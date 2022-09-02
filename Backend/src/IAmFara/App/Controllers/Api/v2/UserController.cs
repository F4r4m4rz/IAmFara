using App.Controllers.Api.Contracts;
using Data.Repositories;
using Infrastructure.Authentication;
using Infrastructure.Authentication.Models;
using Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers.Api.v2
{
    [Route("api/v2/{controller}")]
    [ApiController]
    public class UserController : BaseController
    {
        private readonly ILogger<UserController> _logger;
        private readonly IUserManager _userManager;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        public UserController(ILogger<UserController> logger, IUserManager userManager, ICurrentUserAccessor currentUserAccessor)
        {
            _logger = logger;
            _userManager = userManager;
            _currentUserAccessor = currentUserAccessor;
        }

        [HttpGet("")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SecurityUser>))]
        public IActionResult Authenticate()
        {
            if (_currentUserAccessor.User is null)
                return Ok(ApiResponseHelper.GenerateResponse<SecurityUser>(null));
            else
                return Ok(ApiResponseHelper.GenerateResponse<SecurityUser>(_currentUserAccessor.User));
        }

        [HttpPost("signup", Name = "Signup")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SecurityUser>))]
        public IActionResult SignUp([FromBody] SignUpDto model)
        {
            _logger.LogInformation($"Signing up a new user: Email: {model.Email}, Name: {model.FirstName} {model.LastName}");

            _userManager.SignUp(Mapper.Map(model));

            return Ok(ApiResponseHelper.GenerateResponse<SecurityUser>(_currentUserAccessor.User));
        }

        [HttpPost("signin", Name = "Login")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SecurityUser>))]
        public IActionResult Login([FromBody] SignInDto model)
        {
            _logger.LogInformation($"Loging in, email is: {model.Email}");

            _userManager.LogIn(Mapper.Map(model));

            return Ok(ApiResponseHelper.GenerateResponse<SecurityUser>(_currentUserAccessor.User));
        }

        [HttpGet("logout", Name = "Logout")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SecurityUser>))]
        public IActionResult LogOut()
        {
            _logger.LogInformation($"Loging out");

            _userManager.LogOut();

            return Ok(ApiResponseHelper.GenerateResponse<SecurityUser>(null));
        }
    }
}
