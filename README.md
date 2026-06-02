# LittlePNG

LittlePNG is a local-first batch image preparation tool for compressing, renaming, resizing, cropping, converting, and exporting image files in the browser.<br/>**LittlePNG 是一个本地优先的批量图片处理工具，用于在浏览器内压缩、重命名、缩放、裁剪、转换并导出图片文件。**

The project is currently a Web MVP built with Astro, React, TypeScript, browser workers, WASM image encoders, and a Rust `imagequant` codec package scaffold.<br/>**当前项目是一个 Web MVP，使用 Astro、React、TypeScript、浏览器 Worker、WASM 图片编码器，以及 Rust `imagequant` 编码包脚手架构建。**

## Features

- Batch queue for PNG, JPG, and WebP files, with per-file status and ZIP export.<br/>**支持 PNG、JPG、WebP 文件的批量队列、逐文件状态展示和 ZIP 导出。**
- Rename patterns with original name, prefix, suffix, folder name, and index options.<br/>**支持基于原始文件名、前缀、后缀、文件夹名和序号的批量重命名规则。**
- Lossless and lossy modes, with lossless mode currently constrained to PNG input and PNG output.<br/>**支持无损和有损模式，其中无损模式当前约束为 PNG 输入和 PNG 输出。**
- Estimated visual loss feedback that reacts to format, quality, resize, and crop settings.<br/>**提供预计视觉损失提示，会根据格式、质量、缩放和裁剪设置实时变化。**
- Browser-local processing: image bytes stay on the user's machine for the Web MVP.<br/>**浏览器本地处理：在 Web MVP 阶段，图片字节保留在用户本机。**
- Runtime language switching for English, Chinese, Russian, Japanese, Spanish, and Brazilian Portuguese.<br/>**支持运行时语言切换：英文、中文、俄文、日文、西班牙文和巴西葡萄牙文。**

## Current Status

PNG, JPG, and WebP browser output currently uses the web worker pipeline and `@jsquash/jpeg` / `@jsquash/png` encoders.<br/>**PNG、JPG 和 WebP 的浏览器输出当前使用 Web Worker 管线以及 `@jsquash/jpeg` / `@jsquash/png` 编码器。**

The Rust package in `packages/pngquant-wasm` exposes an `imagequant` adapter and verifies WASM compilation, but the full browser PNG path has not yet been wired as `RGBA -> imagequant -> indexed PNG encode`.<br/>**`packages/pngquant-wasm` 中的 Rust 包已经暴露 `imagequant` 适配器并验证 WASM 编译，但完整浏览器 PNG 链路尚未接成 `RGBA -> imagequant -> indexed PNG encode`。**

When a same-format, no-transform encode result is larger than the original, LittlePNG keeps the original bytes instead of downloading a larger file.<br/>**当同格式且无像素变换的重新编码结果大于原图时，LittlePNG 会保留原始字节，而不是下载更大的文件。**

## Repository Layout

- `apps/web` - Astro and React frontend application.<br/>**`apps/web` - Astro 与 React 前端应用。**
- `apps/web/src/workers` - Browser worker image processing pipeline.<br/>**`apps/web/src/workers` - 浏览器 Worker 图片处理管线。**
- `apps/web/src/lib` - Pure TypeScript helpers for filenames, queueing, i18n, processing policy, geometry, and ZIP export.<br/>**`apps/web/src/lib` - 文件名、队列、国际化、处理策略、几何计算和 ZIP 导出的纯 TypeScript 辅助模块。**
- `packages/pngquant-wasm` - Rust/WASM boundary for the selected `imagequant` dependency.<br/>**`packages/pngquant-wasm` - 所选 `imagequant` 依赖的 Rust/WASM 边界。**
- `docs` - Business plan, roadmap, architecture rules, codec decision notes, and project lessons.<br/>**`docs` - 商业计划、路线图、架构规则、编码器决策记录和项目经验文档。**

## Requirements

- Node.js and npm for the web workspace.<br/>**需要 Node.js 和 npm 来运行 Web 工作区。**
- Rust and Cargo for the `packages/pngquant-wasm` package.<br/>**需要 Rust 和 Cargo 来运行 `packages/pngquant-wasm` 包。**
- The Rust target `wasm32-unknown-unknown` must be available for `npm run codec:build-wasm`.<br/>**若要执行 `npm run codec:build-wasm`，需要可用的 Rust 目标 `wasm32-unknown-unknown`。**

## Development

Install dependencies from the repository root.<br/>**在仓库根目录安装依赖。**

```powershell
npm install
```

Start the local development server.<br/>**启动本地开发服务器。**

```powershell
npm run dev
```

Build the static web app.<br/>**构建静态 Web 应用。**

```powershell
npm run build
```

Preview the built app.<br/>**预览已构建的应用。**

```powershell
npm run preview
```

## Validation

Run the main frontend validation gates.<br/>**运行主要前端验证门。**

```powershell
npm run test
npm run typecheck
npm run build
```

Run the Rust and WASM codec checks.<br/>**运行 Rust 与 WASM 编码器检查。**

```powershell
npm run codec:check
npm run codec:test
npm run codec:build-wasm
```

For manual browser smoke testing on Windows, double-click `ManualSmoke.cmd` from the repository root.<br/>**在 Windows 上进行手动浏览器 smoke 测试时，可在仓库根目录双击 `ManualSmoke.cmd`。**

## Architecture Rules

The primary product flow is `Import -> Plan -> Rename -> Transform -> Encode -> Export`.<br/>**主要产品流程是 `Import -> Plan -> Rename -> Transform -> Encode -> Export`。**

UI components orchestrate state and interactions, workers own heavy image processing, and codec internals stay behind stable adapter boundaries.<br/>**UI 组件负责状态和交互编排，Worker 负责重型图片处理，编码器内部实现保留在稳定适配器边界之后。**

Before changing core behavior, read `docs/phase0-architecture.md` and `docs/project-lessons.md`.<br/>**修改核心行为前，请先阅读 `docs/phase0-architecture.md` 和 `docs/project-lessons.md`。**

## Licensing Note

The selected `imagequant` line is license-sensitive: `libimagequant` is available under GPL-compatible terms for Free/Libre Open Source Software and also offers commercial licensing.<br/>**所选 `imagequant` 技术线涉及许可风险：`libimagequant` 对自由/开源软件提供 GPL 兼容授权，同时也提供商业授权。**

Before shipping a closed-source commercial product with this codec path, confirm the license strategy in `docs/pngquant-library-decision.md`.<br/>**在使用该编码器路径发布闭源商业产品前，请根据 `docs/pngquant-library-decision.md` 确认许可策略。**
