import { ArrowRight, Check, Loader2 } from "lucide-react";
import { FormEvent, useId, useRef, useState } from "react";
import { dirFor, useLocale } from "../../i18n";

type Status = "idle" | "loading" | "success" | "error";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactForm() {
  const { t, locale } = useLocale();
  const dir = dirFor(locale);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real visitors never see this field
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const messageErrorId = useId();

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim().length < 1) next.name = t("contact.form.validation.name");
    if (!EMAIL_PATTERN.test(email.trim()))
      next.email = t("contact.form.validation.email");
    if (message.trim().length < 10)
      next.message = t("contact.form.validation.message");
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (validationErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (validationErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (validationErrors.message) {
      messageRef.current?.focus();
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });

      if (res.ok) {
        setStatus("success");
        setStatusMessage(t("contact.form.success"));
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      setStatus("error");
      setStatusMessage(
        res.status === 429
          ? t("contact.form.error.rateLimit")
          : t("contact.form.error")
      );
    } catch {
      setStatus("error");
      setStatusMessage(t("contact.form.error"));
    }
  }

  if (status === "success") {
    return (
      <div
        dir={dir}
        role="status"
        className="flex items-center gap-2 text-term-green"
      >
        <span className="text-term-muted" aria-hidden="true">
          $
        </span>
        <Check className="h-4 w-4 shrink-0" />
        <span>{statusMessage}</span>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Honeypot: hidden from sighted users, keyboard nav, and assistive tech. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor={nameId}
          className="flex items-center gap-1 text-sm text-term-muted mb-1.5"
        >
          <span className="text-term-green">name</span>
          <span>=</span>
        </label>
        <input
          ref={nameRef}
          id={nameId}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? nameErrorId : undefined}
          placeholder={t("contact.form.name.placeholder")}
          className="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm sm:text-base text-term-text placeholder:text-term-muted/60 focus:outline-none focus:ring-2 focus:ring-term-green transition-shadow"
        />
        {errors.name && (
          <p id={nameErrorId} dir={dir} className="mt-1 text-xs text-term-pink">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={emailId}
          className="flex items-center gap-1 text-sm text-term-muted mb-1.5"
        >
          <span className="text-term-green">email</span>
          <span>=</span>
        </label>
        <input
          ref={emailRef}
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email)
              setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? emailErrorId : undefined}
          placeholder={t("contact.form.email.placeholder")}
          dir="ltr"
          className="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm sm:text-base text-term-text placeholder:text-term-muted/60 focus:outline-none focus:ring-2 focus:ring-term-green transition-shadow"
        />
        {errors.email && (
          <p id={emailErrorId} dir={dir} className="mt-1 text-xs text-term-pink">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={messageId}
          className="flex items-center gap-1 text-sm text-term-muted mb-1.5"
        >
          <span className="text-term-green">message</span>
          <span>=</span>
        </label>
        <textarea
          ref={messageRef}
          id={messageId}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message)
              setErrors((prev) => ({ ...prev, message: undefined }));
          }}
          rows={5}
          dir={dir}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? messageErrorId : undefined}
          placeholder={t("contact.form.message.placeholder")}
          className="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm sm:text-base text-term-text placeholder:text-term-muted/60 focus:outline-none focus:ring-2 focus:ring-term-green transition-shadow resize-y"
        />
        {errors.message && (
          <p
            id={messageErrorId}
            dir={dir}
            className="mt-1 text-xs text-term-pink"
          >
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          dir={dir}
          className="group inline-flex items-center gap-2 bg-term-green text-term-bg font-semibold px-5 py-2.5 rounded hover:bg-term-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("contact.form.sending")}
            </>
          ) : (
            <>
              {t("contact.form.submit")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      {status === "error" && (
        <p role="alert" dir={dir} className="text-sm text-term-pink">
          {statusMessage}
        </p>
      )}
    </form>
  );
}
