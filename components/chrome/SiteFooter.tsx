import Link from 'next/link';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { FOOTER } from '@/lib/content/home';
import { FOOTER_COLUMNS, SITE, SOCIAL_LINKS } from '@/lib/content/site';
import { NewsletterForm } from './NewsletterForm';
import { SocialIcon } from './SocialIcons';
import { Wordmark } from './Wordmark';

/**
 * Footer: wordmark and newsletter on the left, four link columns on the right,
 * legal row beneath a hairline.
 *
 * The reference splits 1.1fr / 2fr and holds four columns at every width. Here
 * the split stacks below 900px and the columns step 4 -> 2 -> 1, because four
 * columns of five links do not fit at 320px.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden px-[clamp(20px,3.2vw,54px)] pt-[clamp(30px,4vw,60px)] pb-[clamp(18px,2vw,30px)]">
      <div className="max-w-shell mx-auto grid gap-[clamp(28px,4vw,70px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        <div>
          <div className="text-forest">
            <Wordmark size="footer" />
          </div>

          <Eyebrow className="mt-gap-grid" tone="sage">
            {FOOTER.newsletterHeading}
          </Eyebrow>
          <div className="mt-gap-tight">
            <NewsletterForm />
          </div>

          <Eyebrow className="mt-[clamp(26px,3vw,48px)]" tone="sage">
            {FOOTER.contactHeading}
          </Eyebrow>
          <ul className="mt-gap-tight text-forest flex list-none gap-[--spacing(4)] p-0">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="hover:text-accent inline-flex text-inherit transition-colors duration-[var(--dur-hover-swap)]"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-[clamp(14px,2vw,32px)] md:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <Eyebrow as="h2" tone="forest" track="tight">
                {column.heading}
              </Eyebrow>
              <ul className="gap-gap-tight text-link mt-[clamp(18px,2.4vw,38px)] flex list-none flex-col p-0">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="hover:text-accent transition-colors duration-[var(--dur-hover-swap)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="hover:text-accent transition-colors duration-[var(--dur-hover-swap)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-shell gap-gap-grid border-forest/22 pt-gap-tight text-legal text-forest mx-auto mt-[clamp(34px,5vw,80px)] flex flex-wrap items-center justify-between border-t-[length:var(--border-hair)] border-solid">
        <span>
          &copy;{SITE.copyrightYear} {SITE.legalName} All rights reserved.
        </span>
        <span className="opacity-85">{SITE.note}</span>
      </div>
    </footer>
  );
}
