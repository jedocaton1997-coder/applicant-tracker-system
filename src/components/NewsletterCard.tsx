import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { siteContent } from "../data/siteContent";

export function NewsletterCard() {
  return (
    <div className="hero-artwork-shell relative mx-auto flex w-full max-w-[39rem] justify-center lg:-ml-8 lg:max-w-[54rem]">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hero-image-wrapper w-full"
        style={{ "--hero-artwork": `url(${siteContent.frontPageImage})` } as CSSProperties}
      >
        <img
          src={siteContent.frontPageImage}
          alt={`${siteContent.brandName} newsletter front page preview`}
          width="1342"
          height="1642"
          className="hero-image mx-auto max-h-[620px] max-w-full object-contain lg:max-h-[850px]"
        />
      </motion.div>
    </div>
  );
}
