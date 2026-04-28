import Link from "next/link";

interface CalculatorCTAProps {
  title: string;
  description: string;
  href: string;
  buttonText?: string;
}

export default function CalculatorCTA({
  title,
  description,
  href,
  buttonText = "계산기 실행하기",
}: CalculatorCTAProps) {
  return (
    <div className="my-8 flex flex-col items-center gap-4 rounded-2xl bg-slate-900 p-8 text-center text-white">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="8" y2="10" />
        <line x1="12" y1="10" x2="12" y2="10" />
        <line x1="16" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" />
        <line x1="12" y1="14" x2="12" y2="14" />
        <line x1="16" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>
      <div>
        <h4 className="mb-2 text-xl font-bold">{title}</h4>
        <p className="mb-6 text-sm text-slate-400">{description}</p>
      </div>
      <Link
        href={href}
        className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:bg-indigo-500"
      >
        {buttonText}
      </Link>
    </div>
  );
}
