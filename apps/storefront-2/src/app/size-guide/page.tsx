import type { Metadata } from "next";

export const metadata: Metadata = { title: "Size chart — Zella" };

// Real Zella garment-spec measurements (inches), S/M only — matches the
// brand's own size chart reference exactly.
const SHIRT_IN: Record<string, { S: string; M: string }> = {
  "Front Length": { S: "28", M: "28" },
  "Back Length": { S: "29", M: "29" },
  Shoulder: { S: "19", M: "21" },
  Chest: { S: "21", M: "23" },
  "Arm Hole": { S: "9", M: "10.5" },
  "Sleeve Length (Including Cuffs)": { S: "22", M: "22" },
  "Cuff Breadth": { S: "3", M: "3" },
  "Cuff Length": { S: "10.5", M: "11.5" },
  Collar: { S: "16", M: "17" },
};
const TROUSER_IN: Record<string, { S: string; M: string }> = {
  Waist: { S: "29–31", M: "31–33" },
  Length: { S: "37", M: "37" },
  "Bottom Width": { S: "11", M: "11" },
};

function Table({ rows }: { rows: Record<string, { S: string; M: string }> }) {
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
            <td style={{ textAlign: "right" }}>{S}&Prime;</td>
            <td style={{ textAlign: "right" }}>{M}&Prime;</td>
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
      <Table rows={SHIRT_IN} />
      <h2 style={{ fontSize: 22, margin: "0 0 14px" }}>Trouser</h2>
      <Table rows={TROUSER_IN} />
    </section>
  );
}
