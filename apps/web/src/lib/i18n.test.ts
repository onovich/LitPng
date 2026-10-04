import { describe, expect, it } from "vitest";
import { detectLanguage, nextLanguage, normalizeLanguage, translateHeading, localizedImageError, translations, languages } from "./i18n";

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

describe("localized image errors", () => {
  it("maps worker, mode, timeout, canvas and decode failures in every language", () => {
    for (const { code } of languages) {
      const t = translations[code];
      expect(localizedImageError("Lossless mode currently supports PNG inputs only.", t)).toBe(t.losslessPngOnly);
      expect(localizedImageError("Image worker failed. Retry this image.", t)).toBe(t.workerError);
      expect(localizedImageError("Image processing interrupted.", t)).toBe(t.processingInterrupted);
      expect(localizedImageError("Image processing timed out after 120 seconds. Retry this image.", t)).toBe(t.processingTimeout);
      expect(localizedImageError("Canvas context is unavailable.", t)).toBe(t.canvasError);
      expect(localizedImageError("The source image could not be decoded.", t)).toBe(t.imageDecodeError);
      expect(localizedImageError("Unknown codec error 123", t)).toBe(t.processingError);
      expect(localizedImageError("Unknown codec error 123", t, "preview")).toBe(t.previewError);
      if (code !== "en") expect(t.processingError).not.toBe(translations.en.processingError);
    }
  });
});
