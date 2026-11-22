import Image from "next/image";
import { useState } from "react";
import { toMediaUrl } from "@/api/_axios-client";

const placeholder = "/images/ceramicplaceholder.jpg";

export default function CeramicImage({ url, alt, sizes, eager = false, fit = "cover", fallback = placeholder }: {
  url?: string | null;
  alt: string;
  sizes: string;
  eager?: boolean;
  fit?: "cover" | "contain" | "natural";
  fallback?: string;
}) {
  const source = toMediaUrl(url?.trim()) || fallback;
  const [failedSource, setFailedSource] = useState<string>();
  const src = failedSource === source ? fallback : source;
  const loading = eager ? "eager" : "lazy";
  const onError = () => {
    if (source !== fallback) setFailedSource(source);
  };

  if (fit === "natural") {
    return (
      // The catalog provides no image dimensions, so use the decoded aspect ratio.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading={loading} onError={onError} className="block h-auto max-h-[min(72svh,42rem)] w-auto max-w-full rounded-2xl" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      loading={loading}
      className={fit === "contain" ? "object-contain" : "object-cover"}
      onError={onError}
    />
  );
}
