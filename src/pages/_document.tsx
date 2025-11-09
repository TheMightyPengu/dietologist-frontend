import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="el">
        <Head>
          {/* Meta defaults */}
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#7a7ac4" />
          <link rel="icon" href="/favicon.ico" />

          {/* Fonts example (optional — replace with your choice later) */}
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
        </Head>
        <body className="antialiased bg-bg text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
