import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export default function EmptyState({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-finance-border px-4 py-10 text-center">
      <Icon size={28} className="text-finance-muted" />
      <p className="text-sm text-finance-muted">{title}</p>
      {action}
    </div>
  );
}
