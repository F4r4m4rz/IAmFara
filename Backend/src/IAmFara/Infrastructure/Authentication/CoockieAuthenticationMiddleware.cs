using Infrastructure.Authentication.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication
{
    internal class CoockieAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public CoockieAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, IAppCoockieHandler coockieHandler, IUserManager userManager)
        {
            if (context.Request.Cookies.TryGetValue("iamfaraCoockie", out var appCoockie))
            {
                try
                {
                    var coockie = coockieHandler.Decrypt(appCoockie);
                    if (coockie != null)
                    {
                        var loginModel = new SignInModel { Email = coockie.UserName, Password = coockie.Password };
                        userManager.SilentLogin(loginModel);
                    }
                }
                catch
                {
                    context.Response.Cookies.Delete("iamfaraCoockie");
                }
                
            }

            await _next(context);
        }
    }

    internal class AttachCoockieMiddleware
    {
        private readonly RequestDelegate _next;

        public AttachCoockieMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, IAppCoockieHandler coockieHandler, ICurrentUserProvider userProvider)
        {
            await _next(context);

            if (userProvider.CurrentUser is null)
            {
                context.Response.Cookies.Delete("iamfaraCoockie");
            }
            else
            {
                if (!context.Request.Cookies.TryGetValue("iamfaraCoockie", out var appCoockie))
                {
                    var coockie = new AppCoockie { UserName = userProvider.CurrentUser.Email, Password = userProvider.LogInPassword };
                    var encrypted = coockieHandler.Encrypt(coockie);
                    var options = new CookieOptions() { Expires = DateTime.Now.AddDays(1), Secure = true };
                    context.Response.Cookies.Append("iamfaraCoockie", encrypted, options); 
                }
            }
            
        }
    }
}
