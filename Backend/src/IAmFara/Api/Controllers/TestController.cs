using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [ApiController]
    [Route("/test")]
    public class TestController : ControllerBase
    {
        public ActionResult Index()
        {
            return Ok("This is api result");
        }
    }
}
