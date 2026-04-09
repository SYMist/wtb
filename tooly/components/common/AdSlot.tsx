interface AdSlotProps {
  type: "banner" | "inline" | "sidebar";
  className?: string;
}

const sizeMap = {
  banner: "h-[90px] sm:h-[100px]",
  inline: "h-[250px]",
  sidebar: "h-[600px]",
};

export default function AdSlot({ type, className = "" }: AdSlotProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-surface text-xs text-text-secondary ${sizeMap[type]} ${
        type === "sidebar" ? "hidden lg:flex" : ""
      } ${className}`}
      data-ad-slot={type}
    >
      {/* AdSense ad unit will be injected here */}
      <span className="opacity-50">광고 영역</span>
    </div>
  );
}
