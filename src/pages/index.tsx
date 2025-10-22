import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Αρχική — Διαιτολογικό Κέντρο</title>
        <meta
          name="description"
          content="Καλωσήρθατε στο Διαιτολογικό Κέντρο — Επιστημονική υποστήριξη, εξατομικευμένα προγράμματα και ζεστή προσέγγιση στη διατροφή."
        />
      </Head>

      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[var(--bg)]">
        <h1 className="text-4xl md:text-5xl font-semibold text-brand mb-4">
          Καλωσήρθατε στο Διαιτολογικό Κέντρο
        </h1>
        <p className="max-w-2xl text-lg text-gray-700 mb-8">
          Στόχος μας είναι να προσφέρουμε μια ζεστή, φιλική και επιστημονικά
          τεκμηριωμένη εμπειρία διατροφικής υποστήριξης. Οι συνεδρίες μπορούν να
          πραγματοποιηθούν είτε από κοντά είτε διαδικτυακά.
        </p>
        <a
          href="/contact/book"
          className="px-6 py-3 bg-brand text-white rounded-xl hover:opacity-90 transition"
        >
          Ζητήστε ένα ραντεβού
        </a>
      </section>
    </>
  );
}
