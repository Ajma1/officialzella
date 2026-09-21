import { prisma } from "@zella/db";
import { FeedbackStatus } from "@zella/db";
import { updateFeedbackStatus } from "./actions";

const STATUS_OPTIONS: FeedbackStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function FeedbackModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: FeedbackStatus = STATUS_OPTIONS.includes(rawStatus as FeedbackStatus)
    ? (rawStatus as FeedbackStatus)
    : "PENDING";

  const feedback = await prisma.feedback.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Feedback</h1>

      <div className="mt-4 flex gap-1 rounded-lg border border-neutral-200 bg-white p-1 w-fit">
        {STATUS_OPTIONS.map((s) => (
          <a
            key={s}
            href={`/admin/feedback?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              status === s ? "bg-cherry text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {feedback.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nothing here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    {"★".repeat(f.rating)}
                    {"☆".repeat(5 - f.rating)}
                  </p>
                  <p className="mt-2 text-sm">{f.message}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {f.name || "Anonymous"}
                    {f.email ? ` · ${f.email}` : ""}
                    {f.orderNumber ? ` · Order ${f.orderNumber}` : ""}
                    {" · "}
                    {f.createdAt.toLocaleString()}
                  </p>
                </div>
                {status === "PENDING" && (
                  <div className="flex gap-2">
                    <form action={updateFeedbackStatus.bind(null, f.id)}>
                      <input type="hidden" name="status" value="APPROVED" />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-lg bg-cherry px-4 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={updateFeedbackStatus.bind(null, f.id)}>
                      <input type="hidden" name="status" value="REJECTED" />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
