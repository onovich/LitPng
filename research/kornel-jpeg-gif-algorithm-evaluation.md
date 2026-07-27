# Kornel Lesiński 的 JPEG / GIF 相关算法与项目评估

日期：2026-07-27

## 结论

需要先纠正一个容易混淆的说法：

- Kornel Lesiński 确实是 `pngquant/libimagequant` 和 `gifski` 的核心作者。
- 他也为 Gifsicle 创作了 `--lossy` 有损 LZW 扩展。
- MozJPEG 不是他个人创作的 JPEG 算法，而是 Mozilla 基于 libjpeg-turbo 发展的 JPEG 编码器项目。他是贡献者，提出过有价值的 deringing/no-overshoot 改进，并维护 Rust 绑定。
- `mozjpeg-rust`、`mozjpeg-sys` 是封装和绑定，不是另一套 JPEG 压缩算法。
- ImageOptim 是多个编码/优化工具的编排应用，也不能等同于 Kornel 自己发明了其中所有算法。

对 LittlePNG：

1. JPEG 应继续使用现有 `@jsquash/jpeg` 的 MozJPEG WASM 路线，不需要换成 Rust wrapper。
2. 若未来支持动画 GIF，从原始帧创建高质量 GIF 可评估 gifski。
3. 若未来压缩已有 GIF，可评估 Gifsicle 的 `--lossy`。
4. GIF 功能不应抢占当前 PNG/JPEG/WebP MVP 的优先级；GIF 格式本身效率低，而且两条优秀 GIF 路线都有强 copyleft/商业许可问题。

## 1. 项目与作者关系

| 项目 | Kornel 的关系 | 性质 |
| --- | --- | --- |
| pngquant/libimagequant | 核心作者/维护者 | PNG 调色板量化算法 |
| gifski | 作者/主导维护者 | 高质量动画 GIF 编码器 |
| Gifsicle `--lossy` | 该功能的作者 | 已有 GIF 的有损 LZW 压缩扩展 |
| Gifsicle | Eddie Kohler 创建 | GIF 操作与优化工具 |
| MozJPEG | Mozilla/libjpeg-turbo 项目；Kornel 是贡献者 | JPEG 编码器 |
| MozJPEG deringing | Kornel 提出的改进 | 高对比边缘预处理 |
| mozjpeg-rust | Kornel/ImageOptim 维护 | MozJPEG 高层 Rust 封装 |
| mozjpeg-sys | Kornel 维护 | MozJPEG 低层 Rust FFI |
| ImageOptim | Kornel 的产品 | 多种第三方优化工具的编排器 |

来源：

- [gifski 官方项目](https://github.com/ImageOptim/gifski)
- [Gifsicle 官方作者列表：Kornel 负责 `--lossy`](https://github.com/kohler/gifsicle)
- [MozJPEG 官方项目](https://github.com/mozilla/mozjpeg)
- [mozjpeg-rust 官方仓库](https://github.com/ImageOptim/mozjpeg-rust)
- [mozjpeg-sys 官方仓库](https://github.com/kornelski/mozjpeg-sys)

## 2. JPEG：MozJPEG

### 2.1 它是什么

MozJPEG 是 Mozilla 基于 libjpeg-turbo 的改进 JPEG 编码器，目标是在保持标准 JPEG 解码兼容性的情况下，提高相同体积下的视觉质量，或降低相同质量下的体积。

官方列出的关键能力包括：

- progressive JPEG 及扫描顺序优化；
- trellis quantization；
- 针对不同显示场景的量化表；
- Huffman/编码优化；
- 与 libjpeg API/ABI 兼容；
- 输出可由普通 JPEG 解码器和浏览器读取。

Mozilla 2014 年公开资料称，当时 MozJPEG 2.0 对 baseline 和 progressive JPEG 平均减少约 5%，部分图片收益更高。该数字属于早期版本和 Mozilla 自有测试，不能直接视为当前 LittlePNG 语料的保证。

来源：

- [MozJPEG 官方仓库与功能](https://github.com/mozilla/mozjpeg)
- [Mozilla：Improving JPEG Image Encoding](https://blog.mozilla.org/en/mozilla/improving-jpeg-image-encoding/)

### 2.2 Kornel 的 deringing 改进

JPEG 对高对比锐利边缘做 DCT 和量化时容易产生振铃，例如黑字白底周围的灰色方块或波纹。

Kornel 提出的处理思路是在编码前：

1. 识别达到取值上限/下限的锐利波形；
2. 对会被 JPEG 解码器裁剪掉的区域进行 overshoot/de-clipping；
3. 使用 Catmull-Rom spline 做较平滑的外推；
4. 让更多量化误差落到最终会被解码器裁掉的范围，从而减轻可见 undershoot。

其作者说明指出：

- 对黑白文字和线条图最明显；
- 对普通照片中没有硬边的区域基本不产生影响；
- 对 JPEG 多次重编码可减少振铃累积；
- 它不能解决所有灰色到灰色边缘的振铃。

来源：[Kornel 的 MozJPEG deringing 原理与补丁说明](https://kornel.ski/deringing/)

这项工作证明 Kornel 对 MozJPEG 有算法贡献，但不能据此把整个 MozJPEG 称为“pngquant 作者的 JPEG 算法”。

### 2.3 Rust 项目不是新算法

`mozjpeg-sys` 暴露原始 libjpeg API，并负责构建/链接 MozJPEG；`mozjpeg-rust` 在其上提供相对安全的 Rust 编解码接口。

它们解决的是：

- Rust FFI；
- 构建与静态链接；
- API 易用性；
- 类型和内存边界。

真正执行 JPEG 编码的仍是 MozJPEG C/libjpeg-turbo 代码。

来源：

- [mozjpeg-sys](https://github.com/kornelski/mozjpeg-sys)
- [mozjpeg-rust](https://github.com/ImageOptim/mozjpeg-rust)

### 2.4 WASM 和 LittlePNG 当前状态

LittlePNG 当前使用的 `@jsquash/jpeg`：

- 明确基于 MozJPEG；
- 面向浏览器和 Web Worker；
- 通过 WebAssembly 运行；
- 默认启用 progressive、optimized coding、自动色度抽样；
- 默认使用 MozJPEG quantization table 3；
- 允许配置 trellis、色度质量和抽样等参数。

来源：

- [jSquash JPEG 官方说明](https://github.com/jamsinclair/jSquash/tree/main/packages/jpeg)
- [jSquash MozJPEG 默认参数](https://github.com/jamsinclair/jSquash/blob/main/packages/jpeg/meta.ts)

LittlePNG 当前只显式传递 `quality`，其余参数使用 jSquash 默认值。因此项目已经得到 MozJPEG 的主要 WASM 能力，但还没有针对素材类型配置不同 preset。

### 2.5 JPEG 建议

保留当前技术路线，并增加产品级 preset：

#### Photo

- 允许自动/适度 chroma subsampling；
- progressive；
- optimize coding；
- 质量范围约 70–85，最终由 benchmark 确认。

#### Text / UI / Screenshot

- 禁用或降低 chroma subsampling，避免彩色锐利边缘模糊；
- 优先验证 deringing/no-overshoot 是否已由当前构建启用；
- 质量相对更高；
- 若必须保留透明度，不能输出 JPEG。

#### Smallest JPEG

- 更积极的 trellis/scan optimization；
- 接受更长编码时间；
- 设置最低视觉质量和“结果不更小则保留原图”的契约。

不要为了“使用作者的 Rust 项目”而把 `@jsquash/jpeg` 换成 `mozjpeg-rust`：

- 当前浏览器 WASM 已可用；
- Rust wrapper 仍要构建 C/汇编依赖；
- 更换封装不会产生新的压缩算法收益。

### 2.6 JPEG 许可证

MozJPEG/libjpeg-turbo 使用 IJG、BSD 风格和 zlib 等兼容的宽松许可证组合，主要要求保留声明和文档归属。它与 libimagequant 的 GPL/商业双许可证风险不同。

来源：[MozJPEG/libjpeg-turbo 官方许可证说明](https://github.com/mozilla/mozjpeg/blob/master/LICENSE.md)

正式发布仍应生成依赖许可证清单，但 MozJPEG 不是 LittlePNG 当前最主要的商业授权阻碍。

## 3. GIF：gifski

### 3.1 它是什么

gifski 是 Kornel 主导的高质量动画 GIF 编码器，建立在 libimagequant/pngquant 的感知调色板能力之上。

它不是简单地把每帧独立压成 256 色，而是结合：

- 跨帧调色板；
- temporal dithering；
- temporal smoothing 和 denoising；
- 有损 LZW；
- 运动质量与有损质量的独立控制；
- resize 和帧率控制。

官方称它能通过跨帧与时间抖动，在标准 GIF 限制下呈现每帧数千色的视觉效果。

来源：

- [gifski 官方仓库](https://github.com/ImageOptim/gifski)
- [gifski 官方网站](https://gif.ski/)

### 3.2 它的优势

GIF 每个调色板最多 256 色，且 LZW 对高噪声动画压缩效率较差。gifski 的优势主要是把“颜色有限”和“帧之间变化”作为同一个时间问题处理：

- 让相邻帧共同承担可见颜色；
- 用时间抖动减轻单帧色带；
- 对运动、噪声和帧间差异进行协调；
- 以更高计算成本换取 GIF 格式内的高视觉质量。

它适合：

- 视频或高质量 RGBA/PNG 帧生成 GIF；
- 对 GIF 兼容性有硬性需求；
- 更在意动画观感而不是绝对最小文件。

它不适合：

- 静态 GIF；
- 大分辨率、长时间、高帧率视频；
- 只追求现代浏览器最小体积；
- 低内存移动设备上的大批量编码。

gifski 官方也直接建议：若不是必须使用 GIF，应考虑 AV1/现代视频；缩小分辨率和降低帧率通常比压低质量更有效。

来源：[gifski 大文件与质量建议](https://gif.ski/)

### 3.3 WASM

gifski 官方支持：

```text
wasm-pack build --target web --features wasm --no-default-features
```

所以浏览器集成在技术上可行。

来源：[gifski 官方 WASM 构建说明](https://github.com/ImageOptim/gifski)

但 WASM 可编译不等于浏览器产品成本低：

- 所有帧需要解码为 RGBA；
- 长动画会产生很高的像素数据量；
- 帧处理、跨帧分析和编码均较重；
- 输入 GIF 或视频的解码仍需另一套解码器；
- 必须放入 Worker，并限制分辨率、帧数、时长和并发。

### 3.4 许可证

gifski 为 AGPL 3 或更高版本，并提供其他/商业许可。

来源：[gifski 官方许可证说明](https://github.com/ImageOptim/gifski)

这对浏览器应用尤其敏感，因为 WASM 模块会分发给用户；若 LittlePNG 未来闭源或使用不兼容许可，必须先获得商业许可或完成法律评估。

## 4. GIF：Gifsicle `--lossy`

### 4.1 归属

Gifsicle 是 Eddie Kohler 创建的 GIF 操作与优化工具。官方作者列表明确注明 Kornel Lesiński 贡献了 `--lossy` 选项。

来源：[Gifsicle 官方仓库作者列表](https://github.com/kohler/gifsicle)

### 4.2 算法

传统 GIF LZW 编码寻找与待编码像素完全相同的最长字典字符串。

Kornel 的有损扩展允许选择“足够相似”的最长字符串，并配合抖动隐藏差异。作者资料称，它对已有动画 GIF 可获得约 30%–50% 的体积下降，但会增加噪声；轻度压缩更有效，极高有损等级收益会逐渐变差。

来源：[Kornel：Lossy GIF compressor](https://kornel.ski/lossygif)

### 4.3 与 gifski 的区别

| 任务 | 更适合 |
| --- | --- |
| 原始视频/PNG/RGBA 帧生成高质量 GIF | gifski |
| 已有 GIF 做结构优化和再压缩 | Gifsicle |
| 静态 GIF | 转 PNG/WebP，通常无需这两者 |
| 最小网页动画 | 优先比较 animated WebP/AVIF 或视频 |

`gifski` 是“重新创建动画”的编码器；Gifsicle `--lossy` 更像“优化已有 GIF”的工具。

### 4.4 许可证与浏览器

Gifsicle 为 GPL-2.0-only，并提供有条件的替代许可说明；闭源集成需联系作者。

来源：[Gifsicle 官方许可证](https://github.com/kohler/gifsicle)

官方项目没有像 gifski 那样把浏览器 WASM 作为主要支持路径。可以通过 Emscripten 等方式移植 C 代码，但这会增加维护和许可成本。

## 5. 对 LittlePNG 的路线建议

### 当前阶段

保持：

```text
JPEG -> @jsquash/jpeg -> MozJPEG WASM
PNG  -> imagequant WASM adapter + indexed PNG encoder
WebP -> current browser path, later libwebp WASM
```

不建议现在加入 GIF。原因：

- GIF 会显著扩张已经完成的静态 imagequant 主链路；
- GIF 会引入动画任务模型、逐帧进度、时长/帧率、内存与取消等新领域；
- GIF 两条最佳候选都有明显商业许可约束；
- 现代网页动画常应输出 WebP/AVIF 或视频，而不是 GIF。

### 后续若验证 GIF 搜索需求

建议拆成独立工具域，而不是塞入当前静态图片队列：

```text
/gif-compressor
/video-to-gif
/gif-to-webp
```

分两阶段：

1. 先做 GIF 输入识别、静态 GIF 转 PNG/WebP、动画 GIF 转 animated WebP。
2. 只有用户明确需要 GIF 输出时，再评估 gifski WASM 商业许可和浏览器资源限制。

### 推荐 benchmark

JPEG：

- 当前 jSquash 默认；
- photo preset；
- text/UI 无色度抽样 preset；
- trellis/scan optimization 的速度与体积；
- JPEGli 作为未来独立候选，而不是归入 Kornel 路线。

GIF：

- 原始帧 -> gifski；
- 已有 GIF -> Gifsicle lossless 和 `--lossy`；
- animated WebP；
- AV1/MP4 视频。

指标：

- 文件大小；
- DSSIM/人工视觉检查；
- 编码时间和 WASM 冷启动；
- 峰值内存；
- 帧率、时长和分辨率限制；
- 透明度、帧 disposal 和循环语义；
- 浏览器兼容性；
- 许可证成本。

## 6. 最终决策

| 路线 | 技术评价 | LittlePNG 建议 |
| --- | --- | --- |
| MozJPEG | 成熟、兼容、WASM 已接入、许可宽松 | 保留并增加场景 preset |
| Kornel deringing | 对文字/线条 JPEG 有价值 | 验证当前构建与参数是否启用 |
| mozjpeg-rust/sys | 好用的 Rust 封装，不是新算法 | Web 端无需替换 jSquash |
| gifski | GIF 创建质量强、官方支持 WASM | 后期独立工具，先解决许可 |
| Gifsicle `--lossy` | 已有 GIF 再压缩有价值 | 后期 GIF compressor 候选 |
| ImageOptim | 优秀工具编排器 | 用于参考组合策略，不是单一算法 |

一句话判断：

> Kornel 在 GIF 领域确实有两条有原创价值的路线；在 JPEG 领域更准确的说法是“他贡献并封装了 MozJPEG”，而 LittlePNG 当前已经在使用这条 JPEG WASM 路线。
