# LittlePNG 研发计划

日期：2026-05-31

## 1. 研发目标

LittlePNG 的研发目标不是单纯实现压缩算法，而是构建一个能支撑 SEO 获客和付费工作流的本地批量图片处理产品。

第一年研发目标：

- 浏览器内完成 PNG/JPG/WebP 批量处理。
- 图片默认不上传服务器。
- 支持压缩、重命名、resize、crop、convert、ZIP 导出。
- 通过 SEO 页面直接进入对应工具 preset。
- 预留桌面版、CLI、插件和 API 的演进空间。

## 2. 技术原则

### 2.1 本地优先

默认所有图片处理都在浏览器本地完成。

好处：

- 隐私卖点强。
- 服务器成本低。
- 免费工具可长期存在。

代价：

- 大图和大批量受浏览器内存限制。
- 移动端性能有限。
- WASM 包体和加载体验需要优化。

### 2.2 Worker 优先

所有重计算都必须放在 Web Worker 中。

包括：

- 解码。
- resize/crop。
- 编码。
- 压缩。
- ZIP 生成。

主线程只负责：

- UI 状态。
- 预览。
- 用户输入。
- 任务队列调度。

### 2.3 按需加载

不同格式的 WASM 编码器必须懒加载。

例如：

- PNG 用户不加载 MozJPEG。
- JPG 用户不加载 PNG quantization。
- WebP/AVIF 后续按需加载。

### 2.4 工作流优先于算法炫技

用户购买的是省时间，不是算法名。

优先级：

1. 任务能稳定完成。
2. 批量操作顺。
3. 输出结果可控。
4. 压缩率和画质优秀。
5. 算法选项丰富。

## 3. 推荐技术栈

### 3.1 Web 应用

推荐：

- Vite。
- React 或 Svelte。
- TypeScript。
- Web Workers。
- WASM codecs。
- JSZip 或 fflate。
- IndexedDB 用于临时任务状态和未来历史记录。

React 优势：

- 生态成熟。
- 后续桌面版 Electron/Tauri UI 复用容易。
- SEO 页面可用 Astro/Next 组合。

如果目标是更轻、更快的静态 SEO 站：

- Astro + React islands 是很好的选择。
- 工具核心作为独立 package，被各 SEO 页面复用。

建议架构：

```text
apps/web
packages/core
packages/codecs
packages/worker
packages/seo-content
```

MVP 可以先单仓单应用，但代码边界要按上述模块设计。

### 3.2 编码器和图像处理

PNG：

- PNG decode：浏览器 `createImageBitmap` / canvas，或专门 PNG decoder。
- PNG lossy：libimagequant / imagequant WASM。
- PNG encode：UPNG.js、pngenc 或 WASM encoder。
- PNG lossless：oxipng WASM。

JPG：

- MozJPEG WASM。

WebP：

- 浏览器 canvas encode 可作为早期方案。
- 高级版本可引入 libwebp WASM。

Resize/Crop：

- MVP 可用 Canvas / OffscreenCanvas。
- 后续可考虑 pica 或 WASM resize。

ZIP：

- fflate 优先，性能和包体较好。

### 3.3 SEO 和站点

SEO 页面需要 SSR/静态生成。

推荐：

- Astro：适合静态工具站和内容页。
- Next.js：适合后续账号、订阅、dashboard。

如果先追求速度，建议用 Astro：

- 静态页面多。
- 首屏轻。
- 工具应用作为 island 加载。
- WASM 延迟加载。

## 4. 系统架构

### 4.1 前端模块

```text
UI Layer
- Dropzone
- File list
- Preview
- Rename panel
- Resize/Crop panel
- Format panel
- Compression panel
- Export panel

Workflow Layer
- Job queue
- Preset engine
- Filename engine
- Progress model
- Error model

Worker Layer
- Decode worker
- Transform worker
- Encode worker
- Zip worker

Codec Layer
- PNG codec
- JPEG codec
- WebP codec
- OxiPNG/ImageQuant bindings

SEO Layer
- Landing pages
- FAQ content
- Structured data
- Tool presets per route
```

### 4.2 任务模型

每个文件进入队列后成为一个 `ImageJob`：

```ts
type ImageJob = {
  id: string;
  sourceFile: File;
  sourceName: string;
  sourceSize: number;
  sourceType: string;
  status: "queued" | "decoding" | "transforming" | "encoding" | "done" | "failed" | "cancelled";
  settings: ImageSettings;
  result?: ImageResult;
  error?: string;
};
```

每个任务只在需要时持有像素数据。完成编码后释放 decode buffer。

### 4.3 内存策略

关键规则：

- 不同时解码全部图片。
- 默认并发：桌面 2，移动 1。
- 用户可手动提高并发，但要提示内存风险。
- 大于 50MP 的图片提示风险。
- 每张图处理完成后释放 canvas、bitmap、ArrayBuffer 引用。
- 预览图使用缩略图，不使用原图大 buffer。

### 4.4 错误策略

常见错误：

- 图片损坏。
- 浏览器内存不足。
- WASM 加载失败。
- 编码器不支持输入格式。
- 输出体积无法达到目标大小。

处理方式：

- 单文件失败不阻断整个队列。
- 文件级错误清楚展示。
- 可重试。
- 可跳过。
- 对目标体积失败给出最接近结果。

## 5. MVP 功能规格

### 5.1 导入

必须支持：

- 拖拽多文件。
- 文件选择器。
- PNG/JPG/JPEG/WebP 输入。

优先支持：

- 文件夹拖拽。
- 保留相对路径。

### 5.2 批量重命名

MVP 支持：

- 保留原名。
- 转小写。
- 空格转短横线。
- 移除特殊字符。
- 添加前缀。
- 添加后缀。
- 自动序号。
- 扩展名跟随输出格式。

模板：

```text
{original}
{original}-{index}
{prefix}-{index}
{folder}-{original}
{width}x{height}-{original}
```

后续支持：

- 查找替换。
- 日期变量。
- 产品字段 CSV 映射。

### 5.3 Resize

MVP 支持：

- 最大宽度。
- 最大高度。
- 指定宽高。
- 保持比例。
- 不放大小图。

Preset：

- 1600px website。
- 1200px blog。
- 2048px product。
- 1200x630 Open Graph。

### 5.4 Crop

MVP 采用克制版本：

- Fit：完整保留，可能留边。
- Fill：填满目标尺寸，可能裁剪。
- Crop：按比例裁剪。
- Anchor：center / top / bottom / left / right。
- 背景：transparent / white / custom color。

不在 MVP 做：

- 智能主体识别。
- 人脸检测。
- 每张图复杂手动裁剪。

### 5.5 Compress

PNG：

- Lossy palette compression。
- 保留透明。
- 可选更强 lossless pass。

JPG：

- 质量滑杆。
- Progressive。
- Metadata stripping。

通用：

- 高质量 / 平衡 / 最小体积 preset。
- 显示节省百分比。
- 显示输出格式。

### 5.6 Convert

MVP 支持：

- 保持原格式。
- 输出 JPG。
- 输出 PNG。
- 输出 WebP。

后续：

- AVIF。
- SVG raster input。

### 5.7 Export

MVP 支持：

- 单文件下载。
- 全部 ZIP 下载。
- 保留文件夹结构。
- 冲突文件名自动处理。

后续：

- 导出报告 CSV。
- 保存任务 preset。

## 6. 研发阶段

### 阶段 A：技术原型

时间：第 1-2 周

目标：

- 验证核心编码链路。
- 验证浏览器内大图处理性能。

任务：

- 建立 Vite/Astro 原型。
- 实现单张 PNG/JPG decode -> encode。
- 接入 MozJPEG WASM。
- 接入 PNG 量化或临时 PNG encode 方案。
- Worker 跑通。
- 测试 1MB、5MB、20MB、50MB 图片。

验收：

- 单张 PNG/JPG 可压缩并下载。
- UI 不阻塞。
- 失败可捕获。
- 能记录处理耗时和内存风险。

### 阶段 B：批量工作流 MVP

时间：第 3-6 周

目标：

- 实现可公开使用的批量工具。

任务：

- 多文件队列。
- 并发控制。
- 批量重命名。
- resize。
- crop。
- format output。
- ZIP 导出。
- 结果列表。
- 隐私说明。

验收：

- 100 张中等图片可稳定处理。
- 失败文件不影响整体。
- ZIP 命名正确。
- 移动端至少能处理小批量。

### 阶段 C：SEO MVP

时间：第 5-8 周

目标：

- 让工具能通过多个搜索页面进入。

任务：

- 静态 SEO 页面。
- 每个页面设置默认 preset。
- FAQ schema。
- Open Graph。
- sitemap。
- robots。
- Search Console。
- Analytics。
- 错误监控。

验收：

- 10-20 个页面上线。
- Lighthouse 性能不被 WASM 首屏拖垮。
- 页面可被爬虫读取主内容。
- 工具可延迟加载。

### 阶段 D：留存和转化

时间：第 2-4 个月

目标：

- 增强重复使用价值。

任务：

- 保存 presets。
- 目标体积压缩。
- 高级 rename templates。
- 压缩报告。
- 文件夹结构。
- 对比预览。
- Waitlist / email capture。

验收：

- 用户可保存并复用一套处理规则。
- 关键功能埋点可分析。
- 有清晰 Pro/桌面版需求信号。

### 阶段 E：付费产品

时间：第 4-6 个月

目标：

- 上线第一条收入线。

二选一：

- Web Pro。
- Desktop Pro。

Web Pro 任务：

- 账号。
- 支付。
- Pro 权限。
- Preset 云同步。
- 无广告。

Desktop Pro 任务：

- Tauri/Electron 壳。
- 文件系统访问。
- 离线处理。
- 许可证验证。
- 自动更新。

验收：

- 支付闭环可用。
- 付费功能明确解决高频痛点。
- 退款和客服路径明确。

## 7. 测试计划

### 7.1 单元测试

覆盖：

- 文件名清理。
- 命名模板。
- 重名处理。
- resize/crop 参数计算。
- output path 生成。
- preset merge。

### 7.2 集成测试

覆盖：

- 单张 PNG。
- 单张 JPG。
- 混合格式批量。
- ZIP 导出。
- 文件夹结构。
- 失败任务。

### 7.3 视觉和质量测试

需要测试图片集：

- 透明 PNG。
- 截图 PNG。
- 商品白底图。
- 人像 JPG。
- 大尺寸相机照片。
- 带 EXIF 图片。
- 小图标。
- 已压缩图片。

指标：

- 输出是否损坏。
- 透明是否保留。
- 文件体积是否下降。
- 肉眼质量是否可接受。
- 颜色是否明显偏移。

### 7.4 性能测试

场景：

- 10 张图。
- 100 张图。
- 单张 20MB。
- 单张超高分辨率。
- 移动端。

指标：

- 首次可交互时间。
- WASM 加载时间。
- 单张处理耗时。
- 批量处理耗时。
- 主线程阻塞。
- 内存峰值。
- 失败率。

## 8. 安全与隐私

必须明确：

- 默认不上传图片。
- 本地处理的边界。
- 如果未来有 API/云端压缩，必须单独标识。

隐私实现：

- 不采集文件名原文，除非用户明确允许。
- 不上传图片内容。
- 埋点只记录聚合事件，例如文件数量、格式、是否成功、总节省比例区间。
- 错误日志不包含图片数据。

## 9. 法务和许可证

研发前必须列清：

- libimagequant 许可证。
- MozJPEG 许可证。
- oxipng 许可证。
- libwebp 许可证。
- ZIP 库许可证。
- UI 库许可证。

特别注意：

- libimagequant 为 GPLv3-or-later 或商业许可路径。
- 如果 LittlePNG 闭源并商业化，需要购买商业授权或选择兼容方案。
- 如果 Web app 开源，需要确认是否接受 GPL 传染性约束。

## 10. 研发风险

### WASM 包体过大

对策：

- 按格式拆包。
- 懒加载。
- CDN cache。
- 首屏先显示 UI，用户选图后再加载 codec。

### 浏览器内存不足

对策：

- 队列串行/低并发。
- 缩略图和源文件分开。
- 处理完立刻释放。
- 大图提示。

### PNG 质量不可控

对策：

- 提供预览对比。
- 默认保守参数。
- 给透明图和截图单独 preset。

### 目标体积压缩慢

对策：

- 用二分质量搜索。
- 限制尝试次数。
- 显示“最接近结果”。

### SEO 页面拖慢

对策：

- 工具 island 懒加载。
- WASM 不进首屏 bundle。
- 静态 HTML 保留完整可读内容。

## 11. 团队配置建议

单人/小团队 MVP：

- 1 名前端全栈。
- 1 名设计/产品兼职。
- 1 名 SEO 内容兼职。

理想配置：

- 前端工程师：工具和 Worker。
- 图像/WASM 工程师：codec 和性能。
- SEO/内容：页面矩阵。
- 设计/产品：批量工作流 UX。

## 12. 下一步研发动作

建议按这个顺序开始：

1. 建立 Web 项目骨架。
2. 做单张 JPG MozJPEG WASM 原型。
3. 做单张 PNG 原型并确认授权方案。
4. 做 Worker 队列。
5. 加入批量重命名。
6. 加入 resize/crop。
7. 加入 ZIP 导出。
8. 搭第一批 SEO 页面。
9. 上线免费 MVP。
10. 根据真实使用数据决定 Pro、桌面版或 CLI 的优先级。

## 13. pngquant / libimagequant 选择

根据 pngquant 官方页面和 LittlePNG 的浏览器优先规划，底层 PNG 有损量化不下载 pngquant CLI 二进制，而选择 `libimagequant` 的 Rust 库路线：

```toml
imagequant = { version = "4.0", default-features = false }
```

理由：

- pngquant CLI 更适合命令行和服务端，不适合作为浏览器批量任务队列的核心接口。
- 官方 `libimagequant` 是底层 RGBA -> 8-bit palette quantization 库，正好对应 LittlePNG 的 codec boundary。
- `libimagequant` 不负责 PNG decode/encode，因此 LittlePNG 仍需独立实现 decode、encode、worker queue 和 ZIP export。
- WASM 构建应关闭默认 feature，避免默认线程特性带来的浏览器兼容和构建复杂度。
- 授权上要特别注意 GPLv3+ / commercial license。闭源商业化前必须确认商业授权或替换依赖。

当前研发落点：

- `packages/pngquant-wasm` 锁定并下载 `imagequant = "4.0"`。
- Phase 1 先用浏览器 Canvas/OffscreenCanvas 建立可运行的批量处理链路。
- Phase 2 把 PNG 临时编码路径替换为 `imagequant` WASM quantization + PNG encoder。

详细决策见 `docs/pngquant-library-decision.md`。
