import { useEffect, useRef, useState } from "react";
import { useLocale } from "../../../i18n";
import { FixedExpenseForPeriod } from "../domain/fixedExpenses";
import { Category } from "../domain/types";
import FixedExpenseCard from "./FixedExpenseCard";

/**
 * A finite (non-looping — see the plan's explicit permission to skip
 * infinite looping in favor of predictable UX), swipeable card carousel
 * built on native CSS scroll-snap rather than a hand-rolled drag gesture
 * or a library: this gets correct touch/momentum scrolling, "no accidental
 * taps while swiping" (a common pitfall of custom drag-to-swipe
 * implementations), and correct RTL behavior all for free from the
 * browser, since it's just normal horizontal scrolling under the
 * surrounding dir attribute.
 */
export default function FixedExpenseCarousel({
  items,
  categoryById,
  onMarkPaid,
}: {
  items: FixedExpenseForPeriod[];
  categoryById: Map<string, Category>;
  onMarkPaid: (status: FixedExpenseForPeriod) => void;
}) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = cardRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: container, threshold: 0.6 },
    );

    for (const el of cardRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div>
      <div
        ref={containerRef}
        role="group"
        aria-label={t("finance.fixedExpenses.upcomingCarousel")}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((status, index) => (
          <div
            key={status.fixedExpense.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="snap-center"
          >
            <FixedExpenseCard
              status={status}
              category={categoryById.get(status.fixedExpense.categoryId)}
              onMarkPaid={() => onMarkPaid(status)}
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
          {items.map((status, index) => (
            <span
              key={status.fixedExpense.id}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === activeIndex ? "bg-finance-accent" : "bg-finance-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
