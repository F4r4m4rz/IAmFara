using Microsoft.AspNetCore;

namespace Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebHost.CreateDefaultBuilder<Startup>(args).Build().Run();
        }
    }
}