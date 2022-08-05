using App.Controllers.Api.Contracts;
using Data.Repositories;
using Infrastructure.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers.Api
{
    [Route("api/{controller}")]
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
        public IActionResult Authenticate()
        {
            if (_currentUserAccessor.User is null)
                return Ok(new { type = "UN-AUTHENTICATED" });
            else
                return Ok(new { Type = "AUTHENTICATED", Payload = new { Data = _currentUserAccessor.User } });
        }

        [HttpPost("signup", Name = "Signup")]
        public IActionResult SignUp([FromBody] SignUpDto model)
        {
            _logger.LogInformation($"Signing up a new user: Email: {model.Email}, Name: {model.FirstName} {model.LastName}");

            _userManager.SignUp(Mapper.Map(model));

            return Authenticate();
        }

        [HttpPost("signin", Name = "Login")]
        public IActionResult Login([FromBody] SignInDto model)
        {
            _logger.LogInformation($"Loging in, email is: {model.Email}");

            _userManager.LogIn(Mapper.Map(model));

            return Authenticate();
        }

        [HttpGet("logout", Name = "Logout")]
        public IActionResult LogOut()
        {
            _logger.LogInformation($"Loging out");

            _userManager.LogOut();

            return Authenticate();
        }
    }
}
