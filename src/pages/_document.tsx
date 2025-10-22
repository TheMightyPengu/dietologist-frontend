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
          <link
            href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="antialiased bg-bg text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
