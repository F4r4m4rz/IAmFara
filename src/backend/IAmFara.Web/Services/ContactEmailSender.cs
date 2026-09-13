using System.Net.Http.Headers;
using System.Net.Http.Json;
using IAmFara.Web.Options;
using Microsoft.Extensions.Options;

namespace IAmFara.Web.Services;

/// <summary>
/// Sends contact-form notifications via the Resend HTTP API (https://resend.com)
/// over plain HTTPS — no SMTP client, no SMTP AUTH, so it sidesteps the SMTP
/// AUTH restrictions/deprecation on the Microsoft 365 mailbox this delivers to.
/// </summary>
public class ContactEmailSender(
    HttpClient http,
    IOptions<ResendOptions> resendOptions,
    IOptions<ContactOptions> contactOptions)
{
    private readonly ResendOptions _resend = resendOptions.Value;
    private readonly ContactOptions _contact = contactOptions.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_resend.ApiKey)
        && !string.IsNullOrWhiteSpace(_resend.FromEmail)
        && !string.IsNullOrWhiteSpace(_contact.ToEmail);

    /// <summary>
    /// Which individual settings are present — booleans only, never the
    /// actual values — so a deploy can be sanity-checked remotely without
    /// exposing secrets.
    /// </summary>
    public object ConfigStatus => new
    {
        apiKeyConfigured = !string.IsNullOrWhiteSpace(_resend.ApiKey),
        fromEmailConfigured = !string.IsNullOrWhiteSpace(_resend.FromEmail),
        toEmailConfigured = !string.IsNullOrWhiteSpace(_contact.ToEmail),
    };

    public async Task SendAsync(string name, string email, string message, CancellationToken ct)
    {
        var payload = new
        {
            from = $"iamfara.com <{_resend.FromEmail}>",
            to = new[] { _contact.ToEmail },
            reply_to = email,
            subject = $"New message from {name} via iamfara.com",
            text = $"From: {name} <{email}>\n\n{message}",
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _resend.ApiKey);

        using var response = await http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
    }
}
