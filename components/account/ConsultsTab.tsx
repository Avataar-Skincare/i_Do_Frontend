import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { CONSULT_TYPES } from "@/lib/content/consults";
import { consultWhen, type ConsultStatus, type StoredConsult } from "@/lib/consults-storage";

const STATUS_LABEL: Record<ConsultStatus, string> = {
  PENDING: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function ConsultsTab({ consults }: { consults: StoredConsult[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your consultations</h3>

      {consults.length === 0 ? (
        <div className="flex gap-2.5 items-start bg-surface border border-line rounded-lg p-4 text-[0.9rem] text-ink-2 mb-5">
          <Icon name="info" size={18} className="text-gold-deep shrink-0 mt-0.5" />
          <span>No consults booked yet.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-5">
          {consults.map((consult) => {
            const meta = CONSULT_TYPES.find((t) => t.id === consult.type);
            return (
              <div key={consult.id} className="bg-surface border border-line rounded-lg p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-semibold">{meta?.eyebrow ?? "Consult"}</div>
                    <div className="text-[0.82rem] text-muted mt-0.5">{consultWhen(consult)}</div>
                  </div>
                  <span className="shrink-0 text-[0.72rem] font-semibold py-1 px-2.5 rounded-pill bg-gold-wash text-gold-deep">
                    {STATUS_LABEL[consult.status] ?? consult.status}
                  </span>
                </div>
                {consult.status === "CONFIRMED" && (consult.doctorName || consult.meetingLink) && (
                  <p className="text-[0.88rem] text-ink-2 mb-2">
                    {consult.doctorName}
                    {consult.doctorName && consult.meetingLink ? " · " : ""}
                    {consult.meetingLink && (
                      <a href={consult.meetingLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-deep underline">
                        Join the call
                      </a>
                    )}
                  </p>
                )}
                {consult.concern && <p className="text-muted text-[0.9rem] m-0">&ldquo;{consult.concern}&rdquo;</p>}
              </div>
            );
          })}
        </div>
      )}

      <LinkButton href="/consults">
        <Icon name="cal" size={18} /> Book a consult
      </LinkButton>
    </div>
  );
}
