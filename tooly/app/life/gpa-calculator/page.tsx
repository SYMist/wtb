"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  calculateGpa,
  getGradeOptions,
  type Course,
  type GpaScale,
} from "@/lib/calculators/gpa";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const CREDIT_OPTIONS = [1, 2, 3];

function createEmptyCourse(): Course {
  return { name: "", credits: 3, grade: "" };
}

function GpaCalculatorInner() {
  useSearchParams();

  const [scale, setScale] = useState<GpaScale>("4.5");
  const [courses, setCourses] = useState<Course[]>(() =>
    Array.from({ length: 5 }, createEmptyCourse)
  );

  const gradeOptions = useMemo(() => getGradeOptions(scale), [scale]);

  const result = useMemo(() => {
    const validCourses = courses.filter(
      (c) => c.credits > 0 && c.grade !== ""
    );
    return calculateGpa(validCourses, scale);
  }, [courses, scale]);

  const handleScaleChange = (newScale: GpaScale) => {
    setScale(newScale);
    setCourses((prev) =>
      prev.map((c) => ({ ...c, grade: "" }))
    );
  };

  const handleCourseChange = (
    index: number,
    field: keyof Course,
    value: string | number
  ) => {
    setCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCourse = () => {
    setCourses((prev) => [...prev, createEmptyCourse()]);
  };

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const calculator = getCalculator("gpa-calculator");

  const gradeTable43 = [
    { grade: "A+", point: "4.3" },
    { grade: "A0", point: "4.0" },
    { grade: "A-", point: "3.7" },
    { grade: "B+", point: "3.3" },
    { grade: "B0", point: "3.0" },
    { grade: "B-", point: "2.7" },
    { grade: "C+", point: "2.3" },
    { grade: "C0", point: "2.0" },
    { grade: "C-", point: "1.7" },
    { grade: "D+", point: "1.3" },
    { grade: "D0", point: "1.0" },
    { grade: "D-", point: "0.7" },
    { grade: "F", point: "0.0" },
  ];

  const gradeTable45 = [
    { grade: "A+", point: "4.5" },
    { grade: "A0", point: "4.0" },
    { grade: "A-", point: "3.5" },
    { grade: "B+", point: "3.5" },
    { grade: "B0", point: "3.0" },
    { grade: "B-", point: "2.5" },
    { grade: "C+", point: "2.5" },
    { grade: "C0", point: "2.0" },
    { grade: "C-", point: "1.5" },
    { grade: "D+", point: "1.5" },
    { grade: "D0", point: "1.0" },
    { grade: "D-", point: "0.5" },
    { grade: "F", point: "0.0" },
  ];

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              학점 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              과목별 학점수와 성적을 입력하면 평균 학점(GPA)을 자동으로 계산합니다. 4.3 / 4.5 만점 기준 모두 지원합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left: Inputs */}
            <div className="flex-1 space-y-6">
              {/* Scale toggle */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  만점 기준 선택
                </h2>
                <div className="flex gap-3">
                  {(["4.3", "4.5"] as GpaScale[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScaleChange(s)}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        scale === s
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {s} 만점
                    </button>
                  ))}
                </div>
              </div>

              {/* Course list */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  과목 입력
                </h2>

                <div className="space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_80px_90px_36px] gap-2 text-xs font-medium text-text-secondary">
                    <span>과목명</span>
                    <span className="text-center">학점</span>
                    <span className="text-center">성적</span>
                    <span />
                  </div>

                  {courses.map((course, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_80px_90px_36px] gap-2"
                    >
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) =>
                          handleCourseChange(index, "name", e.target.value)
                        }
                        placeholder={`과목 ${index + 1}`}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                      />
                      <select
                        value={course.credits}
                        onChange={(e) =>
                          handleCourseChange(
                            index,
                            "credits",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-lg border border-border px-2 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                      >
                        {CREDIT_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}학점
                          </option>
                        ))}
                      </select>
                      <select
                        value={course.grade}
                        onChange={(e) =>
                          handleCourseChange(index, "grade", e.target.value)
                        }
                        className="rounded-lg border border-border px-2 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                      >
                        <option value="">-</option>
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeCourse(index)}
                        disabled={courses.length <= 1}
                        className="flex items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-negative hover:text-negative disabled:opacity-30"
                        aria-label="과목 삭제"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCourse}
                  className="mt-4 w-full rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  + 과목 추가
                </button>
              </div>

              <AdSlot type="inline" />

              {/* Grade table guide */}
              <GuideText title="학점 등급표 및 4.3 vs 4.5 차이">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 font-semibold text-text-primary">
                      4.3 만점과 4.5 만점의 차이
                    </p>
                    <p>
                      <strong>4.3 만점</strong>은 A+를 4.3점으로 계산하며, 국내 대부분의 사립대학이 사용합니다. <strong>4.5 만점</strong>은 A+를 4.5점으로 계산하며 일부 대학에서 사용합니다. 본인의 학교 학사 규정을 확인하세요.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 font-semibold text-text-primary">
                        4.3 만점 등급표
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-1 text-left font-medium text-text-secondary">
                              등급
                            </th>
                            <th className="pb-1 text-right font-medium text-text-secondary">
                              학점
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {gradeTable43.map((row) => (
                            <tr key={row.grade}>
                              <td className="py-0.5 font-medium text-text-primary">
                                {row.grade}
                              </td>
                              <td className="py-0.5 text-right tabular-nums text-text-primary">
                                {row.point}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <p className="mb-2 font-semibold text-text-primary">
                        4.5 만점 등급표
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-1 text-left font-medium text-text-secondary">
                              등급
                            </th>
                            <th className="pb-1 text-right font-medium text-text-secondary">
                              학점
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {gradeTable45.map((row) => (
                            <tr key={row.grade}>
                              <td className="py-0.5 font-medium text-text-primary">
                                {row.grade}
                              </td>
                              <td className="py-0.5 text-right tabular-nums text-text-primary">
                                {row.point}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </GuideText>

              <RelatedCalculators calculatorId="gpa-calculator" />
            </div>

            {/* Right: Results */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  평균 학점 (GPA)
                </p>
                <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                  {result.gpa.toFixed(2)}
                  <span className="ml-1 text-lg font-medium text-text-secondary">
                    / {result.maxGpa}
                  </span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                  <div>
                    <p className="text-xs text-text-secondary">총 학점수</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {result.totalCredits}학점
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">총 취득 포인트</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {result.totalPoints.toFixed(2)}점
                    </p>
                  </div>
                </div>
              </div>

              {/* Course count info */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-1 text-xs font-medium text-text-secondary">
                  입력 현황
                </p>
                <p className="text-sm text-text-primary">
                  <span className="font-semibold tabular-nums text-primary">
                    {courses.filter((c) => c.grade !== "").length}
                  </span>
                  /{courses.length}과목 성적 입력됨
                </p>
                {courses.filter((c) => c.grade !== "").length === 0 && (
                  <p className="mt-1 text-xs text-text-secondary">
                    성적을 입력하면 학점이 계산됩니다.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="학점 계산기 - Tooly"
                  description={`평균 학점: ${result.gpa.toFixed(2)} / ${result.maxGpa} (${result.totalCredits}학점)`}
                />
              </div>

              <AdSlot type="sidebar" />
            </aside>
          </div>

          <div className="mt-8">
            <AdSlot type="banner" />
          </div>
        </div>
      </main>

      <Footer />

      {calculator && <JsonLd calculator={calculator} />}
    </>
  );
}

export default function GpaCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <GpaCalculatorInner />
    </Suspense>
  );
}
