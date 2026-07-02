import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { motion } from "motion/react";
import { siteContent } from "../data/siteContent";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Enter your email address first.");
      setSubmitted(false);
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      setSubmitted(false);
      return;
    }

    setError("");
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="mt-8 lg:mt-6">
      <form onSubmit={submit} noValidate className="rounded-[12px] border border-white/14 bg-white/10 p-1.5 shadow-[0_18px_48px_rgba(8,5,18,0.24)] backdrop-blur">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <label className="group relative flex-1">
            <span className="sr-only">{siteContent.emailPlaceholder}</span>
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/72 transition duration-300 group-hover:text-white group-focus-within:text-[#ff7aef]" aria-hidden="true" />
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              type="email"
              autoComplete="email"
              placeholder={siteContent.emailPlaceholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "signup-error" : submitted ? "signup-success" : undefined}
              className="signup-email-input h-12 w-full rounded-[9px] border border-white/22 bg-white/12 pl-11 pr-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(255,47,163,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] outline-none transition duration-300 placeholder:text-white/66 hover:-translate-y-px hover:border-[#ff7aef]/58 hover:bg-white/16 hover:shadow-[0_16px_42px_rgba(255,47,163,0.14),inset_0_1px_0_rgba(255,255,255,0.13)]"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[9px] bg-[#FF2FA3] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(255,47,163,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ea168e] focus-visible:outline-[#FF2FA3] sm:min-w-44"
          >
            <span>{siteContent.ctaText}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {error ? (
        <p id="signup-error" className="mt-3 text-sm font-bold text-[#be185d]" role="alert">
          {error}
        </p>
      ) : null}

      {submitted ? (
        <motion.p
          id="signup-success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f0fdf4] px-3 py-2 text-sm font-bold text-[#166534]"
          role="status"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          You're on the list. Welcome in.
        </motion.p>
      ) : null}
    </div>
  );
}
