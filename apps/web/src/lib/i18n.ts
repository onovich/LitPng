export type LanguageCode = "en" | "zh" | "ru" | "ja" | "es" | "pt-BR";

export const languages: { code: LanguageCode; shortLabel: string; label: string }[] = [
  { code: "en", shortLabel: "EN", label: "English" },
  { code: "zh", shortLabel: "中文", label: "中文" },
  { code: "ru", shortLabel: "RU", label: "Русский" },
  { code: "ja", shortLabel: "日本語", label: "日本語" },
  { code: "es", shortLabel: "ES", label: "Español" },
  { code: "pt-BR", shortLabel: "BR", label: "Português (Brasil)" }
];

export type Translation = {
  languageSwitchTitle: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  dropTitle: string;
  dropDescription: string;
  optionalStep: string;
  compressionStep: string;
  resizeStep: string;
  downloadStep: string;
  compressionHelp: string;
  resizeHelp: string;
  nextResize: string;
  backCompression: string;
  advancedOptions: string;
  historyOptions: string;
  resizeNotice: string;
  files: string;
  done: string;
  workers: string;
  addImages: string;
  addFolder: string;
  local: string;
  controlsLabel: string;
  batchSummaryLabel: string;
  actionsLabel: string;
  queueLabel: string;
  queueProgress: string;
  queuePause: string;
  queueResume: string;
  queueStop: string;
  queuePaused: string;
  queueStopping: string;
  queueControlHint: string;
  queueRemoveCompleted: string;
  queuePages: string;
  queuePrevious: string;
  queueNext: string;
  rename: string;
  pattern: string;
  patternHelp: string;
  preserveFolders: string;
  original: string;
  originalIndex: string;
  prefixIndex: string;
  folderOriginal: string;
  prefix: string;
  suffix: string;
  resizeCrop: string;
  multiSizeTitle: string;
  multiSizeHelp: string;
  multiSizeWidth: string;
  multiSizeAdd: string;
  multiSizeRemove: string;
  multiSizeError: string;
  multiSizeOutputs: string;
  srcsetTitle: string;
  srcsetHelp: string;
  srcsetEmpty: string;
  srcsetSizes: string;
  srcsetCode: string;
  srcsetCopy: string;
  srcsetDownload: string;
  srcsetCopied: string;
  srcsetCopyFailed: string;
  maxWidth: string;
  maxHeight: string;
  fit: string;
  fill: string;
  crop: string;
  cropReference: string;
  cropGuide: string;
  cropAnchorLabel: string;
  cropFrameLabel: string;
  cropResizeHandle: string;
  cropPrecision: string;
  cropOffsetX: string;
  cropOffsetY: string;
  cropPadding: string;
  cropPreviewError: string;
  cropScale: string;
  cropReset: string;
  cropAnchorNames: string;
  output: string;
  publishingPreset: string;
  customPreset: string;
  shopifyPreset: string;
  wordpressPreset: string;
  openGraphPreset: string;
  shopifyPresetHint: string;
  wordpressPresetHint: string;
  openGraphPresetHint: string;
  savedPresets: string;
  noSavedPresets: string;
  presetName: string;
  savePreset: string;
  deletePreset: string;
  presetSaved: string;
  presetDeleted: string;
  presetStorageError: string;
  presetNameRequired: string;
  historyTitle: string;
  historyRemember: string;
  historyPrivacy: string;
  historyEmpty: string;
  historyReuse: string;
  historyDelete: string;
  historyDeleted: string;
  historyClear: string;
  historyCleared: string;
  historyApplied: string;
  historyStorageError: string;
  mode: string;
  lossless: string;
  losslessPngOnly: string;
  keptExplanation: string;
  workerError: string;
  processingInterrupted: string;
  processingTimeout: string;
  canvasError: string;
  imageDecodeError: string;
  processingError: string;
  previewError: string;
  lossy: string;
  format: string;
  quality: string;
  targetSize: string;
  estimatedLoss: string;
  none: string;
  low: string;
  medium: string;
  high: string;
  processing: string;
  runBatch: string;
  downloadZip: string;
  downloadReport: string;
  clearQueue: string;
  saved: string;
  name: string;
  size: string;
  status: string;
  queueEmpty: string;
  downloadImage: string;
  compareImages: string;
  comparisonTitle: string;
  before: string;
  after: string;
  closeComparison: string;
  loadingPreview: string;
  kept: string;
  keptOriginal: string;
  targetNotReached: string;
  queued: string;
  failed: string;
  cancelled: string;
  headings: Record<string, string>;
};

export const translations: Record<LanguageCode, Translation> = {
  en: {
    languageSwitchTitle: "Switch language",
    eyebrow: "Private batch image prep",
    heroTitle: "Images, a little lighter.",
    heroDescription: "Compress, resize and rename. Ready for the web, without leaving your browser.",
    dropTitle: "Drop your images here",
    dropDescription: "Choose a few images or an entire folder to get started.",
    compressionStep: "Compression",
    optionalStep: "Optional",
    resizeStep: "Resize & crop",
    downloadStep: "Download",
    compressionHelp: "Choose compression settings, or keep the defaults and start.",
    resizeHelp: "Adjust dimensions only when you need to. Original images stay in this browser.",
    nextResize: "Next: resize & crop",
    backCompression: "Back to compression",
    advancedOptions: "Naming & publishing presets",
    historyOptions: "Batch history",
    resizeNotice: "Resizing re-encodes images. Download completed results first; this step prepares a new batch from your originals.",
    files: "files",
    done: "done",
    workers: "workers",
    addImages: "Add images",
    addFolder: "Add folder",
    local: "Local",
    controlsLabel: "Batch controls",
    batchSummaryLabel: "Batch summary",
    actionsLabel: "Batch actions",
    queueLabel: "Image queue",
    queueProgress: "Batch progress",
    queuePause: "Pause queue",
    queueResume: "Resume queue",
    queueStop: "Stop after current image",
    queuePaused: "Paused after current image",
    queueStopping: "Stopping after current image",
    queueControlHint: "Pause/stop lets the current image finish. Run batch retries unfinished images. Download results before removing completed items; removal releases them from this queue.",
    queueRemoveCompleted: "Remove completed",
    queuePages: "Queue pages",
    queuePrevious: "Previous page",
    queueNext: "Next page",
    rename: "Rename",
    pattern: "Pattern",
    patternHelp: "Tokens: {original}, {index}, {prefix}, {suffix}, {folder}, {date}",
    preserveFolders: "Preserve folder structure in ZIP",
    original: "Original",
    originalIndex: "Original + index",
    prefixIndex: "Prefix + index",
    folderOriginal: "Folder + original",
    prefix: "Prefix",
    suffix: "Suffix",
    resizeCrop: "Resize & crop",
    multiSizeTitle: "Multiple sizes",
    multiSizeHelp: "Add up to 6 width limits (1–8192 px). Keep aspect ratio, never upscale; other resize/crop controls are ignored. Empty means single output. Editing widths rebuilds only unfinished outputs.",
    multiSizeWidth: "Width limit (px)",
    multiSizeAdd: "Add width",
    multiSizeRemove: "Remove width",
    multiSizeError: "Enter a new whole-number width from 1 to 8192; at most 6 widths.",
    multiSizeOutputs: "outputs",
    srcsetTitle: "Responsive HTML / srcset",
    srcsetHelp: "Completed multi-size outputs only, grouped by original and format. Actual widths are used; duplicate widths keep the smallest file. Paths are relative to the extracted ZIP root. Adjust sizes for your layout and add meaningful alt text (empty means decorative). Partial results update as processing finishes.",
    srcsetEmpty: "Process multi-size images to generate HTML here.",
    srcsetSizes: "Display sizes (CSS)",
    srcsetCode: "Responsive image HTML",
    srcsetCopy: "Copy HTML",
    srcsetDownload: "Download HTML",
    srcsetCopied: "HTML copied.",
    srcsetCopyFailed: "Copy unavailable. Select and copy the code manually, or download HTML.",
    maxWidth: "Max width",
    maxHeight: "Max height",
    fit: "fit",
    fill: "fill",
    crop: "crop",
    cropReference: "First image · batch reference",
    cropGuide: "Drag the frame to move it; drag an edge or corner to change its size. The same pixel size and anchor offsets apply to every image.",
    cropAnchorLabel: "Anchor",
    cropFrameLabel: "Crop frame",
    cropResizeHandle: "Resize frame",
    cropPrecision: "Precise adjustments",
    cropOffsetX: "Horizontal offset (px)",
    cropOffsetY: "Vertical offset (px)",
    cropPadding: "Smaller images keep the same output size with empty padding. PNG/WebP padding is transparent; JPG uses the background color.",
    cropPreviewError: "The reference image could not be loaded. Choose another image.",
    cropScale: "Frame size",
    cropReset: "Reset frame",
    cropAnchorNames: "Top left|Top|Top right|Left|Center|Right|Bottom left|Bottom|Bottom right",
    output: "Output",
    publishingPreset: "Publishing preset",
    customPreset: "Custom",
    shopifyPreset: "Shopify product",
    wordpressPreset: "WordPress media",
    openGraphPreset: "Open Graph card",
    shopifyPresetHint: "Caps either side at 2048 px and preserves aspect ratio.",
    wordpressPresetHint: "WebP output capped at WordPress' 2560 px large-image threshold.",
    openGraphPresetHint: "JPEG sharing card cropped to the common 1200 × 630 ratio.",
    savedPresets: "My presets",
    noSavedPresets: "No saved preset",
    presetName: "Preset name",
    savePreset: "Save",
    deletePreset: "Delete",
    presetSaved: "Preset saved in this browser.",
    presetDeleted: "Preset deleted.",
    presetStorageError: "This browser could not save presets.",
    presetNameRequired: "Enter a preset name.",
    historyTitle: "Batch history",
    historyRemember: "Remember future batches in this browser",
    historyPrivacy: "Optional: keep up to 20 summaries and parameter snapshots locally, not filenames or images. Sizes include successful files only. Re-add images to run again; turning this off keeps existing records.",
    historyEmpty: "No recorded batches.",
    historyReuse: "Reuse settings",
    historyDelete: "Delete record",
    historyDeleted: "Record deleted.",
    historyClear: "Clear history",
    historyCleared: "History cleared.",
    historyApplied: "Settings applied. Add images to start a new batch.",
    historyStorageError: "Browser history storage is unavailable. Your images are still processed normally; the history change could not be saved.",
    mode: "Mode",
    lossless: "Lossless",
    losslessPngOnly: "Lossless mode only supports PNG. For JPG or WebP, select Lossy.",
    keptExplanation: "The compressed file was not smaller, so the original was kept.",
    workerError: "Image processing could not start. Retry this image.",
    processingInterrupted: "Image processing was interrupted. Retry this image.",
    processingTimeout: "Processing timed out. Try a smaller image or retry.",
    canvasError: "Your browser could not create an image canvas. Try another browser.",
    imageDecodeError: "This image could not be read. Check the file or choose another image.",
    processingError: "This image could not be processed. Retry or choose another image.",
    previewError: "Preview could not be generated. Close it and try again.",
    lossy: "Lossy",
    format: "Format",
    quality: "Quality",
    targetSize: "Target size (KB)",
    estimatedLoss: "Estimated loss",
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
    processing: "Processing",
    runBatch: "Run batch",
    downloadZip: "Download ZIP",
    downloadReport: "Download compression report",
    clearQueue: "Clear queue",
    saved: "saved",
    name: "Name",
    size: "Size",
    status: "Status",
    queueEmpty: "Queue is empty",
    downloadImage: "Download image",
    compareImages: "Compare images",
    comparisonTitle: "Before and after",
    before: "Original",
    after: "Output",
    closeComparison: "Close comparison",
    loadingPreview: "Loading preview",
    kept: "kept",
    keptOriginal: "Kept original",
    targetNotReached: "Closest result; target not reached",
    queued: "queued",
    failed: "failed",
    cancelled: "cancelled",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "PNG Compressor",
      "JPG Compressor": "JPG Compressor",
      "Image Compressor": "Image Compressor",
      "Compress PNG": "Compress PNG",
      "Compress JPG": "Compress JPG",
      "Bulk Image Compressor": "Bulk Image Compressor",
      "Batch Image Compressor": "Batch Image Compressor",
      "Compress and Rename Images": "Compress and Rename Images",
      "Resize and Compress Images": "Resize and Compress Images"
    }
  },
  zh: {
    languageSwitchTitle: "切换语言",
    eyebrow: "本地私密批量图片处理",
    heroTitle: "让图片，轻一点。",
    heroDescription: "压缩、调整尺寸、批量重命名。在浏览器中，准备好每一张图片。",
    dropTitle: "把图片拖到这里",
    dropDescription: "选择几张图片，或导入整个文件夹开始处理。",
    compressionStep: "压缩",
    optionalStep: "可选",
    resizeStep: "缩放与裁剪",
    downloadStep: "下载",
    compressionHelp: "选择压缩方式，或使用默认设置直接开始。",
    resizeHelp: "需要时再调整尺寸。原始图片始终保留在当前浏览器中。",
    nextResize: "下一步：缩放与裁剪",
    backCompression: "返回压缩设置",
    advancedOptions: "重命名与发布预设",
    historyOptions: "历史任务",
    resizeNotice: "调整尺寸需要重新编码。如已完成压缩，请先下载结果；下一步会从原图准备新任务。",
    files: "个文件",
    done: "已完成",
    workers: "个线程",
    addImages: "添加图片",
    addFolder: "添加文件夹",
    local: "本地",
    controlsLabel: "批量控制",
    batchSummaryLabel: "批量摘要",
    actionsLabel: "批量操作",
    queueLabel: "图片队列",
    queueProgress: "批次进度",
    queuePause: "暂停队列",
    queueResume: "继续队列",
    queueStop: "处理完当前图片后停止",
    queuePaused: "当前图片完成后暂停",
    queueStopping: "当前图片完成后停止",
    queueControlHint: "暂停或停止会等待当前图片完成。再次开始处理会重试未完成项。清理已完成项前请先下载结果，清理后将从当前队列释放。",
    queueRemoveCompleted: "清理已完成项",
    queuePages: "队列分页",
    queuePrevious: "上一页",
    queueNext: "下一页",
    rename: "重命名",
    pattern: "规则",
    patternHelp: "可用变量：{original}、{index}、{prefix}、{suffix}、{folder}、{date}",
    preserveFolders: "在 ZIP 中保留文件夹结构",
    original: "原名",
    originalIndex: "原名 + 序号",
    prefixIndex: "前缀 + 序号",
    folderOriginal: "文件夹 + 原名",
    prefix: "前缀",
    suffix: "后缀",
    resizeCrop: "缩放与裁剪",
    multiSizeTitle: "批量多尺寸",
    multiSizeHelp: "最多添加 6 个宽度上限（1–8192 px），等比缩放且不放大，忽略其他缩放/裁剪参数。留空则单尺寸输出；修改宽度仅重建未完成输出。",
    multiSizeWidth: "宽度上限 (px)",
    multiSizeAdd: "添加宽度",
    multiSizeRemove: "移除宽度",
    multiSizeError: "请输入未添加过的 1–8192 整数宽度，最多 6 个。",
    multiSizeOutputs: "个输出",
    srcsetTitle: "响应式 HTML / srcset",
    srcsetHelp: "仅包含已完成的多尺寸结果，按原图和格式分组。使用实际宽度；重复宽度保留最小文件。路径相对于 ZIP 解压根目录。请按网页布局修改 sizes 并补充有意义的 alt 文本（空值表示装饰图片）。未全部完成时，代码会随处理进度更新。",
    srcsetEmpty: "处理多尺寸图片后，此处将生成 HTML。",
    srcsetSizes: "显示尺寸（CSS）",
    srcsetCode: "响应式图片 HTML",
    srcsetCopy: "复制 HTML",
    srcsetDownload: "下载 HTML",
    srcsetCopied: "HTML 已复制。",
    srcsetCopyFailed: "无法自动复制。请手动选中并复制代码，或下载 HTML。",
    maxWidth: "最大宽度",
    maxHeight: "最大高度",
    fit: "适应",
    fill: "填充",
    crop: "裁剪",
    cropReference: "第一张图片 · 批量效果参考",
    cropGuide: "拖动裁剪框调整位置，拖动边缘或角落调整大小。整批图片使用相同像素尺寸和相对锚点的偏移。",
    cropAnchorLabel: "锚点",
    cropFrameLabel: "裁剪框",
    cropResizeHandle: "调整裁剪框大小",
    cropPrecision: "精确调整",
    cropOffsetX: "水平偏移（px）",
    cropOffsetY: "垂直偏移（px）",
    cropPadding: "小图仍输出统一尺寸，不足处补齐空白；PNG/WebP 为透明，JPG 使用背景色。",
    cropPreviewError: "无法加载参考图片，请换一张图片。",
    cropScale: "裁剪框大小",
    cropReset: "重置裁剪框",
    cropAnchorNames: "左上|上中|右上|左中|中心|右中|左下|下中|右下",
    output: "输出",
    publishingPreset: "发布平台预设",
    customPreset: "自定义",
    shopifyPreset: "Shopify 商品图",
    wordpressPreset: "WordPress 媒体",
    openGraphPreset: "Open Graph 分享卡片",
    shopifyPresetHint: "最长边限制为 2048 像素，并保留原始宽高比。",
    wordpressPresetHint: "输出 WebP，最长边限制为 WordPress 的 2560 像素大图阈值。",
    openGraphPresetHint: "输出 JPEG，并裁剪为通用的 1200 × 630 分享卡片比例。",
    savedPresets: "我的预设",
    noSavedPresets: "暂无已保存预设",
    presetName: "预设名称",
    savePreset: "保存",
    deletePreset: "删除",
    presetSaved: "预设已保存在当前浏览器。",
    presetDeleted: "预设已删除。",
    presetStorageError: "当前浏览器无法保存预设。",
    presetNameRequired: "请输入预设名称。",
    historyTitle: "历史任务",
    historyRemember: "在当前浏览器记住后续批次",
    historyPrivacy: "可选：仅在本地保留最近 20 次摘要与参数快照，不保存文件名或图片。体积仅统计成功文件；再次处理需重新添加图片。关闭记录不会删除已有历史。",
    historyEmpty: "暂无批次记录。",
    historyReuse: "复用参数",
    historyDelete: "删除记录",
    historyDeleted: "记录已删除。",
    historyClear: "清空历史",
    historyCleared: "历史已清空。",
    historyApplied: "参数已应用。添加图片以开始新批次。",
    historyStorageError: "浏览器历史存储不可用。图片仍可正常处理，但历史变更未能保存。",
    mode: "模式",
    lossless: "无损",
    losslessPngOnly: "无损模式仅支持 PNG。JPG 或 WebP 请使用有损模式。",
    keptExplanation: "压缩后的文件没有更小，已保留原图。",
    workerError: "图片处理未能启动，请重试这张图片。",
    processingInterrupted: "图片处理已中断，请重试这张图片。",
    processingTimeout: "图片处理超时，请缩小图片后重试，或再次尝试。",
    canvasError: "浏览器无法创建图片画布，请换用其他浏览器。",
    imageDecodeError: "无法读取这张图片，请检查文件或换一张图片。",
    processingError: "这张图片处理失败，请重试或换一张图片。",
    previewError: "无法生成预览，请关闭后重试。",
    lossy: "有损",
    format: "格式",
    quality: "质量",
    targetSize: "目标大小 (KB)",
    estimatedLoss: "预计损失",
    none: "无",
    low: "低",
    medium: "中",
    high: "高",
    processing: "处理中",
    runBatch: "开始处理",
    downloadZip: "下载 ZIP",
    downloadReport: "下载压缩报告",
    clearQueue: "清空队列",
    saved: "已节省",
    name: "名称",
    size: "大小",
    status: "状态",
    queueEmpty: "队列为空",
    downloadImage: "下载图片",
    compareImages: "对比图片",
    comparisonTitle: "处理前后对比",
    before: "原图",
    after: "输出",
    closeComparison: "关闭对比",
    loadingPreview: "正在加载预览",
    kept: "已保留",
    keptOriginal: "保留原图",
    targetNotReached: "已输出最接近结果，未达到目标大小",
    queued: "等待中",
    failed: "失败",
    cancelled: "已取消",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "PNG 压缩",
      "JPG Compressor": "JPG 压缩",
      "Image Compressor": "图片压缩",
      "Compress PNG": "压缩 PNG",
      "Compress JPG": "压缩 JPG",
      "Bulk Image Compressor": "批量图片压缩",
      "Batch Image Compressor": "批量图片压缩",
      "Compress and Rename Images": "压缩并重命名图片",
      "Resize and Compress Images": "缩放并压缩图片"
    }
  },
  ru: {
    languageSwitchTitle: "Сменить язык",
    eyebrow: "Приватная пакетная подготовка изображений",
    heroTitle: "Изображения становятся легче.",
    heroDescription: "Сжимайте, меняйте размер и названия прямо в браузере.",
    dropTitle: "Перетащите изображения сюда",
    dropDescription: "Выберите изображения или целую папку.",
    compressionStep: "Сжатие",
    optionalStep: "Необязательно",
    resizeStep: "Размер и обрезка",
    downloadStep: "Скачать",
    compressionHelp: "Выберите настройки или начните со значениями по умолчанию.",
    resizeHelp: "Изменяйте размеры при необходимости. Оригиналы остаются в браузере.",
    nextResize: "Далее: размер и обрезка",
    backCompression: "Назад к сжатию",
    advancedOptions: "Имена и шаблоны публикации",
    historyOptions: "История обработки",
    resizeNotice: "Изменение размера требует нового кодирования. Сначала скачайте готовые результаты; новая обработка использует оригиналы.",
    files: "файлов",
    done: "готово",
    workers: "потока",
    addImages: "Добавить",
    addFolder: "Добавить папку",
    local: "Локально",
    controlsLabel: "Пакетные настройки",
    batchSummaryLabel: "Сводка пакета",
    actionsLabel: "Пакетные действия",
    queueLabel: "Очередь изображений",
    queueProgress: "Ход пакета",
    queuePause: "Пауза очереди",
    queueResume: "Продолжить очередь",
    queueStop: "Остановить после текущего изображения",
    queuePaused: "Пауза после текущего изображения",
    queueStopping: "Остановка после текущего изображения",
    queueControlHint: "Пауза и остановка ждут завершения текущего изображения. Повторный запуск обрабатывает незавершенные файлы. Скачайте результаты до удаления завершенных элементов.",
    queueRemoveCompleted: "Удалить завершенные",
    queuePages: "Страницы очереди",
    queuePrevious: "Предыдущая страница",
    queueNext: "Следующая страница",
    rename: "Имена",
    pattern: "Шаблон",
    patternHelp: "Токены: {original}, {index}, {prefix}, {suffix}, {folder}, {date}",
    preserveFolders: "Сохранять структуру папок в ZIP",
    original: "Исходное",
    originalIndex: "Исходное + номер",
    prefixIndex: "Префикс + номер",
    folderOriginal: "Папка + исходное",
    prefix: "Префикс",
    suffix: "Суффикс",
    resizeCrop: "Размер и кадр",
    multiSizeTitle: "Несколько размеров",
    multiSizeHelp: "До 6 пределов ширины (1–8192 пикс.), с сохранением пропорций, без увеличения. Другие настройки размера/кадра игнорируются. Пусто — один результат. Изменения касаются только незавершенных результатов.",
    multiSizeWidth: "Предел ширины (пикс.)",
    multiSizeAdd: "Добавить ширину",
    multiSizeRemove: "Удалить ширину",
    multiSizeError: "Введите новую целую ширину от 1 до 8192; не более 6 значений.",
    multiSizeOutputs: "результатов",
    srcsetTitle: "Адаптивный HTML / srcset",
    srcsetHelp: "Только готовые варианты размеров, сгруппированные по оригиналу и формату. Используется фактическая ширина; при совпадении — наименьший файл. Пути относительно корня распакованного ZIP. Настройте sizes под макет и заполните alt (пустой — декоративное изображение). Код обновляется по мере обработки.",
    srcsetEmpty: "Обработайте несколько размеров, чтобы получить HTML.",
    srcsetSizes: "Размеры отображения (CSS)",
    srcsetCode: "HTML адаптивных изображений",
    srcsetCopy: "Копировать HTML",
    srcsetDownload: "Скачать HTML",
    srcsetCopied: "HTML скопирован.",
    srcsetCopyFailed: "Копирование недоступно. Скопируйте код вручную или скачайте HTML.",
    maxWidth: "Макс. ширина",
    maxHeight: "Макс. высота",
    fit: "вписать",
    fill: "заполнить",
    crop: "кадр",
    cropReference: "Первое изображение · пример для серии",
    cropGuide: "Перемещайте рамку и тяните края для изменения размера. Размер и смещение от опорной точки применяются ко всей серии.",
    cropAnchorLabel: "Опорная точка",
    cropFrameLabel: "Рамка обрезки",
    cropResizeHandle: "Изменить размер рамки",
    cropPrecision: "Точные настройки",
    cropOffsetX: "Смещение по горизонтали (px)",
    cropOffsetY: "Смещение по вертикали (px)",
    cropPadding: "Маленькие изображения дополняются до общего размера. PNG/WebP — прозрачность, JPG — цвет фона.",
    cropPreviewError: "Не удалось загрузить пример. Выберите другое изображение.",
    cropScale: "Размер рамки",
    cropReset: "Сбросить рамку",
    cropAnchorNames: "Слева сверху|Сверху|Справа сверху|Слева|Центр|Справа|Слева снизу|Снизу|Справа снизу",
    output: "Вывод",
    publishingPreset: "Профиль публикации",
    customPreset: "Свой",
    shopifyPreset: "Товар Shopify",
    wordpressPreset: "Медиа WordPress",
    openGraphPreset: "Карточка Open Graph",
    shopifyPresetHint: "Ограничивает стороны до 2048 пикс. и сохраняет пропорции.",
    wordpressPresetHint: "WebP до порога больших изображений WordPress — 2560 пикс.",
    openGraphPresetHint: "JPEG-карточка с обрезкой до распространенного размера 1200 × 630.",
    savedPresets: "Мои профили",
    noSavedPresets: "Нет сохраненного профиля",
    presetName: "Название профиля",
    savePreset: "Сохранить",
    deletePreset: "Удалить",
    presetSaved: "Профиль сохранен в этом браузере.",
    presetDeleted: "Профиль удален.",
    presetStorageError: "Браузер не смог сохранить профиль.",
    presetNameRequired: "Введите название профиля.",
    historyTitle: "История пакетов",
    historyRemember: "Запоминать будущие пакеты в этом браузере",
    historyPrivacy: "По желанию: до 20 сводок и снимков настроек локально, без имен файлов и изображений. Размеры только для успешных файлов. Для повтора добавьте изображения заново. Отключение не удаляет историю.",
    historyEmpty: "Нет записанных пакетов.",
    historyReuse: "Применить настройки",
    historyDelete: "Удалить запись",
    historyDeleted: "Запись удалена.",
    historyClear: "Очистить историю",
    historyCleared: "История очищена.",
    historyApplied: "Настройки применены. Добавьте изображения для нового пакета.",
    historyStorageError: "Хранилище истории недоступно. Изображения обрабатываются, но изменения истории не сохранены.",
    mode: "Режим",
    lossless: "Без потерь",
    losslessPngOnly: "Без потерь поддерживается только PNG. Для JPG и WebP выберите сжатие с потерями.",
    keptExplanation: "Результат не меньше оригинала. Оригинал сохранён.",
    workerError: "Не удалось начать обработку. Повторите попытку.",
    processingInterrupted: "Обработка прервана. Повторите попытку.",
    processingTimeout: "Время обработки истекло. Уменьшите изображение или повторите попытку.",
    canvasError: "Браузер не смог создать холст. Попробуйте другой браузер.",
    imageDecodeError: "Не удалось прочитать изображение. Проверьте файл или выберите другой.",
    processingError: "Не удалось обработать изображение. Повторите попытку или выберите другое.",
    previewError: "Не удалось создать предпросмотр. Закройте его и повторите попытку.",
    lossy: "С потерями",
    format: "Формат",
    quality: "Качество",
    targetSize: "Целевой размер (КБ)",
    estimatedLoss: "Оценка потерь",
    none: "Нет",
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
    processing: "Обработка",
    runBatch: "Запустить",
    downloadZip: "Скачать ZIP",
    downloadReport: "Скачать отчет о сжатии",
    clearQueue: "Очистить",
    saved: "сэкономлено",
    name: "Имя",
    size: "Размер",
    status: "Статус",
    queueEmpty: "Очередь пуста",
    downloadImage: "Скачать изображение",
    compareImages: "Сравнить изображения",
    comparisonTitle: "До и после",
    before: "Оригинал",
    after: "Результат",
    closeComparison: "Закрыть сравнение",
    loadingPreview: "Загрузка предпросмотра",
    kept: "сохранено",
    keptOriginal: "Оригинал сохранен",
    targetNotReached: "Ближайший результат; цель не достигнута",
    queued: "в очереди",
    failed: "ошибка",
    cancelled: "отменено",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "Сжатие PNG",
      "JPG Compressor": "Сжатие JPG",
      "Image Compressor": "Сжатие изображений",
      "Compress PNG": "Сжать PNG",
      "Compress JPG": "Сжать JPG",
      "Bulk Image Compressor": "Массовое сжатие",
      "Batch Image Compressor": "Пакетное сжатие",
      "Compress and Rename Images": "Сжать и переименовать",
      "Resize and Compress Images": "Размер и сжатие"
    }
  },
  ja: {
    languageSwitchTitle: "言語を切り替え",
    eyebrow: "ローカルで安全な一括画像処理",
    heroTitle: "画像を、もっと軽やかに。",
    heroDescription: "圧縮、サイズ変更、名前変更。すべてブラウザの中で。",
    dropTitle: "ここに画像をドロップ",
    dropDescription: "画像またはフォルダを選んで始めましょう。",
    compressionStep: "圧縮",
    optionalStep: "任意",
    resizeStep: "サイズ変更と切り抜き",
    downloadStep: "ダウンロード",
    compressionHelp: "設定を選ぶか、そのまま圧縮を開始します。",
    resizeHelp: "必要なときだけサイズを調整。元画像はブラウザに保持されます。",
    nextResize: "次へ：サイズ変更と切り抜き",
    backCompression: "圧縮設定に戻る",
    advancedOptions: "名前変更と公開プリセット",
    historyOptions: "処理履歴",
    resizeNotice: "サイズ変更は再エンコードします。完了した結果を先に保存してください。元画像から新しい処理を準備します。",
    files: "ファイル",
    done: "完了",
    workers: "ワーカー",
    addImages: "画像を追加",
    addFolder: "フォルダーを追加",
    local: "ローカル",
    controlsLabel: "一括設定",
    batchSummaryLabel: "一括処理の概要",
    actionsLabel: "一括操作",
    queueLabel: "画像キュー",
    queueProgress: "バッチの進行状況",
    queuePause: "キューを一時停止",
    queueResume: "キューを再開",
    queueStop: "現在の画像の完了後に停止",
    queuePaused: "現在の画像の完了後に一時停止",
    queueStopping: "現在の画像の完了後に停止",
    queueControlHint: "一時停止と停止は現在の画像の完了を待ちます。再実行で未完了の画像を処理します。完了項目を削除する前に結果をダウンロードしてください。",
    queueRemoveCompleted: "完了項目を削除",
    queuePages: "キューのページ",
    queuePrevious: "前のページ",
    queueNext: "次のページ",
    rename: "リネーム",
    pattern: "パターン",
    patternHelp: "トークン: {original}, {index}, {prefix}, {suffix}, {folder}, {date}",
    preserveFolders: "ZIP 内のフォルダー構造を保持",
    original: "元の名前",
    originalIndex: "元名 + 番号",
    prefixIndex: "接頭辞 + 番号",
    folderOriginal: "フォルダ + 元名",
    prefix: "接頭辞",
    suffix: "接尾辞",
    resizeCrop: "リサイズと切り抜き",
    multiSizeTitle: "複数サイズ",
    multiSizeHelp: "幅の上限を最大 6 個追加（1–8192 px）。縦横比を維持し、拡大せず、他のリサイズ・切り抜き設定は無視します。空なら単一出力です。変更は未完了の出力のみ再構成します。",
    multiSizeWidth: "幅の上限 (px)",
    multiSizeAdd: "幅を追加",
    multiSizeRemove: "幅を削除",
    multiSizeError: "未追加の 1–8192 の整数幅を入力してください。最大 6 個です。",
    multiSizeOutputs: "出力",
    srcsetTitle: "レスポンシブ HTML / srcset",
    srcsetHelp: "完了した複数サイズの出力のみを元画像と形式別にまとめます。実際の幅を使用し、同じ幅では最小ファイルを選びます。パスは ZIP 展開先のルートからの相対パスです。レイアウトに合わせて sizes と alt を編集してください（空の alt は装飾画像用）。処理の進行に伴いコードが更新されます。",
    srcsetEmpty: "複数サイズの画像を処理すると HTML が生成されます。",
    srcsetSizes: "表示サイズ（CSS）",
    srcsetCode: "レスポンシブ画像 HTML",
    srcsetCopy: "HTML をコピー",
    srcsetDownload: "HTML をダウンロード",
    srcsetCopied: "HTML をコピーしました。",
    srcsetCopyFailed: "コピーできません。手動でコードをコピーするか、HTML をダウンロードしてください。",
    maxWidth: "最大幅",
    maxHeight: "最大高さ",
    fit: "合わせる",
    fill: "埋める",
    crop: "切抜き",
    cropReference: "最初の画像・一括処理の参考",
    cropGuide: "枠をドラッグして移動、辺や角をドラッグしてサイズ変更。同じピクセル寸法と基準点からのオフセットを全画像に適用します。",
    cropAnchorLabel: "基準点",
    cropFrameLabel: "切り抜き枠",
    cropResizeHandle: "枠のサイズ変更",
    cropPrecision: "詳細調整",
    cropOffsetX: "水平オフセット (px)",
    cropOffsetY: "垂直オフセット (px)",
    cropPadding: "小さい画像は余白で統一サイズにします。PNG/WebPは透明、JPGは背景色です。",
    cropPreviewError: "参考画像を読み込めません。別の画像を選んでください。",
    cropScale: "枠のサイズ",
    cropReset: "枠をリセット",
    cropAnchorNames: "左上|上|右上|左|中央|右|左下|下|右下",
    output: "出力",
    publishingPreset: "公開プリセット",
    customPreset: "カスタム",
    shopifyPreset: "Shopify 商品画像",
    wordpressPreset: "WordPress メディア",
    openGraphPreset: "Open Graph カード",
    shopifyPresetHint: "各辺を 2048 px 以内に収め、縦横比を維持します。",
    wordpressPresetHint: "WordPress の大画像しきい値 2560 px 以内の WebP にします。",
    openGraphPresetHint: "一般的な 1200 × 630 比率に切り抜いた JPEG カードです。",
    savedPresets: "マイプリセット",
    noSavedPresets: "保存済みプリセットなし",
    presetName: "プリセット名",
    savePreset: "保存",
    deletePreset: "削除",
    presetSaved: "このブラウザーに保存しました。",
    presetDeleted: "プリセットを削除しました。",
    presetStorageError: "このブラウザーには保存できませんでした。",
    presetNameRequired: "プリセット名を入力してください。",
    historyTitle: "バッチ履歴",
    historyRemember: "今後のバッチをこのブラウザーに記録する",
    historyPrivacy: "任意で最新 20 件の概要と設定をローカル保存します。ファイル名や画像は保存しません。サイズは成功したファイルのみです。再処理には画像の再追加が必要です。無効にしても既存の履歴は残ります。",
    historyEmpty: "バッチの記録はありません。",
    historyReuse: "設定を再利用",
    historyDelete: "記録を削除",
    historyDeleted: "記録を削除しました。",
    historyClear: "履歴を消去",
    historyCleared: "履歴を消去しました。",
    historyApplied: "設定を適用しました。画像を追加して新しいバッチを開始してください。",
    historyStorageError: "履歴ストレージを利用できません。画像処理は続行できますが、履歴の変更は保存できませんでした。",
    mode: "モード",
    lossless: "ロスレス",
    losslessPngOnly: "ロスレスはPNGのみ対応します。JPGやWebPは非可逆圧縮を選んでください。",
    keptExplanation: "圧縮後のファイルが小さくならなかったため、元画像を保持しました。",
    workerError: "画像処理を開始できませんでした。もう一度お試しください。",
    processingInterrupted: "画像処理が中断されました。もう一度お試しください。",
    processingTimeout: "処理がタイムアウトしました。画像を小さくするか、もう一度お試しください。",
    canvasError: "画像のキャンバスを作成できません。別のブラウザをお試しください。",
    imageDecodeError: "画像を読み込めません。ファイルを確認するか、別の画像を選んでください。",
    processingError: "画像を処理できません。再試行するか、別の画像を選んでください。",
    previewError: "プレビューを生成できません。閉じてから再試行してください。",
    lossy: "非可逆",
    format: "形式",
    quality: "品質",
    targetSize: "目標サイズ (KB)",
    estimatedLoss: "推定劣化",
    none: "なし",
    low: "低",
    medium: "中",
    high: "高",
    processing: "処理中",
    runBatch: "一括実行",
    downloadZip: "ZIP ダウンロード",
    downloadReport: "圧縮レポートをダウンロード",
    clearQueue: "クリア",
    saved: "削減",
    name: "名前",
    size: "サイズ",
    status: "状態",
    queueEmpty: "キューは空です",
    downloadImage: "画像をダウンロード",
    compareImages: "画像を比較",
    comparisonTitle: "処理前と処理後",
    before: "元画像",
    after: "出力",
    closeComparison: "比較を閉じる",
    loadingPreview: "プレビューを読み込み中",
    kept: "保持",
    keptOriginal: "元画像を保持",
    targetNotReached: "最も近い結果です。目標サイズには未達です",
    queued: "待機中",
    failed: "失敗",
    cancelled: "キャンセル",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "PNG 圧縮",
      "JPG Compressor": "JPG 圧縮",
      "Image Compressor": "画像圧縮",
      "Compress PNG": "PNG を圧縮",
      "Compress JPG": "JPG を圧縮",
      "Bulk Image Compressor": "一括画像圧縮",
      "Batch Image Compressor": "一括画像圧縮",
      "Compress and Rename Images": "圧縮とリネーム",
      "Resize and Compress Images": "リサイズと圧縮"
    }
  },
  es: {
    languageSwitchTitle: "Cambiar idioma",
    eyebrow: "Preparacion privada de imagenes por lote",
    heroTitle: "Imagenes un poco mas ligeras.",
    heroDescription: "Comprime, redimensiona y renombra sin salir del navegador.",
    dropTitle: "Arrastra tus imagenes aqui",
    dropDescription: "Elige imagenes o una carpeta para empezar.",
    compressionStep: "Compresion",
    optionalStep: "Opcional",
    resizeStep: "Tamano y recorte",
    downloadStep: "Descargar",
    compressionHelp: "Elige ajustes o empieza con los valores predeterminados.",
    resizeHelp: "Ajusta el tamano cuando lo necesites. Los originales siguen en tu navegador.",
    nextResize: "Siguiente: tamano y recorte",
    backCompression: "Volver a compresion",
    advancedOptions: "Nombres y preajustes",
    historyOptions: "Historial",
    resizeNotice: "Cambiar el tamano vuelve a codificar las imagenes. Descarga los resultados antes; el nuevo lote usa los originales.",
    files: "archivos",
    done: "listos",
    workers: "procesos",
    addImages: "Agregar imagenes",
    addFolder: "Agregar carpeta",
    local: "Local",
    controlsLabel: "Controles por lote",
    batchSummaryLabel: "Resumen del lote",
    actionsLabel: "Acciones del lote",
    queueLabel: "Cola de imagenes",
    queueProgress: "Progreso del lote",
    queuePause: "Pausar cola",
    queueResume: "Reanudar cola",
    queueStop: "Detener tras la imagen actual",
    queuePaused: "Pausa tras la imagen actual",
    queueStopping: "Deteniendo tras la imagen actual",
    queueControlHint: "Pausar o detener espera a que termine la imagen actual. Ejecutar de nuevo reintenta las pendientes. Descarga los resultados antes de eliminar los elementos completados.",
    queueRemoveCompleted: "Eliminar completados",
    queuePages: "Páginas de la cola",
    queuePrevious: "Página anterior",
    queueNext: "Página siguiente",
    rename: "Renombrar",
    pattern: "Patron",
    patternHelp: "Variables: {original}, {index}, {prefix}, {suffix}, {folder}, {date}",
    preserveFolders: "Conservar estructura de carpetas en ZIP",
    original: "Original",
    originalIndex: "Original + indice",
    prefixIndex: "Prefijo + indice",
    folderOriginal: "Carpeta + original",
    prefix: "Prefijo",
    suffix: "Sufijo",
    resizeCrop: "Tamano y recorte",
    multiSizeTitle: "Varios tamaños",
    multiSizeHelp: "Añade hasta 6 límites de ancho (1–8192 px). Conserva la proporción sin ampliar; ignora otros ajustes de tamaño/recorte. Vacío: una salida. Los cambios solo reconstruyen salidas pendientes.",
    multiSizeWidth: "Límite de ancho (px)",
    multiSizeAdd: "Añadir ancho",
    multiSizeRemove: "Eliminar ancho",
    multiSizeError: "Introduce un ancho entero nuevo de 1 a 8192; máximo 6 anchos.",
    multiSizeOutputs: "salidas",
    srcsetTitle: "HTML adaptable / srcset",
    srcsetHelp: "Solo variantes terminadas, agrupadas por original y formato. Se usa el ancho real; si se repite, se elige el archivo menor. Rutas relativas a la raíz del ZIP extraído. Ajusta sizes al diseño y completa alt (vacío indica una imagen decorativa). El código se actualiza durante el procesamiento.",
    srcsetEmpty: "Procesa imágenes de varios tamaños para generar HTML.",
    srcsetSizes: "Tamaños de visualización (CSS)",
    srcsetCode: "HTML de imágenes adaptables",
    srcsetCopy: "Copiar HTML",
    srcsetDownload: "Descargar HTML",
    srcsetCopied: "HTML copiado.",
    srcsetCopyFailed: "No se puede copiar. Copia el código manualmente o descarga el HTML.",
    maxWidth: "Ancho max.",
    maxHeight: "Alto max.",
    fit: "ajustar",
    fill: "rellenar",
    crop: "recortar",
    cropReference: "Primera imagen · referencia del lote",
    cropGuide: "Arrastra el marco para moverlo y sus bordes para cambiar el tamaño. El tamaño y desplazamiento se aplican a todo el lote.",
    cropAnchorLabel: "Ancla",
    cropFrameLabel: "Marco de recorte",
    cropResizeHandle: "Cambiar tamaño del marco",
    cropPrecision: "Ajustes precisos",
    cropOffsetX: "Desplazamiento horizontal (px)",
    cropOffsetY: "Desplazamiento vertical (px)",
    cropPadding: "Las imágenes pequeñas se rellenan hasta el tamaño común. PNG/WebP transparente; JPG usa el fondo.",
    cropPreviewError: "No se pudo cargar la referencia. Elige otra imagen.",
    cropScale: "Tamaño del marco",
    cropReset: "Restablecer marco",
    cropAnchorNames: "Arriba izquierda|Arriba|Arriba derecha|Izquierda|Centro|Derecha|Abajo izquierda|Abajo|Abajo derecha",
    output: "Salida",
    publishingPreset: "Preajuste de publicación",
    customPreset: "Personalizado",
    shopifyPreset: "Producto de Shopify",
    wordpressPreset: "Medios de WordPress",
    openGraphPreset: "Tarjeta Open Graph",
    shopifyPresetHint: "Limita cada lado a 2048 px y conserva la proporción.",
    wordpressPresetHint: "WebP limitado al umbral de imagen grande de WordPress: 2560 px.",
    openGraphPresetHint: "Tarjeta JPEG recortada a la proporción habitual de 1200 × 630.",
    savedPresets: "Mis preajustes",
    noSavedPresets: "Sin preajuste guardado",
    presetName: "Nombre del preajuste",
    savePreset: "Guardar",
    deletePreset: "Eliminar",
    presetSaved: "Preajuste guardado en este navegador.",
    presetDeleted: "Preajuste eliminado.",
    presetStorageError: "El navegador no pudo guardar el preajuste.",
    presetNameRequired: "Escribe un nombre para el preajuste.",
    historyTitle: "Historial de lotes",
    historyRemember: "Recordar futuros lotes en este navegador",
    historyPrivacy: "Opcional: hasta 20 resúmenes y ajustes locales, sin nombres de archivo ni imágenes. Tamaños solo de archivos correctos. Añade las imágenes de nuevo para repetir. Desactivar no elimina el historial.",
    historyEmpty: "No hay lotes registrados.",
    historyReuse: "Reutilizar ajustes",
    historyDelete: "Eliminar registro",
    historyDeleted: "Registro eliminado.",
    historyClear: "Borrar historial",
    historyCleared: "Historial borrado.",
    historyApplied: "Ajustes aplicados. Añade imágenes para iniciar otro lote.",
    historyStorageError: "El almacenamiento del historial no está disponible. Las imágenes se procesan normalmente, pero no se guardaron los cambios del historial.",
    mode: "Modo",
    lossless: "Sin perdida",
    losslessPngOnly: "El modo sin perdida solo admite PNG. Para JPG o WebP, elige con perdida.",
    keptExplanation: "El archivo no era mas pequeno, por eso se conservo el original.",
    workerError: "No se pudo iniciar el procesamiento. Vuelve a intentarlo.",
    processingInterrupted: "El procesamiento se interrumpió. Vuelve a intentarlo.",
    processingTimeout: "El procesamiento tardó demasiado. Reduce la imagen o vuelve a intentarlo.",
    canvasError: "El navegador no pudo crear el lienzo. Prueba otro navegador.",
    imageDecodeError: "No se pudo leer la imagen. Revisa el archivo o elige otra imagen.",
    processingError: "No se pudo procesar la imagen. Vuelve a intentarlo o elige otra.",
    previewError: "No se pudo generar la vista previa. Ciérrala y vuelve a intentarlo.",
    lossy: "Con perdida",
    format: "Formato",
    quality: "Calidad",
    targetSize: "Tamaño objetivo (KB)",
    estimatedLoss: "Perdida estimada",
    none: "Ninguna",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    processing: "Procesando",
    runBatch: "Ejecutar lote",
    downloadZip: "Descargar ZIP",
    downloadReport: "Descargar informe de compresión",
    clearQueue: "Limpiar",
    saved: "ahorrado",
    name: "Nombre",
    size: "Tamano",
    status: "Estado",
    queueEmpty: "La cola esta vacia",
    downloadImage: "Descargar imagen",
    compareImages: "Comparar imágenes",
    comparisonTitle: "Antes y después",
    before: "Original",
    after: "Resultado",
    closeComparison: "Cerrar comparación",
    loadingPreview: "Cargando vista previa",
    kept: "conservado",
    keptOriginal: "Original conservado",
    targetNotReached: "Resultado más cercano; no se alcanzó el objetivo",
    queued: "en cola",
    failed: "fallo",
    cancelled: "cancelado",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "Compresor PNG",
      "JPG Compressor": "Compresor JPG",
      "Image Compressor": "Compresor de imagenes",
      "Compress PNG": "Comprimir PNG",
      "Compress JPG": "Comprimir JPG",
      "Bulk Image Compressor": "Compresor masivo",
      "Batch Image Compressor": "Compresor por lote",
      "Compress and Rename Images": "Comprimir y renombrar",
      "Resize and Compress Images": "Redimensionar y comprimir"
    }
  },
  "pt-BR": {
    languageSwitchTitle: "Trocar idioma",
    eyebrow: "Preparo privado de imagens em lote",
    heroTitle: "Imagens um pouco mais leves.",
    heroDescription: "Comprima, redimensione e renomeie no seu navegador.",
    dropTitle: "Solte suas imagens aqui",
    dropDescription: "Escolha imagens ou uma pasta para comecar.",
    compressionStep: "Compressao",
    optionalStep: "Opcional",
    resizeStep: "Tamanho e recorte",
    downloadStep: "Baixar",
    compressionHelp: "Escolha os ajustes ou comece com os valores padrao.",
    resizeHelp: "Ajuste o tamanho quando precisar. Os originais ficam no navegador.",
    nextResize: "Proximo: tamanho e recorte",
    backCompression: "Voltar a compressao",
    advancedOptions: "Nomes e predefinicoes",
    historyOptions: "Historico",
    resizeNotice: "Alterar o tamanho recodifica as imagens. Baixe os resultados antes; o novo lote usa os originais.",
    files: "arquivos",
    done: "prontos",
    workers: "processos",
    addImages: "Adicionar imagens",
    addFolder: "Adicionar pasta",
    local: "Local",
    controlsLabel: "Controles do lote",
    batchSummaryLabel: "Resumo do lote",
    actionsLabel: "Acoes do lote",
    queueLabel: "Fila de imagens",
    queueProgress: "Progresso do lote",
    queuePause: "Pausar fila",
    queueResume: "Retomar fila",
    queueStop: "Parar após a imagem atual",
    queuePaused: "Pausa após a imagem atual",
    queueStopping: "Parando após a imagem atual",
    queueControlHint: "Pausar ou parar aguarda a imagem atual. Executar novamente tenta as imagens pendentes. Baixe os resultados antes de remover os itens concluídos.",
    queueRemoveCompleted: "Remover concluídos",
    queuePages: "Páginas da fila",
    queuePrevious: "Página anterior",
    queueNext: "Próxima página",
    rename: "Renomear",
    pattern: "Padrao",
    patternHelp: "Variáveis: {original}, {index}, {prefix}, {suffix}, {folder}, {date}",
    preserveFolders: "Preservar estrutura de pastas no ZIP",
    original: "Original",
    originalIndex: "Original + indice",
    prefixIndex: "Prefixo + indice",
    folderOriginal: "Pasta + original",
    prefix: "Prefixo",
    suffix: "Sufixo",
    resizeCrop: "Tamanho e corte",
    multiSizeTitle: "Vários tamanhos",
    multiSizeHelp: "Adicione até 6 limites de largura (1–8192 px). Mantém a proporção, sem ampliar; ignora outros ajustes de tamanho/corte. Vazio: uma saída. Mudanças recriam apenas saídas pendentes.",
    multiSizeWidth: "Limite de largura (px)",
    multiSizeAdd: "Adicionar largura",
    multiSizeRemove: "Remover largura",
    multiSizeError: "Digite uma largura inteira nova de 1 a 8192; no máximo 6 larguras.",
    multiSizeOutputs: "saídas",
    srcsetTitle: "HTML responsivo / srcset",
    srcsetHelp: "Somente variantes concluídas, agrupadas por original e formato. Usa a largura real; larguras repetidas mantêm o menor arquivo. Caminhos relativos à raiz do ZIP extraído. Ajuste sizes ao layout e preencha alt (vazio indica imagem decorativa). O código é atualizado durante o processamento.",
    srcsetEmpty: "Processe imagens em vários tamanhos para gerar HTML.",
    srcsetSizes: "Tamanhos de exibição (CSS)",
    srcsetCode: "HTML de imagens responsivas",
    srcsetCopy: "Copiar HTML",
    srcsetDownload: "Baixar HTML",
    srcsetCopied: "HTML copiado.",
    srcsetCopyFailed: "Não foi possível copiar. Copie o código manualmente ou baixe o HTML.",
    maxWidth: "Largura max.",
    maxHeight: "Altura max.",
    fit: "ajustar",
    fill: "preencher",
    crop: "cortar",
    cropReference: "Primeira imagem · referência do lote",
    cropGuide: "Arraste o quadro para mover e suas bordas para redimensionar. O tamanho e deslocamento se aplicam ao lote inteiro.",
    cropAnchorLabel: "Âncora",
    cropFrameLabel: "Quadro de recorte",
    cropResizeHandle: "Redimensionar quadro",
    cropPrecision: "Ajustes precisos",
    cropOffsetX: "Deslocamento horizontal (px)",
    cropOffsetY: "Deslocamento vertical (px)",
    cropPadding: "Imagens pequenas recebem preenchimento. PNG/WebP transparente; JPG usa a cor de fundo.",
    cropPreviewError: "Não foi possível carregar a referência. Escolha outra imagem.",
    cropScale: "Tamanho do quadro",
    cropReset: "Redefinir quadro",
    cropAnchorNames: "Superior esquerda|Superior|Superior direita|Esquerda|Centro|Direita|Inferior esquerda|Inferior|Inferior direita",
    output: "Saida",
    publishingPreset: "Predefinição de publicação",
    customPreset: "Personalizado",
    shopifyPreset: "Produto Shopify",
    wordpressPreset: "Mídia WordPress",
    openGraphPreset: "Cartão Open Graph",
    shopifyPresetHint: "Limita cada lado a 2048 px e preserva a proporção.",
    wordpressPresetHint: "WebP limitado ao limiar de imagem grande do WordPress: 2560 px.",
    openGraphPresetHint: "Cartão JPEG cortado na proporção comum de 1200 × 630.",
    savedPresets: "Meus predefinidos",
    noSavedPresets: "Nenhum predefinido salvo",
    presetName: "Nome do predefinido",
    savePreset: "Salvar",
    deletePreset: "Excluir",
    presetSaved: "Predefinido salvo neste navegador.",
    presetDeleted: "Predefinido excluído.",
    presetStorageError: "O navegador não conseguiu salvar o predefinido.",
    presetNameRequired: "Digite um nome para o predefinido.",
    historyTitle: "Histórico de lotes",
    historyRemember: "Lembrar futuros lotes neste navegador",
    historyPrivacy: "Opcional: até 20 resumos e configurações locais, sem nomes de arquivos ou imagens. Tamanhos apenas dos arquivos bem-sucedidos. Adicione as imagens novamente para repetir. Desativar não exclui o histórico.",
    historyEmpty: "Nenhum lote registrado.",
    historyReuse: "Reutilizar configurações",
    historyDelete: "Excluir registro",
    historyDeleted: "Registro excluído.",
    historyClear: "Limpar histórico",
    historyCleared: "Histórico limpo.",
    historyApplied: "Configurações aplicadas. Adicione imagens para iniciar outro lote.",
    historyStorageError: "O armazenamento do histórico está indisponível. As imagens são processadas normalmente, mas as mudanças no histórico não foram salvas.",
    mode: "Modo",
    lossless: "Sem perdas",
    losslessPngOnly: "O modo sem perdas suporta apenas PNG. Para JPG ou WebP, escolha com perdas.",
    keptExplanation: "O arquivo nao ficou menor, por isso o original foi mantido.",
    workerError: "Não foi possível iniciar o processamento. Tente novamente.",
    processingInterrupted: "O processamento foi interrompido. Tente novamente.",
    processingTimeout: "O processamento excedeu o tempo. Reduza a imagem ou tente novamente.",
    canvasError: "O navegador não criou a tela de imagem. Tente outro navegador.",
    imageDecodeError: "Não foi possível ler a imagem. Verifique o arquivo ou escolha outra.",
    processingError: "Não foi possível processar a imagem. Tente novamente ou escolha outra.",
    previewError: "Não foi possível gerar a prévia. Feche e tente novamente.",
    lossy: "Com perdas",
    format: "Formato",
    quality: "Qualidade",
    targetSize: "Tamanho alvo (KB)",
    estimatedLoss: "Perda estimada",
    none: "Nenhuma",
    low: "Baixa",
    medium: "Media",
    high: "Alta",
    processing: "Processando",
    runBatch: "Executar lote",
    downloadZip: "Baixar ZIP",
    downloadReport: "Baixar relatório de compressão",
    clearQueue: "Limpar",
    saved: "economizado",
    name: "Nome",
    size: "Tamanho",
    status: "Status",
    queueEmpty: "A fila esta vazia",
    downloadImage: "Baixar imagem",
    compareImages: "Comparar imagens",
    comparisonTitle: "Antes e depois",
    before: "Original",
    after: "Resultado",
    closeComparison: "Fechar comparação",
    loadingPreview: "Carregando prévia",
    kept: "mantido",
    keptOriginal: "Original mantido",
    targetNotReached: "Resultado mais próximo; meta não atingida",
    queued: "na fila",
    failed: "falhou",
    cancelled: "cancelado",
    headings: {
      "LittlePNG": "LittlePNG",
      "PNG Compressor": "Compressor PNG",
      "JPG Compressor": "Compressor JPG",
      "Image Compressor": "Compressor de imagens",
      "Compress PNG": "Comprimir PNG",
      "Compress JPG": "Comprimir JPG",
      "Bulk Image Compressor": "Compressor em massa",
      "Batch Image Compressor": "Compressor em lote",
      "Compress and Rename Images": "Comprimir e renomear",
      "Resize and Compress Images": "Redimensionar e comprimir"
    }
  }
};

export function normalizeLanguage(value: string | undefined): LanguageCode | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized === "pt-br" || normalized === "pt") {
    return "pt-BR";
  }

  if (normalized.startsWith("zh")) {
    return "zh";
  }

  if (normalized.startsWith("ru")) {
    return "ru";
  }

  if (normalized.startsWith("ja")) {
    return "ja";
  }

  if (normalized.startsWith("es")) {
    return "es";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return undefined;
}

export function detectLanguage(values: readonly string[]): LanguageCode {
  for (const value of values) {
    const language = normalizeLanguage(value);
    if (language) {
      return language;
    }
  }

  return "en";
}

export function nextLanguage(current: LanguageCode): LanguageCode {
  const index = languages.findIndex((language) => language.code === current);
  return languages[(index + 1) % languages.length].code;
}

export function translateHeading(heading: string, language: LanguageCode): string {
  return translations[language].headings[heading] ?? heading;
}

// Translate at render time so existing errors follow a language switch too.
// Unknown codec/browser messages use a localized recovery message instead of
// exposing implementation text (which is usually English) to users.
export function localizedImageError(error: string, t: Translation, context: "processing" | "preview" = "processing"): string {
  if (error === "Lossless mode currently supports PNG inputs only.") return t.losslessPngOnly;
  if (error === "Image worker failed. Retry this image." || error === "Could not start the image worker. Retry this image.") return t.workerError;
  if (error === "Image processing interrupted.") return t.processingInterrupted;
  if (error.startsWith("Image processing timed out")) return t.processingTimeout;
  if (error.includes("canvas context") || error.includes("Canvas context")) return t.canvasError;
  if (/decode|invalid image|not a valid image/i.test(error)) return t.imageDecodeError;
  return context === "preview" ? t.previewError : t.processingError;
}
