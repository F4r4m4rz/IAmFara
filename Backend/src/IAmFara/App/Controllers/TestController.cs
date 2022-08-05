using Infrastructure.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("/test")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;
        private readonly IUserManager _userManager;

        public TestController(ILogger<TestController> logger, IUserManager userManager)
        {
            _logger = logger;
            _userManager = userManager;
        }

        public ActionResult Index()
        {
            _logger.LogInformation("Test");

            return Ok("This is api result");
        }
    }
}
