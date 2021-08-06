using Microsoft.Extensions.Logging;
using System;

namespace MyRazorLibraryBacking
{
    public class MyRazorRepository
    {
        private readonly ILogger<MyRazorRepository> _logger;

        public MyRazorRepository(ILogger<MyRazorRepository> logger)
        {
            _logger = logger;
        }

        public string Get()
        {
            _logger.LogInformation("We are in get method");
            return "Hello world";
        }
    }
}
