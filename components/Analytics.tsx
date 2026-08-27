import Script from 'next/script';
import { GTM_ID, analyticsEnabled } from '@/lib/analytics/events';

/**
 * GTM container. Loaded with `afterInteractive` so it never competes with the
 * hero image or the LCP text, and rendered as nothing at all when no container
 * id is configured.
 */
export function Analytics() {
  if (!analyticsEnabled()) return null;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}
