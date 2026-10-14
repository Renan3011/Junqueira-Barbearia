import { describe, expect, it } from "vitest";
import { normalizePhone } from "./phone.js";

describe("telefone", () => {
  it("normaliza número brasileiro", () => expect(normalizePhone("(43) 99147-5674")).toBe("+5543991475674"));
  it("aceita número internacional", () => expect(normalizePhone("+1 202-555-0125")).toBe("+12025550125"));
  it("rejeita número curto, letras e mais de 15 dígitos", () => { expect(normalizePhone("9914")).toBeNull(); expect(normalizePhone("abc 99147")).toBeNull(); expect(normalizePhone("+5512345678901234")).toBeNull(); });
});
