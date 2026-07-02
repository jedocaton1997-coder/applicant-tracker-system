import { ShieldCheck, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { siteContent } from "../data/siteContent";
import { SignupForm } from "./SignupForm";

function HighlightedHeadline() {
  const heroAccent = "escape from";
  const [before, after = ""] = siteContent.heroHeadline.split(heroAccent);

  return (
    <h1 className="font-serif text-4xl font-black leading-[0.98] tracking-normal text-white drop-shadow-[0_3px_22px_rgba(7,4,16,0.48)] sm:text-5xl lg:text-[4.25rem]">
      {before}
      <span className="brush-underline">
        {heroAccent}
      </span>
      {after}
    </h1>
  );
}

export function HeroSection() {
  return (
    <section className="hero-section relative min-h-svh overflow-hidden bg-[#202020] p-4 sm:p-6 lg:flex lg:items-start lg:justify-center lg:p-8">
      <div className="hero-stage relative mx-auto w-full overflow-hidden bg-[#080614] shadow-[0_28px_90px_rgba(0,0,0,0.36)] lg:aspect-[1672/941] lg:w-[calc(100vw-4rem)] lg:max-w-[1900px]">
        <div
          className="absolute inset-0 bg-cover bg-[position:center_top] sm:hidden"
          style={{ backgroundImage: `url(${siteContent.heroMobileBackgroundImage})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center sm:block"
          style={{ backgroundImage: `url(${siteContent.heroBackgroundImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,2,10,0.18)_0%,rgba(2,2,10,0.04)_42%,rgba(8,6,18,0.12)_58%,rgba(6,4,14,0.16)_100%),linear-gradient(180deg,rgba(3,3,12,0.06)_0%,rgba(3,2,10,0)_44%,rgba(4,3,12,0.18)_100%)]" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 hidden w-[55%] bg-[radial-gradient(circle_at_72%_50%,rgba(255,47,163,0.1),transparent_34%),linear-gradient(90deg,rgba(7,5,18,0)_0%,rgba(8,6,18,0.06)_28%,rgba(8,6,18,0.12)_100%)] sm:block" aria-hidden="true" />

        <div className="hero-content relative z-10 grid w-full items-start gap-6 overflow-visible px-5 py-6 sm:px-8 sm:py-8 lg:absolute lg:inset-0 lg:grid-cols-[1.06fr_0.94fr] lg:items-start lg:gap-8 lg:px-[3.2%] lg:py-[7%]">
          <div className="min-h-[520px] sm:min-h-[500px] lg:min-h-0" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.7, ease: "easeOut" }}
            className="relative z-10 mx-auto max-w-[42rem] rounded-[28px] border border-white/14 bg-[#180f25]/38 p-5 shadow-[0_34px_120px_rgba(4,3,12,0.42)] backdrop-blur-md sm:p-7 lg:mx-0 lg:mt-[1.2%] lg:w-full lg:max-w-none lg:p-[6.4%]"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff4ed8]/80 bg-[#ff2fa3]/10 px-4 py-2 text-xs font-black text-[#ff7aef] shadow-[0_12px_32px_rgba(255,78,216,0.18)] backdrop-blur">
              <Zap className="size-4" aria-hidden="true" />
              {siteContent.heroBadge}
            </span>

            <div className="mt-7 lg:mt-[7%]">
              <HighlightedHeadline />
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/82 lg:mt-[4%] lg:max-w-[46rem]">{siteContent.heroBody}</p>
            </div>

            <SignupForm />

            <div className="mt-6 grid gap-4 lg:mt-[5%]">
              {siteContent.benefits.map((benefit, index) => {
                const Icon = index === 0 ? Users : ShieldCheck;
                return (
                <div key={benefit} className="flex gap-3 text-sm font-semibold leading-5 text-white/84">
                  <Icon className="mt-0.5 size-6 shrink-0 text-[#ff4ed8]" aria-hidden="true" />
                  <span>{benefit}</span>
                </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
