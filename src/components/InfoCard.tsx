import { CheckCircle2, Heart, Send, UserRound } from "lucide-react";
import type { Key } from "react";

type InfoCardProps = {
  key?: Key;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  checklist?: string[];
  featured?: boolean;
};

export function InfoCard({ title, subtitle, paragraphs = [], checklist = [], featured = false }: InfoCardProps) {
  const Icon = title.includes("About") ? UserRound : title.includes("Get") ? Send : Heart;
  const firstColumnParagraphs = featured ? paragraphs.slice(0, 2) : paragraphs;
  const secondColumnParagraphs = featured ? paragraphs.slice(2) : [];

  return (
    <article className={`rounded-[8px] border border-[#ece7f2] bg-white/88 p-5 shadow-[0_18px_60px_rgba(17,24,39,0.06)] backdrop-blur ${featured ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-3">
        <Icon className="size-5 shrink-0 text-[#ff7aef]" aria-hidden="true" />
        <h3 className="text-base font-black text-[#2b2035]">{title}</h3>
      </div>
      {subtitle ? <p className="mt-4 text-sm font-bold text-[#20e3ee]">{subtitle}</p> : null}
      {paragraphs.length ? (
        <div className={`mt-4 text-sm leading-6 text-[#57485f] ${featured ? "grid gap-5 md:grid-cols-2" : ""}`}>
          <div className="space-y-3">
            {firstColumnParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {secondColumnParagraphs.length ? (
            <div className="space-y-3">
              {secondColumnParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {checklist.length ? (
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-5 text-[#57485f]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#FF2FA3]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
