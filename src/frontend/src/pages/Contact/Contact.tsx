import { Github, Linkedin, Mail } from "lucide-react";
import { dirFor, T, useLocale } from "../../i18n";
import { ContactForm } from "./ContactForm";

const altLinks = [
  { label: "github", href: "https://github.com/f4r4m4rz", icon: Github },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/faramarz-bodaghi-4a858250",
    icon: Linkedin,
  },
  { label: "email", href: "mailto:me@iamfara.com", icon: Mail },
];

function Contact() {
  const { locale } = useLocale();

  return (
    <section className="rounded-lg border border-term-border bg-term-panel shadow-2xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-term-border bg-term-bg/60">
        <span className="w-3 h-3 rounded-full bg-term-pink" />
        <span className="w-3 h-3 rounded-full bg-term-orange" />
        <span className="w-3 h-3 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted">
          faramarz@iamfara: ~/contact
        </span>
      </div>

      <div className="p-6 sm:p-10">
        <div className="flex items-center gap-2 text-term-muted text-sm sm:text-base">
          <span className="text-term-green">$</span>
          <span>./contact.sh</span>
        </div>

        <h1
          dir={dirFor(locale)}
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-term-text"
        >
          <T k="contact.heading" />
        </h1>
        <p
          dir={dirFor(locale)}
          className="mt-3 max-w-xl text-term-muted leading-relaxed"
        >
          <T k="contact.intro" />
        </p>

        <div className="mt-8 max-w-xl">
          <ContactForm />
        </div>

        <div className="mt-10 pt-6 border-t border-term-border">
          <p dir={dirFor(locale)} className="text-sm text-term-muted mb-3">
            <T k="contact.alt" />
          </p>
          <div className="flex items-center gap-4">
            {altLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-term-muted hover:text-term-green transition-colors"
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
