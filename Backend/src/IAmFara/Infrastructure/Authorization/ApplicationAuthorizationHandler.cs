using Infrastructure.Authentication;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authorization
{
    internal class ApplicationAuthorizationHandler : AuthorizationHandler<IApplicationAuthorizationRequirement>
    {
        private readonly ICurrentUserAccessor _userAccessor;

        public ApplicationAuthorizationHandler(ICurrentUserAccessor userAccessor)
        {
            _userAccessor = userAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IApplicationAuthorizationRequirement requirement)
        {
            if (_userAccessor.User is null)
                return Task.CompletedTask;

            if (requirement.Evaluate(_userAccessor.User))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
