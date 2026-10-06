import { Icon } from "@/components/ui/Icon";
import { ORDER_STAGES, orderStageIndex } from "@/lib/order-status";
import type { Order } from "@/lib/orders-storage";

export function TrackTimeline({ order }: { order: Order }) {
  const idx = orderStageIndex(order);

  return (
    <div>
      {ORDER_STAGES.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        const isLast = i === ORDER_STAGES.length - 1;

        return (
          <div key={stage.title} className={`relative flex gap-4 ${isLast ? "" : "pb-6"}`}>
            {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-line-2" />}
            <div
              className={[
                "relative z-10 w-7 h-7 shrink-0 rounded-full border-2 grid place-items-center",
                done ? "bg-sage border-sage text-white" : "",
                active ? "bg-gold border-gold text-white shadow-[0_0_0_4px_var(--color-gold-wash)]" : "",
                !done && !active ? "bg-surface border-line-2 text-transparent" : "",
              ].join(" ")}
            >
              {(done || active) && <Icon name="check" size={15} />}
            </div>
            <div>
              <h4 className={`text-[0.98rem] mb-0.5 font-medium ${done || active ? "text-ink" : "text-muted"}`}>
                {stage.title}
              </h4>
              <p className="text-[0.82rem] text-muted">{stage.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
