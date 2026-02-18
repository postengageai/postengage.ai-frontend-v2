'use client';

import Script from 'next/script';

export function FacebookSDK() {
  return (
    <>
      <Script id='facebook-init' strategy='afterInteractive'>
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId      : '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
              cookie     : true,
              xfbml      : true,
              version    : 'v24.0'
            });
            FB.AppEvents.logPageView();
          };
        `}
      </Script>
      <Script
        id='facebook-jssdk'
        src='https://connect.facebook.net/en_US/sdk.js'
        strategy='afterInteractive'
      />
    </>
  );
}
