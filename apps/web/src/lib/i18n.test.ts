import { describe, expect, it } from "vitest";
import { detectLanguage, nextLanguage, normalizeLanguage, translateHeading } from "./i18n";

describe("i18n helpers", () => {
  it("normalizes supported browser language tags", () => {
    expect(normalizeLanguage("zh-CN")).toBe("zh");
    expect(normalizeLanguage("ru-RU")).toBe("ru");
    expect(normalizeLanguage("ja-JP")).toBe("ja");
    expect(normalizeLanguage("es-MX")).toBe("es");
    expect(normalizeLanguage("pt-BR")).toBe("pt-BR");
    expect(normalizeLanguage("en-US")).toBe("en");
  });

  it("detects the first supported browser language", () => {
    expect(detectLanguage(["fr-FR", "pt-BR", "en-US"])).toBe("pt-BR");
    expect(detectLanguage(["fr-FR"])).toBe("en");
  });

  it("cycles through language options", () => {
    expect(nextLanguage("en")).toBe("zh");
  });

  it("translates known headings", () => {
    expect(translateHeading("PNG Compressor", "zh")).toBe("PNG 压缩");
    expect(translateHeading("Unknown", "zh")).toBe("Unknown");
  });
});
