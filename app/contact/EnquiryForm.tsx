'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { Button } from '@/components/primitives/Button';
import { CITIES } from '@/lib/content/inventory';

/**
 * Enquiry form. The three "Send a brief" actions on the home page arrive here
 * with ?enquiry=<slug>, which preselects the subject.
 *
 * Fully validated with Zod through React Hook Form. There is no CRM endpoint in
 * scope, so submit resolves locally and the confirmation says exactly that
 * rather than implying a message was delivered.
 */

const ENQUIRY_KINDS = [
  { value: 'stay', label: 'A stay' },
  { value: 'corporate-events', label: 'A corporate event' },
  { value: 'weddings-social', label: 'A wedding or social event' },
  { value: 'conference-rooms', label: 'A conference room' },
  { value: 'other', label: 'Something else' },
] as const;

const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().min(1, 'Enter your email address').email('Check the email address'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{7,15})?$/, 'Enter a phone number or leave it blank')
    .optional()
    .or(z.literal('')),
  kind: z.enum(ENQUIRY_KINDS.map((k) => k.value) as [string, ...string[]]),
  city: z.string().min(1, 'Choose a city'),
  message: z
    .string()
    .trim()
    .min(20, 'A sentence or two helps us route this properly')
    .max(2000, 'Please keep this under 2000 characters'),
});

type EnquiryValues = z.infer<typeof enquirySchema>;

const fieldClass =
  'mt-[--spacing(2)] w-full rounded-sm border-[length:var(--border-hair)] border-solid ' +
  'border-forest/28 bg-paper px-[clamp(12px,1.2vw,18px)] py-[clamp(10px,1vw,15px)] ' +
  'text-input text-ink outline-none placeholder:text-muted';

const labelClass = 'block text-field-label font-bold text-forest';

export function EnquiryForm() {
  const params = useSearchParams();
  const [sent, setSent] = useState(false);
  const ids = {
    name: useId(),
    email: useId(),
    phone: useId(),
    kind: useId(),
    city: useId(),
    message: useId(),
  };

  const presetKind = params.get('enquiry');
  const defaultKind = ENQUIRY_KINDS.some((k) => k.value === presetKind)
    ? (presetKind as string)
    : 'stay';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      kind: defaultKind,
      city: CITIES[0]?.slug ?? '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async () => {
    setSent(true);
    reset();
  });

  const Error = ({ id, message }: { id: string; message?: string }) =>
    message ? (
      <p id={id} role="alert" className="text-body-sm text-accent-deep mt-[--spacing(1)] font-bold">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="gap-gap-grid flex flex-col">
      <div className="gap-gap-grid grid sm:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className={labelClass}>
            Your name
          </label>
          <input
            id={ids.name}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${ids.name}-error` : undefined}
            className={fieldClass}
            {...register('name')}
          />
          <Error id={`${ids.name}-error`} message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor={ids.email} className={labelClass}>
            Email
          </label>
          <input
            id={ids.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${ids.email}-error` : undefined}
            className={fieldClass}
            {...register('email')}
          />
          <Error id={`${ids.email}-error`} message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor={ids.phone} className={labelClass}>
            Phone <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id={ids.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
            className={fieldClass}
            {...register('phone')}
          />
          <Error id={`${ids.phone}-error`} message={errors.phone?.message} />
        </div>

        <div>
          <label htmlFor={ids.city} className={labelClass}>
            City
          </label>
          <select id={ids.city} className={fieldClass} {...register('city')}>
            {CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
                {city.isOpen ? '' : ' (opening soon)'}
              </option>
            ))}
          </select>
          <Error id={`${ids.city}-error`} message={errors.city?.message} />
        </div>
      </div>

      <div>
        <label htmlFor={ids.kind} className={labelClass}>
          What is this about?
        </label>
        <select id={ids.kind} className={fieldClass} {...register('kind')}>
          {ENQUIRY_KINDS.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={ids.message} className={labelClass}>
          Your brief
        </label>
        <textarea
          id={ids.message}
          rows={5}
          placeholder="Dates, rough numbers, anything that matters."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${ids.message}-error` : undefined}
          className={cn(fieldClass, 'resize-y')}
          {...register('message')}
        />
        <Error id={`${ids.message}-error`} message={errors.message?.message} />
      </div>

      <div className="gap-gap-grid flex flex-wrap items-center">
        <Button type="submit" slot="prominent" disabled={isSubmitting}>
          Send the brief
        </Button>
        <p aria-live="polite" className="text-body-sm text-muted">
          {sent
            ? 'Checked and complete. Delivery to the reservations team is not connected yet, so nothing has been sent.'
            : ''}
        </p>
      </div>
    </form>
  );
}
