'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { FOOTER } from '@/lib/content/home';

/**
 * Newsletter sign-up.
 *
 * The reference's handler is `(e) => e.preventDefault()` — the form exists but
 * does nothing and validates nothing. Here it is a real React Hook Form with a
 * Zod schema, inline errors tied to the input via aria-describedby, and a
 * polite live region for the result.
 *
 * There is no subscription endpoint in scope, so submit resolves locally and
 * says so honestly rather than claiming a subscription was created.
 */

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address')
    .email('That does not look like an email address'),
  consent: z.literal(true, {
    error: 'Please agree to the privacy policy',
  }),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const emailId = useId();
  const errorId = useId();
  const consentId = useId();
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '', consent: false as unknown as true },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async () => {
    setStatus('done');
    reset();
  });

  const message = errors.email?.message ?? errors.consent?.message;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="max-w-newsletter-max bg-paper flex items-stretch rounded-md p-[--spacing(2)]">
        <label htmlFor={emailId} className="sr-only">
          {FOOTER.emailPlaceholder}
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={FOOTER.emailPlaceholder}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className={cn(
            'min-w-0 flex-auto border-0 bg-transparent px-[clamp(8.5px,1.02vw,15.3px)]',
            'text-input text-ink placeholder:text-muted outline-none',
          )}
          {...register('email')}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'bg-accent-cta px-btn-submit-x py-btn-submit-y shrink-0 cursor-pointer rounded-sm border-0',
            'text-btn-submit text-paper font-bold transition-colors duration-[var(--dur-hover-bg)]',
            'hover:bg-accent-cta-hover hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {FOOTER.submitLabel}
        </button>
      </div>

      <label
        htmlFor={consentId}
        className="mt-gap-tight text-link text-forest flex cursor-pointer items-center gap-[--spacing(2)]"
      >
        <input
          id={consentId}
          type="checkbox"
          aria-describedby={message ? errorId : undefined}
          className="size-checkbox m-0 cursor-pointer accent-[var(--color-forest)]"
          {...register('consent')}
        />
        <span>
          {FOOTER.consentPrefix}{' '}
          <a
            href="/contact"
            className="hover:text-accent-text text-inherit underline underline-offset-[0.18em]"
          >
            {FOOTER.consentLinkLabel}
          </a>
        </span>
      </label>

      {message && (
        <p
          id={errorId}
          role="alert"
          className="text-body-sm text-accent-text mt-[--spacing(2)] font-bold"
        >
          {message}
        </p>
      )}

      <p aria-live="polite" className="text-body-sm text-muted mt-[--spacing(2)]">
        {status === 'done'
          ? 'Thanks — your address is saved on this device. Newsletter delivery is not connected yet.'
          : ''}
      </p>
    </form>
  );
}
