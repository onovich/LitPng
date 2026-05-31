# LittlePNG 商业路线图

日期：2026-05-31

## 路线图原则

LittlePNG 的商业路线图应遵循三个原则：

1. 先拿 SEO 流量，再谈复杂商业化。
2. 免费核心功能必须足够好，否则没有排名和口碑。
3. 收费点应该围绕高频工作流，而不是简单限制压缩次数。

## 阶段 0：项目验证期

时间：第 0-2 周

目标：

- 验证关键词、受众和产品定位。
- 确认技术授权和基本压缩方案。
- 做出可以公开预告的产品叙事。

交付物：

- 完整关键词池。
- 竞品功能表。
- LittlePNG 定位页草稿。
- 第三方库许可证清单。
- MVP scope 锁定。

商业动作：

- 用 Google Ads API 或手动 Keyword Planner 验证 100-300 个关键词。
- 把关键词分组：压缩、目标体积、批量、重命名、resize、crop、格式转换、电商、开发者。
- 选出第一批 20 个 SEO 页面。
- 明确第一版不卖什么，避免产品发散。

成功标准：

- 至少 20 个可做工具页的长尾关键词。
- 明确一个主定位：本地批量图片发布前处理。
- 确认 PNG/JPG 核心能力可研发。

## 阶段 1：免费 MVP 上线

时间：第 3-8 周

目标：

- 上线一个真正可用的免费工具。
- 让 SEO 页面能承接搜索用户并完成任务。
- 建立 Search Console、Analytics、错误监控。

免费 MVP 功能：

- 多图拖拽上传。
- PNG/JPG 压缩。
- 批量重命名基础规则。
- 基础 resize。
- 基础 crop：fit / fill / crop + anchor。
- WebP 输出。
- ZIP 下载。
- 压缩前后大小、节省百分比。
- 隐私说明：图片在本地处理。

SEO 页面：

- `/`
- `/png-compressor`
- `/jpg-compressor`
- `/image-compressor`
- `/compress-png`
- `/compress-jpg`
- `/bulk-image-compressor`
- `/batch-image-compressor`
- `/compress-and-rename-images`
- `/resize-and-compress-image`

商业动作：

- 不急着收费。
- 收集邮件等待列表：桌面版、CLI、Pro presets。
- 页面底部放轻量反馈入口。
- 做一个公开 changelog。

成功标准：

- 首次压缩成功率大于 85%。
- Web Vitals 不被 WASM 包严重拖垮。
- 20 个核心页面被 Google 收录。
- 第一个月自然点击达到 500+。

## 阶段 2：SEO 扩张与留存

时间：第 2-4 个月

目标：

- 从单点工具扩成小型工具矩阵。
- 让用户形成“图片上线前来 LittlePNG”的心智。

功能扩展：

- 目标体积压缩：100KB、200KB、500KB、1MB。
- 批量重命名模板。
- 保留目录结构。
- EXIF / metadata 移除。
- 压缩报告 CSV。
- 图片对比预览。
- 输出 preset：高质量、平衡、最小体积。
- 行业 preset：Shopify、WordPress、Open Graph。

SEO 扩展：

- 目标体积页：`compress-image-to-100kb`、`compress-image-under-1mb`。
- 行业页：`shopify-image-compressor`、`wordpress-image-compressor`。
- 功能页：`batch-rename-images`、`crop-and-compress-images`。
- 比较页：`tinypng-alternative`、`squoosh-alternative`、`private-image-compressor`。

商业动作：

- 引入非侵入式广告或赞助测试。
- 放出 Pro waitlist。
- 放出桌面版 waitlist。
- 做 3-5 篇真实 benchmark 内容，用于外链。

成功标准：

- 月自然点击 5,000-15,000。
- 上传图片访问占比大于 20%。
- 7 日回访率大于 8%。
- Pro/桌面版 waitlist 500+。

## 阶段 3：第一条付费线

时间：第 4-6 个月

推荐优先商业化：桌面版或 Pro presets 二选一。

### 方案 A：桌面版优先

适合条件：

- 用户经常上传大批量。
- 浏览器内存/文件夹 UX 反馈较多。
- waitlist 中开发者、电商用户多。

功能：

- 离线批量处理。
- 文件夹拖入。
- 保存工作流。
- 本地多线程。
- Windows/macOS。
- 右键菜单。

定价：

- Early bird `$19-$29`。
- 正式版 `$39-$49`。

### 方案 B：Web Pro 优先

适合条件：

- 用户更依赖在线工具。
- preset、报告、目标体积功能使用率高。
- 桌面开发成本暂时不划算。

功能：

- 保存 presets。
- 高级重命名模板。
- 高级裁剪 preset。
- 历史任务。
- 批量报告。
- 无广告。

定价：

- `$6-$9/月`。
- `$39-$59/年`。

成功标准：

- 付费转化率达到自然访问的 0.1%-0.5%。
- 首月收入 `$500+`。
- 付费用户退款率低于 10%。

## 阶段 4：开发者和平台化

时间：第 6-9 个月

目标：

- 进入更高付费意愿的开发者和网站运营流程。
- 降低对纯 SEO 单渠道的依赖。

产品：

- CLI。
- GitHub Action。
- VS Code 插件。
- WordPress 插件。
- Shopify app 概念验证。
- npm package。

商业动作：

- CLI 基础免费，高级 preset 或团队配置付费。
- GitHub Action 对私有仓库或高频用量收费。
- WordPress 插件订阅。
- 开发者文档做 SEO 和外链资产。

成功标准：

- 开发者工具带来 20% 以上新注册或回访。
- 至少一条非 SEO 渠道开始稳定带量。
- MRR `$2,000-$5,000`。

## 阶段 5：规模化

时间：第 9-12 个月

目标：

- 从工具站变成图片发布前处理平台。
- 建立多条收入线。

产品：

- 团队 preset。
- 私有部署。
- API。
- 批量工作流模板市场。
- 企业隐私/合规说明。

商业动作：

- 建立 affiliate / partner 页面。
- 对内容站、电商 agency、开发工作室做定向页面。
- 做比较和迁移页面。
- 尝试小额付费关键词投放，只投高转化页。

成功标准：

- 月自然点击 50,000-150,000。
- MRR `$5,000+`。
- 桌面版或 Pro 年收入进入可持续区间。

## 功能优先级

### P0：没有它就不是完整 MVP

- PNG/JPG 压缩。
- 多文件导入。
- ZIP 下载。
- 基础重命名。
- 基础 resize。
- 基础 crop。
- 本地隐私说明。
- SEO 工具页。

### P1：提升差异化和留存

- WebP 输出。
- 目标体积压缩。
- 保留文件夹结构。
- 高级命名模板。
- Shopify / WordPress / Open Graph presets。
- 压缩报告。
- 对比预览。

### P2：付费功能候选

- 保存 presets。
- 历史任务。
- 大批量队列。
- 批量生成多尺寸。
- `srcset` 生成。
- 桌面版。
- CLI。

### P3：长期平台化

- GitHub Action。
- WordPress / Shopify 插件。
- API。
- 团队工作区。
- 私有部署。

## 收入路线建议

第 0-3 个月：

- 不强制收费。
- 可以测试轻量广告，但不要破坏体验。

第 4-6 个月：

- 优先上桌面版或 Web Pro。
- 用 waitlist 和行为数据选择。

第 6-9 个月：

- 开发者工具开始变现。
- 建立插件渠道。

第 9-12 个月：

- API / 团队 / 私有部署探索。

## 关键决策点

第 2 个月：

- 如果 SEO 页面收录差，优先解决技术 SEO 和页面质量。
- 如果工具使用率低，优先改首屏和上传流程，不扩功能。

第 4 个月：

- 如果批量/重命名使用率高，强化工作流定位。
- 如果目标体积页流量高，做更多 `compress to X KB` 页面。

第 6 个月：

- 如果桌面 waitlist 高，做桌面。
- 如果开发者流量高，做 CLI/GitHub Action。
- 如果普通用户占比高，广告和目标体积工具页更优先。

第 12 个月：

- 如果自然流量低于 10,000/月且没有上升趋势，需要重新定位。
- 如果自然流量高但收入低，需要把付费点从“压缩限制”改成“工作流省时间”。
