import Link from 'next/link';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { FOOTER } from '@/lib/content/home';
import { FOOTER_COLUMNS, SITE, SOCIAL_LINKS } from '@/lib/content/site';
import { NewsletterFormLazy } from './NewsletterFormLazy';
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
    <footer className="px-md pt-lg pb-sm relative overflow-hidden">
      <div className="max-w-shell gap-columns mx-auto grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        <div>
          <div className="text-forest">
            <Wordmark size="footer" />
          </div>

          <Eyebrow className="mt-gap-heading" tone="sage">
            {FOOTER.newsletterHeading}
          </Eyebrow>
          <div className="mt-gap-eyebrow">
            <NewsletterFormLazy />
          </div>

          <Eyebrow className="mt-gap-heading" tone="sage">
            {FOOTER.contactHeading}
          </Eyebrow>
          <ul className="mt-gap-eyebrow text-forest gap-items flex list-none p-0">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="hover:text-accent-text inline-flex text-inherit transition-colors duration-[var(--dur-hover-swap)]"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="gap-sm grid grid-cols-2 md:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <Eyebrow as="h2" tone="forest" track="tight">
                {column.heading}
              </Eyebrow>
              <ul className="gap-items text-link mt-sm flex list-none flex-col p-0">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="hover:text-accent-text transition-colors duration-[var(--dur-hover-swap)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="hover:text-accent-text transition-colors duration-[var(--dur-hover-swap)]"
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

      <div className="max-w-shell gap-cards border-forest/22 pt-gap-tight text-legal text-forest mt-xl mx-auto flex flex-wrap items-center justify-between border-t-[length:var(--border-hair)] border-solid">
        <span>
          &copy;{SITE.copyrightYear} {SITE.legalName} All rights reserved.
        </span>
        <span className="opacity-85">{SITE.note}</span>
      </div>
    </footer>
  );
}
