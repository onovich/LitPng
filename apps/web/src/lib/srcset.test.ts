import { describe, expect, it } from "vitest";
import { responsiveImages, srcsetMarkup } from "./srcset";
import type { ImageJob } from "./types";

function job(width: number, overrides: Partial<ImageJob> = {}): ImageJob {
  return {
    id: `one-${width}`, sourceGroupId: "one", sourceName: "photo.png", file: new File([], "photo.png"),
    sourceType: "image/png", sourceSize: 1000, outputName: `photo-${width}.png`,
    status: "done", progress: 100, variantWidth: width,
    result: {
      name: `photo-${width}.png`, archivePath: `folder/photo-${width}.png`, blob: new Blob([]),
      type: "image/png", width, height: width / 2, size: width, durationMs: 1,
      qualityUsed: 0.8, encodeAttempts: 1, outcome: "transformed"
    }, ...overrides
  };
}

describe("responsive image export", () => {
  it("uses actual dimensions, sorts and deduplicates by smallest output", () => {
    const large = job(512, { variantWidth: 1024 });
    const duplicate = { ...large, result: { ...large.result!, archivePath: "smaller.png", size: 100 } };
    const groups = responsiveImages([large, job(128), job(256), duplicate]);
    expect(groups).toHaveLength(1);
    expect(groups[0].candidates.map((item) => item.width)).toEqual([128, 256, 512]);
    const markup = srcsetMarkup(groups);
    expect(markup).toContain('src="./smaller.png"');
    expect(markup).toContain('./smaller.png 512w');
    expect(markup).not.toContain('1024w');
    expect(markup).toContain('width="512"\n  height="256"');
    expect(markup).toContain('sizes="100vw"');
  });

  it("excludes unfinished, invalid and single-size jobs", () => {
    const good = job(128);
    const invalid = { ...good, result: { ...good.result!, width: 0 } };
    expect(responsiveImages([
      job(128, { status: "failed" }), job(128, { status: "processing" }),
      job(128, { status: "cancelled" }), job(128, { variantWidth: undefined }),
      job(128, { result: undefined }), invalid
    ])).toEqual([]);
    expect(srcsetMarkup([])).toBe("");
  });

  it("keeps original imports and actual formats separate", () => {
    const jpeg = job(256);
    jpeg.result = { ...jpeg.result!, type: "image/jpeg", archivePath: "photo.jpg" };
    expect(responsiveImages([job(128), jpeg, job(128, { sourceGroupId: "two" })])).toHaveLength(3);
  });

  it("encodes archive path segments and escapes HTML attributes", () => {
    const source = job(128);
    source.result = { ...source.result!, archivePath: '图 片/a,b?#%&".png' };
    const markup = srcsetMarkup(responsiveImages([source]), '" onload="alert(1)<>&');
    expect(markup).toContain('./%E5%9B%BE%20%E7%89%87/a%2Cb%3F%23%25%26%22.png 128w');
    expect(markup).toContain('sizes="&quot; onload=&quot;alert(1)&lt;&gt;&amp;"');
    expect(markup).toContain('alt=""');
  });

  it("uses a relative URL even for scheme-like names and defaults blank sizes", () => {
    const source = job(128);
    source.result = { ...source.result!, archivePath: 'data:photo.png' };
    expect(srcsetMarkup(responsiveImages([source]), "  ")).toContain('src="./data%3Aphoto.png"');
    expect(srcsetMarkup(responsiveImages([source]), "  ")).toContain('sizes="100vw"');
  });

  it("does not mutate completed artifacts or candidate ordering", () => {
    const jobs = [job(256), job(128)];
    const before = jobs.map((item) => item.result);
    responsiveImages(jobs);
    expect(jobs.map((item) => item.result)).toEqual(before);
  });
});
