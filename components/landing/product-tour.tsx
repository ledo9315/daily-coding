"use client";

import Image from "next/image";
import { LayoutDashboard, Code2, Trophy, Expand, X } from "lucide-react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VIEWS = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "editor", icon: Code2 },
  { id: "profile", icon: Trophy },
] as const;

export function ProductTour() {
  const t = useTranslations("dashboard.landing.tour");
  return (
    <section id="product-tour" className="lp-section lp-container">
      <div className="lp-section-heading">
        <div>
          <p className="lp-kicker">{t("eyebrow")}</p>
          <h2>{t("title")}</h2>
        </div>
        <p>{t("intro")}</p>
      </div>
      <Tabs defaultValue="dashboard" className="lp-tour">
        <TabsList className="lp-tour-tabs" aria-label={t("label")}>
          {VIEWS.map(({ id, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="lp-tour-tab">
              <Icon size={18} aria-hidden />
              {t(`${id}.label`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {VIEWS.map(({ id }) => (
          <TabsContent key={id} value={id} className="lp-tour-panel">
            <Dialog.Root>
              <Dialog.Trigger
                className="lp-tour-image"
                aria-label={t("enlarge", { view: t(`${id}.label`) })}
              >
                <Image
                  src={`/landing/${id}-tour.webp`}
                  alt={t(`${id}.alt`)}
                  width={3180}
                  height={1674}
                  sizes="(max-width: 1200px) 92vw, 1184px"
                />
                <span className="lp-expand">
                  <Expand size={17} aria-hidden />
                  {t("zoom")}
                </span>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="lp-dialog-overlay" />
                <Dialog.Content
                  className="lp-dialog-content"
                  aria-describedby={undefined}
                >
                  <Dialog.Title className="sr-only">
                    {t(`${id}.label`)}
                  </Dialog.Title>
                  <Image
                    src={`/landing/${id}-tour.webp`}
                    alt={t(`${id}.alt`)}
                    width={3180}
                    height={1674}
                    sizes="96vw"
                  />
                  <Dialog.Close
                    className="lp-dialog-close"
                    aria-label={t("close")}
                  >
                    <X aria-hidden />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div className="lp-tour-caption">
              <strong>{t(`${id}.caption`)}</strong>
              <span>{t("disclaimer")}</span>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
