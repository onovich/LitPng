# LitPng

[English](README.md)

浏览器本地批量压缩、改名、缩放、裁切和转换图片的工具。

![LitPng 封面](docs/cover.png)

## 项目包含什么

- 全部处理在浏览器本地完成。
- 批量完成图片转换、改名和导出。
- 有损 PNG 使用 Rust `imagequant` WASM，输出带调色板透明度的索引 PNG。
- 无损 PNG 使用 `@jsquash/png`，JPEG 使用 `@jsquash/jpeg` 中的 MozJPEG。
- 包含最低质量、无损回退和不增大文件的原图保留策略。
- 支持通过有界质量搜索设置单图目标体积。

## 快速开始

需要 Node.js 22.12+ 和 npm 9.6.5+。安装依赖并启动本地版本：

```bash
npm install
npm run dev
```

## 验证

```bash
npm run validate
npm run test:e2e
npm run audit:prod
npm run benchmark:codecs
```

可通过 `npm run benchmark:fetch-corpus` 单独获取经校验和锁定的真实图片语料。基准会记录压缩率、浏览器处理耗时、编码器/回退选择以及解码后 PSNR，详见
[`docs/codec-benchmark-baseline.md`](docs/codec-benchmark-baseline.md)。

Rust 与 WASM 编码器命令：

```bash
npm run codec:check
npm run codec:test
npm run codec:build-wasm
```

## 仓库结构

- `apps/web/` — Astro、React 前端及浏览器 Worker。
- `packages/pngquant-wasm/` — `imagequant` 的 Rust/WASM 边界。
- `tests/` — 浏览器编码器、SEO 和基准测试。
- `research/` — 研究记录与授权语料审查。
- `docs/` — 产品、架构、编码器和工作流文档。

## 文档

- [`docs/commercial-roadmap.md`](docs/commercial-roadmap.md)
- [`docs/phase0-architecture.md`](docs/phase0-architecture.md)
- [`docs/pngquant-library-decision.md`](docs/pngquant-library-decision.md)
- [`docs/licensing-release-gate.md`](docs/licensing-release-gate.md)
- [`docs/project-lessons.md`](docs/project-lessons.md)

## 当前状态

仓库已包含自动化测试、浏览器端实际编码 E2E、可重复编码基准和发布许可门。

## 许可证

当前仓库未包含开源许可证。所选 `imagequant` 依赖要求在发布前明确选择 GPL 兼容或商业授权策略；发布自动化必须通过 `npm run release:license-check`。
