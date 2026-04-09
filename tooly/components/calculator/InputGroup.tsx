import type { ReactNode } from "react";

interface InputGroupProps {
  title: string;
  children: ReactNode;
}

export default function InputGroup({ title, children }: InputGroupProps) {
  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-text-primary">
        {title}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
