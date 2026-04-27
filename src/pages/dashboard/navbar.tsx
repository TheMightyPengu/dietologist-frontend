// /pages/dashboard/navbar.tsx

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardNavbar() {
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(localStorage.getItem("navbarTitle") || "Διαιτολογικό Κέντρο");
    setImagePreview(localStorage.getItem("navbarImage") || null);
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    localStorage.setItem("navbarTitle", title);

    if (imagePreview) {
      localStorage.setItem("navbarImage", imagePreview);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Later εδώ θα μπει API call:
    // const formData = new FormData();
    // formData.append("Title", title);
    // if (imageFile) formData.append("Image", imageFile);
    // await NavbarApi.update(formData);
  }

  return (
    <>
      <Head>
        <title>Navbar | Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-[#2b2b6f] transition"
            >
              ← Πίσω στο Dashboard
            </Link>
          </div>

          <section className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Διαχείριση Navbar
            </h1>

            <p className="mt-2 text-slate-600">
              Εδώ μπορείς να αλλάξεις τον τίτλο και την εικόνα που εμφανίζονται στο navbar.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Τίτλος Navbar
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#8484d1] focus:ring-2 focus:ring-[#8484d1]/20"
                  placeholder="π.χ. Διαιτολογικό Κέντρο"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Εικόνα / Logo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#8484d1]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#2b2b6f] hover:file:bg-[#8484d1]/20"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-4 text-sm font-medium text-slate-700">
                  Προεπισκόπηση Navbar
                </p>

                <div className="flex items-center gap-4 rounded-xl bg-white border border-slate-200 px-4 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Navbar logo preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Logo
                      </div>
                    )}
                  </div>

                  <span className="text-lg font-semibold text-slate-800">
                    {title || "Τίτλος Navbar"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[#8484d1] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6f6fc4] transition"
                >
                  Αποθήκευση
                </button>

                {saved && (
                  <span className="text-sm text-green-600">
                    Οι αλλαγές αποθηκεύτηκαν.
                  </span>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}