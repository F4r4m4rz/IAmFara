using System.Net;
using System.Net.Mail;
using IAmFara.Web.Options;
using Microsoft.Extensions.Options;

namespace IAmFara.Web.Services;

public class ContactEmailSender(IOptions<SmtpOptions> smtpOptions, IOptions<ContactOptions> contactOptions)
{
    private readonly SmtpOptions _smtp = smtpOptions.Value;
    private readonly ContactOptions _contact = contactOptions.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_smtp.Host) && !string.IsNullOrWhiteSpace(_contact.ToEmail);

    public async Task SendAsync(string name, string email, string message, CancellationToken ct)
    {
        var fromAddress = string.IsNullOrWhiteSpace(_smtp.From) ? _smtp.User : _smtp.From;

        using var mail = new MailMessage
        {
            From = new MailAddress(fromAddress, "iamfara.com contact form"),
            Subject = $"New message from {name} via iamfara.com",
            Body = $"From: {name} <{email}>\n\n{message}",
            IsBodyHtml = false,
        };
        mail.To.Add(_contact.ToEmail);
        mail.ReplyToList.Add(new MailAddress(email, name));

        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.UseStartTls,
            Credentials = new NetworkCredential(_smtp.User, _smtp.Password),
        };

        await client.SendMailAsync(mail, ct);
    }
}
