import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="el">
        <Head>
          {/* Meta defaults */}
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#8484d1" />
          <link rel="icon" href="/favicon.ico" />

          {/* Fonts: Noto Sans + Roboto */}
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
        </Head>
        <body className="antialiased bg-bg text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
