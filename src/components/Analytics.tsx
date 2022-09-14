import React from 'react'
import Script from 'next/script'

import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

const Analytics: FC<unknown> = () => {
  return (
    <>
      {!isDevelopment && (
        <>
          {/* Google Tag Manager */}
          <Script
            id='gtm-script'
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-TQFCQ34');`,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQFCQ34" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />

          {/* Google analytics */}
          <Script src='https://www.googletagmanager.com/gtag/js?id=G-J8PBR72YD2' />
          <Script
            id='ga-script'
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-J8PBR72YD2', { page_path: window.location.pathname });
                        gtag('config', 'UA-124394398-3');`,
            }}
          />

          {/* Yandex.Metrika counter */}
          <Script
            id='ya-script'
            dangerouslySetInnerHTML={{
              __html: ` (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                        ym(84095569, "init", {
                        clickmap:true,
                        trackLinks:true,
                        accurateTrackBounce:true,
                        webvisor:true
                    });`,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<div><img src="https://mc.yandex.ru/watch/84095569" style="position:absolute; left:-9999px;" alt="" /></div>`,
            }}
          />

          {/* Facebook Pixel Code */}
          <Script
            id='fbp-script'
            dangerouslySetInnerHTML={{
              __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '382254763568764');
                            fbq('track', 'PageView');
                        `,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=382254763568764&ev=PageView&noscript=1" />`,
            }}
          />
        </>
      )}
    </>
  )
}

export default Analytics
