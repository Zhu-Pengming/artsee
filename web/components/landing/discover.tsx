'use client'

import { motion } from "motion/react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function Discover() {
  const t = useTranslations('discover');
  const artists = [
    {
      key: "elias",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl2jePoAM03S5req35nRkNAkRPBuuy-p5m4DlswnngN6355EEO4mVW4u84oeTxG4eIQhEWQ-W_QgN4Ay7s2BXrxiTzZqofYGTZGYcAXatTCCbXd1-RLrtmyha4JurUKnW4Q4sDBAjsdUFdg0TbUSyCLdr7AzyIyAHY1DegxOF9VQys0x7qTUeVrprbeZ5uXDLRvTMsZMSSpwe_Z5ErqfvSflc2qUT8NMu7g5Hl50ln-hRchtY9Ae1zRfS_Lr8IRK46evjOURNj0F80"
    },
    {
      key: "sienna",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO193SqFbb_2JI5s1KfVyLQohggnMW-m_Nx8NzYThTWA614M_HDkPiAIwgAg-e01SdRrxVkjSGydyQAWTPgumSHA1c1GQXgC7P5-JzOleeDC9tDPOBkhts32bV9VaxWyxGyjF-vDLT1EvpnInjO-l-q3A7YPbWEQruZr8pL7DDRoAkq6lniU27hFvQj5CrPnfdGqUCDyMhuiSDu1sMgLRz7XdwAwWght2h07QBT7J2NqzX4SY-r69rNzuYBB4otymfIxHtr8SclJSL"
    },
    {
      key: "marcus",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzwKnbJPwDJ12FaodzIIPrCiNdEvUaJHHvSnyuCZOVk4M3pz0ofpHBWgLEwlTpF9ZkMxlnjCuJCuyTPAFDWRw578-0nG4sM9AS6COkKNsv5a-C7YyrdpogOO_Df1_eaF2jFzQq9Q_VuVRi6ECM8iY4GmWYvCrbg8Dpzrb8dUQFk1pcpEyyaP-kcwUe6S_gml0d_5jlUlBmlvcIwD7xJllKspnuCswpNQHqPLPX7sJMPgmnQ84rpC6dnJek0nXf1FeSabiGnXqafo98"
    }
  ];

  return (
    <section className="bg-surface-container-low min-h-[calc(100dvh-6rem)] flex items-center py-16 lg:py-20 px-6 md:px-12 lg:px-24">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-headline font-bold text-on-surface mb-6">{t('title')}</h2>
            <p className="text-on-surface-variant leading-relaxed">
              {t('description')}
            </p>
          </div>
          <Link className="text-primary font-medium border-b border-primary/20 hover:border-primary transition-all pb-1 mb-2" href="/discover">
            {t('viewDirectory')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="h-[min(36vh,18rem)] w-full overflow-hidden rounded-md mb-6 bg-surface shadow-sm">
                <img
                  alt={t(`artists.${artist.key}.name`)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  src={artist.image}
                />
              </div>
              <h3 className="font-headline font-bold text-xl mb-1">{t(`artists.${artist.key}.name`)}</h3>
              <p className="text-sm text-secondary uppercase tracking-widest mb-3">{t(`artists.${artist.key}.category`)}</p>
              <p className="text-sm text-on-surface-variant line-clamp-2">{t(`artists.${artist.key}.description`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
