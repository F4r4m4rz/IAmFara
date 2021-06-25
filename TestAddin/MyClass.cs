using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TestAddin
{
    public class MyClass
    {
        public MyClass(ILogger<MyClass> logger, IOptionsSnapshot<MyClassConfig> options)
        {
            logger.LogInformation("We are in constructor, description is {desc}", options.Value.Description);
        }
    }
}
