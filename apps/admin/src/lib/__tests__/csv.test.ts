import { describe, it, expect } from "vitest";
import { escapeCsvField, toCsvRow } from "../csv";

describe("escapeCsvField", () => {
  it("returns a plain value unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("quotes a value containing a comma", () => {
    expect(escapeCsvField("Lahore, Punjab")).toBe('"Lahore, Punjab"');
  });

  it("quotes and doubles embedded quotes", () => {
    expect(escapeCsvField('She said "hi"')).toBe('"She said ""hi"""');
  });

  it("quotes a value containing a newline", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsvRow", () => {
  it("joins fields with commas, escaping as needed", () => {
    expect(toCsvRow(["a", "b, c", "d"])).toBe('a,"b, c",d');
  });
});
