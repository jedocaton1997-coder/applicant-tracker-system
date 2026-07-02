import { motion } from "motion/react";
import { siteContent } from "../data/siteContent";
import { InfoCard } from "./InfoCard";

function HighlightedAboutHeadline() {
  const aboutAccent = "keep doing it";
  const [before, after = ""] = siteContent.about.headline.split(aboutAccent);

  return (
    <h2 className="font-serif text-4xl font-black leading-tight text-[#2b2035] sm:text-5xl">
      {before}
      <span className="brush-underline">
        {aboutAccent}
      </span>
      {after}
    </h2>
  );
}

export function AboutSection() {
  return (
    <section className="relative overflow-hidden border-t border-[#efeaf4] bg-[linear-gradient(180deg,#FAFAF7_0%,#ffffff_48%,#f7fbf8_100%)] px-5 py-16 sm:px-8 lg:px-10">
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full border border-[#e8e3ec]" aria-hidden="true" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full border border-[#e8e3ec]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <p className="flex items-center gap-2 text-xs font-black text-[#20e3ee]">
            <span className="size-2 rounded-sm bg-[#ff7aef]" aria-hidden="true" />
            {siteContent.about.label}
          </p>
          <div className="mt-4 overflow-hidden rounded-[8px] border border-[#ece7f2] bg-white p-2 shadow-[0_24px_70px_rgba(17,24,39,0.08)]">
            <img
              src={siteContent.imagePath}
              alt={`${siteContent.creatorName} on a beach`}
              className="aspect-[0.86] w-full rounded-[7px] object-cover object-[30%_center] sm:aspect-[1.05] lg:aspect-[0.86]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="lg:pt-1"
        >
          <HighlightedAboutHeadline />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {siteContent.about.cards.map((card, index) => (
              <InfoCard
                key={card.title}
                title={card.title}
                subtitle={"subtitle" in card ? card.subtitle : undefined}
                paragraphs={"paragraphs" in card ? card.paragraphs : undefined}
                checklist={"checklist" in card ? card.checklist : undefined}
                featured={index === 0}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
