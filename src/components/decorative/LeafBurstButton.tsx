import Link from "next/link";
import "../../styles/leafburst.scss";

export default function LeafBurstButton({ text }: { text: string }) {
  return (
    <div className="button">

        <Link
          href="/contact/book"
          className="button_inner q inline-flex items-center rounded-2xl bg-[#7a7ac4] px-6 py-3 text-white text-lg font-medium shadow hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7ac4]"
        >
          <i className="l ion-log-in" />
          <span className="t">{text}</span>
          <span>
            <i className="tick ion-checkmark-round" />
          </span>

          <div className="b_l_quad">
            {Array.from({ length: 52 }).map((_, i) => (
              <span className="button_spots" key={i} />
            ))}
          </div>
        </Link>

    </div>
  );
}
