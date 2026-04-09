import type { ReactNode } from "react";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import JsonLd from "@/components/common/JsonLd";
import type { Calculator } from "@/lib/data/calculators";

interface GeneralCalculatorLayoutProps {
  calculator: Calculator;
  inputForm: ReactNode;
  resultPanel: ReactNode;
  guideContent?: ReactNode;
}

export default function GeneralCalculatorLayout({
  calculator,
  inputForm,
  resultPanel,
  guideContent,
}: GeneralCalculatorLayoutProps) {
  return (
    <>
      <JsonLd calculator={calculator} />
      <GNB />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">
          {calculator.seo.h1}
        </h1>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="w-full lg:flex-1">
            {inputForm}

            <div className="mt-6">{resultPanel}</div>

            <AdSlot type="inline" className="mt-6" />

            {guideContent && (
              <div className="mt-6">
                <GuideText>{guideContent}</GuideText>
              </div>
            )}

            <div className="mt-6">
              <RelatedCalculators calculatorId={calculator.id} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20">
              <AdSlot type="sidebar" />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
