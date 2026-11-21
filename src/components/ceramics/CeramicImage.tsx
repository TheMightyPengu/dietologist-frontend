import Image from "next/image";
import { useState } from "react";
import { toMediaUrl } from "@/api/_axios-client";

const placeholder = "/images/ceramicplaceholder.jpg";

export default function CeramicImage({ url, alt, sizes, eager = false }: {
  url?: string | null;
  alt: string;
  sizes: string;
  eager?: boolean;
}) {
  const source = toMediaUrl(url?.trim()) || placeholder;
  const [failedSource, setFailedSource] = useState<string>();

  return (
    <Image
      src={failedSource === source ? placeholder : source}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className="object-cover"
      onError={() => {
        if (source !== placeholder) setFailedSource(source);
      }}
    />
  );
}
