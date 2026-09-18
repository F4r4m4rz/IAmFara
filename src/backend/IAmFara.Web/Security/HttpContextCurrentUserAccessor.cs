using System.Security.Claims;
using IAmFara.Data.Abstractions.Common;

namespace IAmFara.Web.Security;

public class HttpContextCurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccessor
{
    public Guid? UserId
    {
        get
        {
            var claim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }
}
