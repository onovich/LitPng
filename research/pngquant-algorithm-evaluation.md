# pngquant / libimagequant 算法评估

日期：2026-07-27

## 结论

pngquant（核心库为 libimagequant）具有明显但有条件的优势：

- 当输出必须保持 PNG、允许轻微视觉损失，且素材属于截图、UI、图标、插画或透明网页素材时，它通常是很有竞争力的方案。
- 它的主要收益并非来自更强的 DEFLATE，而是把 24/32 位真彩 RGBA 图像量化成最多 256 色的 8 位索引图，再交给 PNG 编码器压缩。
- 它不是所有图片格式和内容上的全局最优算法。照片、细腻渐变、噪点丰富图像和必须逐像素一致的素材不应默认使用。
- OxiPNG 与 pngquant 不是同类替代品：pngquant 是有损颜色量化，OxiPNG 是 PNG 无损优化。合理链路是先量化，再对生成的索引 PNG 做无损优化。
- 对 LittlePNG，建议将其定位为“PNG 有损兼容模式”，而不是所有图片的统一默认压缩内核。

## 1. 它实际做什么

pngquant 是命令行工具；真正负责调色板生成和像素重映射的是 libimagequant。

libimagequant 接收 RGBA 原始像素，生成：

- 最多 256 个 RGBA 调色板颜色；
- 每像素一个字节的调色板索引；
- 量化质量结果。

它本身不负责 PNG 解码或最终 PNG 编码，因此完整管线是：

```text
PNG decode
  -> RGBA
  -> libimagequant palette quantization
  -> indexed pixels + RGBA palette
  -> indexed PNG encode
  -> optional lossless PNG optimization
```

来源：

- [libimagequant 官方 API：只处理原始像素，不负责 PNG 压缩](https://pngquant.org/lib/)
- [libimagequant 官方仓库：RGBA 转为带 Alpha 的 8 位索引图](https://github.com/ImageOptim/libimagequant)
- [pngquant 官方说明](https://pngquant.org/)

## 2. 算法为什么优于普通颜色量化

官方算法说明显示，pngquant 并非只运行一次传统 Median Cut，而是在其上增加多层感知优化：

1. 使用修改版 Median Cut，以降低颜色相对中值的方差为目标选择分割区域。
2. 构建带基础感知模型的颜色直方图，降低噪声区域的权重。
3. 反复调整未被良好表示颜色的权重，过程类似梯度下降。
4. 使用 Voronoi/K-means 迭代修正最终颜色，使调色板达到局部最优。
5. 在预乘 Alpha 色彩空间处理透明度，避免透明像素中的不可见 RGB 过度占用调色板。
6. 仅在适合的平坦区域使用误差扩散，并避免在边缘和无需抖动的区域增加噪点。

这使它相较简单 Median Cut、固定调色板或无条件 Floyd-Steinberg 抖动，更有机会在相同颜色数量下保留视觉质量，尤其适用于带透明边缘的网页素材。

来源：[pngquant 官方算法说明](https://pngquant.org/)

## 3. 压缩率优势从哪里来

普通 RGBA PNG 的原始像素表示可视为每像素 32 位；索引 PNG 的像素索引最多每像素 8 位，另加一个最多 256 项的调色板。对适合量化的图片，这会在进入 PNG 过滤和熵编码前就显著减少信息量。

pngquant 官方称常见输出可比 24/32 位 PNG 小 60%–80%，官网示例为约 70% 级别。但这是项目方自己的概括和示例，不应当作 LittlePNG 用户素材上的保证。

来源：

- [pngquant 官方仓库说明](https://github.com/kornelski/pngquant)
- [pngquant 官网示例](https://pngquant.org/)

相比之下，OxiPNG 的定位是无损 PNG/APNG 优化，通过过滤、重编码和可选 metadata 处理改善现有 PNG；它不能通过丢弃颜色信息获得 pngquant 这种量级的收益。OxiPNG 官方也明确将自己描述为无损优化器。

来源：[OxiPNG 官方仓库](https://github.com/oxipng/oxipng)

## 4. 适合与不适合的内容

### 很适合

- UI 截图；
- 图标、Logo、扁平插画；
- 颜色种类有限的透明 PNG；
- 网页装饰素材；
- 必须输出 PNG、同时允许轻微视觉损失的内容。

这些图片通常具有重复颜色、大面积平坦区域或对透明度兼容要求，索引 PNG 能有效利用这些特征。

### 需要按质量门槛判断

- 带阴影和半透明渐变的 UI；
- 高色彩插画；
- 经过抗锯齿的复杂文字截图；
- 含少量摄影内容的合成图。

建议设置最低质量门槛；若 256 色不足以达到该门槛，则回退原图、无损 PNG 或改用其他格式。libimagequant API 原生支持最低/目标质量，并可在最低质量无法满足时拒绝转换。

来源：[libimagequant 质量 API](https://pngquant.org/lib/)

### 不应默认使用

- 照片；
- 天空、肤色等连续渐变；
- 胶片颗粒、传感器噪点或纹理丰富图片；
- 科学、医学、法务等要求像素值不变的图；
- 法线图、遮罩、数据纹理等把通道当数据使用的素材；
- 必须无损保存全部颜色或 metadata 的归档图片。

最多 256 色是格式边界。抖动可以掩饰色带，却不能恢复原始颜色，而且抖动噪点可能降低后续 DEFLATE 的压缩效率。

## 5. 与现代格式的关系

pngquant 的主要价值是“在 PNG 格式约束内获得高质量有损压缩”。如果产品允许改变格式，它不一定优于 WebP 或 AVIF。

Google 的 WebP 官方资料报告，WebP 同时支持有损、无损和 Alpha；其公开测试中，无损 WebP 平均比 PNG 小约 26%，而带 Alpha 的有损 WebP 对适合素材还可能获得更大收益。这些数字同样来自格式开发方，具体产品仍需用自己的语料验证。

来源：

- [Google WebP 格式说明](https://developers.google.com/speed/webp)
- [Google WebP 压缩技术](https://developers.google.com/speed/webp/docs/compression)

因此：

- 必须保留 `.png`：pngquant 很有价值；
- 只追求网页体积：应同时比较 PNGQuant、WebP 和未来的 AVIF；
- 照片：优先测试 MozJPEG/WebP/AVIF；
- 图标与透明 UI：pngquant 应进入候选集，但仍要和 lossless WebP 比较。

## 6. 质量、速度、内存和 WASM

### 质量控制

libimagequant 的质量范围为 0–100，可设置 minimum 和 target：

- 尝试使用满足目标质量所需的最少颜色；
- 若最多 256 色仍不能满足最低质量，则返回失败；
- 支持 0–1 的抖动强度；
- 质量数值类似 JPEG 的产品控制，但不是与 JPEG、WebP 可横向等价的统一指标。

来源：[libimagequant 官方 API](https://pngquant.org/lib/)

### 速度

官方提供 1–10 的速度/质量权衡。其文档称速度 1 只带来边际质量提升但 CPU 成本显著，速度 10 相对默认速度约快 8 倍、质量通常低约 5%。这些是库作者提供的经验值，应通过目标浏览器重新测量。

来源：[libimagequant speed API](https://pngquant.org/lib/)

### 浏览器 WASM

libimagequant 4.x 为 Rust 实现，可编译到 WASM。但官方要求 WASM 构建关闭默认 features，否则内部多线程需要额外的 WASM 线程配置。这意味着默认浏览器集成通常是单线程量化，应依靠 Web Worker 隔离主线程，并谨慎设置批量并发。

量化至少需要：

- 输入 RGBA：约 `width × height × 4` 字节；
- 输出索引：约 `width × height` 字节；
- 调色板、直方图和算法工作内存；
- PNG 编码器自己的缓冲区。

大图批处理时，内存峰值和任务并发往往比 WASM 下载体积更重要。

来源：

- [libimagequant WASM 和线程说明](https://pngquant.org/lib/)
- [libimagequant Rust 可移植性说明](https://pngquant.org/rust.html)

## 7. 许可证风险

libimagequant/pngquant 为双许可证：

- 自由/开源软件可按 GPL v3 或更高版本及附加历史版权声明使用；
- 闭源软件、App Store 或其他非 GPL 使用需要商业许可证。

这不是发布前再处理的小问题，而是技术路线选择条件。LittlePNG 若计划闭源桌面版、商业 SDK 或私有代码，应在深度集成前完成以下任一决策：

1. 购买或书面确认商业许可证；
2. 让相关分发满足 GPL 条件；
3. 选择许可证兼容的替代量化器。

来源：

- [libimagequant 官方许可证说明](https://github.com/ImageOptim/libimagequant)
- [pngquant 官方许可证说明](https://github.com/kornelski/pngquant)

## 8. 对 LittlePNG 的建议

### 推荐产品定位

将它实现为独立的：

```text
PNG Lossy / Smaller compatible PNG
```

而不是把现有“Lossy”滑块无条件映射到所有 PNG。

### 推荐管线

```text
decode PNG to RGBA
  -> classify/accept user-selected PNG lossy mode
  -> libimagequant with minimum + target quality
  -> indexed PNG encoder
  -> OxiPNG lossless pass（可选，按需加载）
  -> compare size
  -> quality/size contract
  -> keep optimized output or fall back
```

关键规则：

- Lossless 模式绝不调用 imagequant。
- 量化未达到最低质量时，不输出低质量结果。
- 同格式、无像素变换且结果不更小时保留原图。
- 照片和渐变素材应提示或推荐 JPEG/WebP，而不是静默套用 pngquant。
- 保持编码器适配器边界，UI 不直接接触 palette、speed 等底层实现参数。
- 在许可证策略确定前，不把 libimagequant 设为不可替换的公共接口。

### 推荐首轮参数实验

不要直接把现有 `quality` 滑块线性传入。先以真实素材测试：

- target quality：70、80、90；
- minimum quality：50、65、75；
- speed：4、6、8；
- dithering：0、0.5、1；
- 输出组合：
  - 当前 `@jsquash/png`；
  - imagequant + indexed PNG；
  - imagequant + indexed PNG + OxiPNG；
  - lossless/lossy WebP。

### 推荐验收语料

至少覆盖：

- 透明图标；
- UI 截图；
- 中文和英文细小文字；
- 半透明阴影；
- 平滑渐变；
- 商品照片；
- 高噪点照片；
- 透明边缘和完全透明但 RGB 非零的像素；
- 已经是索引 PNG 的输入；
- 超大尺寸图片。

### 推荐指标

- 输出字节数和节省比例；
- 编码耗时、WASM 冷启动耗时；
- 峰值内存和批量失败率；
- RGBA/Alpha 正确性；
- DSSIM 或其他感知指标；
- 人工检查文字、边缘、肤色、渐变和透明阴影；
- “低于最低质量时回退”是否可靠。

可使用作者提供的 [DSSIM 工具](https://kornel.ski/dssim) 辅助比较；自动指标不能替代人工视觉检查。

## 9. 最终决策

LittlePNG 应继续推进 imagequant WASM，但需满足三个前置条件：

1. 明确许可证；
2. 完成索引 PNG 编码器，而不只是返回 palette/index；
3. 用 LittlePNG 自己的分类语料证明体积、质量、速度和内存收益。

综合评级：

| 维度 | 判断 |
| --- | --- |
| PNG 兼容场景压缩潜力 | 高 |
| 透明 UI/图标的感知质量 | 高 |
| 照片通用性 | 低至中 |
| 逐像素无损能力 | 不适用 |
| 浏览器/WASM 可行性 | 高，但需 Worker、内存和并发控制 |
| 与 OxiPNG 的关系 | 互补 |
| 与 WebP/AVIF 的关系 | 场景竞争，不是绝对领先 |
| 商业许可证风险 | 高优先级 |

一句话决策：

> pngquant 是很优秀的 PNG 有损调色板量化器，但其优越性建立在“必须输出 PNG、素材适合 256 色、允许感知有损”三个条件之上。
