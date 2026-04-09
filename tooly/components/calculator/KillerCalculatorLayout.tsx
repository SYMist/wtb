import type { ReactNode } from "react";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import JsonLd from "@/components/common/JsonLd";
import type { Calculator } from "@/lib/data/calculators";

interface KillerCalculatorLayoutProps {
  calculator: Calculator;
  inputForm: ReactNode;
  resultPanel: ReactNode;
  guideContent?: ReactNode;
}

export default function KillerCalculatorLayout({
  calculator,
  inputForm,
  resultPanel,
  guideContent,
}: KillerCalculatorLayoutProps) {
  return (
    <>
      <JsonLd calculator={calculator} />
      <GNB />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">
          {calculator.seo.h1}
        </h1>

        <AdSlot type="banner" />

        {/* Desktop: side-by-side, Mobile: stacked */}
        <div className="mt-4 flex flex-col gap-6 lg:flex-row">
          {/* Input form */}
          <div className="w-full lg:w-1/2">{inputForm}</div>

          {/* Result panel - sticky on desktop */}
          <div className="w-full lg:w-1/2">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              {resultPanel}
            </div>
          </div>
        </div>

        <AdSlot type="inline" className="mt-8" />

        {guideContent && (
          <div className="mt-8">
            <GuideText>{guideContent}</GuideText>
          </div>
        )}

        <div className="mt-8">
          <RelatedCalculators calculatorId={calculator.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
