import type { Metadata } from "next";
import { toDisplayUnits } from "@zella/core/units";

export const metadata: Metadata = { title: "Size chart — Zella" };

// Same measurements as storefront-1's cm chart (PLACEHOLDER — generic
// relaxed-fit womenswear, see PLACEHOLDER_DATA.md), shown in inches per this
// design's own "Inches" convention, S/M only.
const SHIRT_CM = {
  Chest: { S: 96, M: 100 },
  Waist: { S: 78, M: 82 },
  Hip: { S: 102, M: 106 },
  Length: { S: 67, M: 68 },
};
const TROUSER_CM = {
  Waist: { S: 78, M: 82 },
  Hip: { S: 102, M: 106 },
  Inseam: { S: 74, M: 75 },
};

function Table({ rows }: { rows: Record<string, { S: number; M: number }> }) {
  return (
    <table className="table" style={{ marginBottom: 46 }}>
      <thead>
        <tr>
          <th>Measurement</th>
          <th style={{ textAlign: "right" }}>Small</th>
          <th style={{ textAlign: "right" }}>Medium</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(rows).map(([label, { S, M }]) => (
          <tr key={label}>
            <td>{label}</td>
            <td style={{ textAlign: "right" }}>{toDisplayUnits(S, "in")}&Prime;</td>
            <td style={{ textAlign: "right" }}>{toDisplayUnits(M, "in")}&Prime;</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SizeGuidePage() {
  return (
    <section className="container-narrow" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">Inches</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 12px" }}>Size chart</h1>
      <p style={{ maxWidth: "50ch", margin: "0 0 42px", fontSize: 15, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        Small and Medium. Measurements may vary slightly by &plusmn;0.5 inch.
      </p>
      <h2 style={{ fontSize: 22, margin: "0 0 14px" }}>Shirt</h2>
      <Table rows={SHIRT_CM} />
      <h2 style={{ fontSize: 22, margin: "0 0 14px" }}>Trouser</h2>
      <Table rows={TROUSER_CM} />
    </section>
  );
}
