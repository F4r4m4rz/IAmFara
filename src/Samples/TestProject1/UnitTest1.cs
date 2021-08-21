using IAmFara.ClientTests;
using NUnit.Framework;
using System.Threading.Tasks;

namespace TestProject1
{
    public class MyTests : Tests
    {
        [OneTimeSetUp]
        public async Task OnTimeSetup()
        {
            await SetupTests.OnTimeSetup(1, 2);
        }
    }
}