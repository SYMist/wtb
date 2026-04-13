import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Tooly",
  description: "Tooly 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <>
      <GNB />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-text-primary">
          개인정보처리방침
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              1. 수집하는 개인정보
            </h2>
            <p>
              Tooly는 서비스 이용 과정에서 자동으로 생성되는 정보(IP 주소, 방문
              일시, 브라우저 종류, 이용 기록)를 수집할 수 있습니다. 별도의 회원가입
              절차가 없으므로 이름, 이메일 등 개인 식별 정보는 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              2. 개인정보의 수집 목적
            </h2>
            <p>
              수집된 정보는 서비스 개선, 이용 통계 분석, 광고 최적화 목적으로만
              사용됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              3. 쿠키 및 광고
            </h2>
            <p>
              본 사이트는 Google AdSense를 통해 광고를 게재하며, Google은 쿠키를
              사용하여 이용자의 관심사에 기반한 광고를 표시할 수 있습니다. 이용자는
              브라우저 설정에서 쿠키를 관리하거나{" "}
              <a
                href="https://www.google.com/settings/ads"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 비활성화할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              4. 분석 도구
            </h2>
            <p>
              서비스 이용 현황 파악을 위해 Google Analytics를 사용할 수 있으며,
              이를 통해 수집되는 데이터는 익명화되어 처리됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              5. 개인정보 보유 기간
            </h2>
            <p>
              자동 수집된 로그 데이터는 수집일로부터 1년간 보관 후 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              6. 문의
            </h2>
            <p>
              개인정보 관련 문의사항은 사이트 하단의 연락처를 통해 문의해 주시기
              바랍니다.
            </p>
          </section>

          <p className="mt-8 text-xs text-text-secondary">
            시행일: 2026년 4월 13일
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
