using System.Net;

namespace IAmFara.Web.Services;

/// <summary>
/// Truncates an IP to a coarser network prefix (IPv4 /24, IPv6 /64) before it ever
/// feeds into the visitor HMAC — an extra layer of imprecision on top of the HMAC
/// itself and its daily rotation, and it merges visitors sharing a subnet somewhat.
/// </summary>
public static class IpNormalizer
{
    public static string Normalize(IPAddress ip)
    {
        var bytes = ip.GetAddressBytes();

        if (bytes.Length == 4)
        {
            bytes[3] = 0;
        }
        else if (bytes.Length == 16)
        {
            for (var i = 8; i < 16; i++) bytes[i] = 0;
        }

        return new IPAddress(bytes).ToString();
    }
}
