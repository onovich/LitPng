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
  files: string;
  done: string;
  workers: string;
  addImages: string;
  local: string;
  controlsLabel: string;
  batchSummaryLabel: string;
  actionsLabel: string;
  queueLabel: string;
  rename: string;
  pattern: string;
  original: string;
  originalIndex: string;
  prefixIndex: string;
  folderOriginal: string;
  prefix: string;
  suffix: string;
  resizeCrop: string;
  maxWidth: string;
  maxHeight: string;
  fit: string;
  fill: string;
  crop: string;
  output: string;
  mode: string;
  lossless: string;
  lossy: string;
  format: string;
  quality: string;
  estimatedLoss: string;
  none: string;
  low: string;
  medium: string;
  high: string;
  processing: string;
  runBatch: string;
  downloadZip: string;
  clearQueue: string;
  saved: string;
  name: string;
  size: string;
  status: string;
  queueEmpty: string;
  downloadImage: string;
  kept: string;
  keptOriginal: string;
  queued: string;
  failed: string;
  cancelled: string;
  headings: Record<string, string>;
};

export const translations: Record<LanguageCode, Translation> = {
  en: {
    languageSwitchTitle: "Switch language",
    eyebrow: "Private batch image prep",
    files: "files",
    done: "done",
    workers: "workers",
    addImages: "Add images",
    local: "Local",
    controlsLabel: "Batch controls",
    batchSummaryLabel: "Batch summary",
    actionsLabel: "Batch actions",
    queueLabel: "Image queue",
    rename: "Rename",
    pattern: "Pattern",
    original: "Original",
    originalIndex: "Original + index",
    prefixIndex: "Prefix + index",
    folderOriginal: "Folder + original",
    prefix: "Prefix",
    suffix: "Suffix",
    resizeCrop: "Resize & crop",
    maxWidth: "Max width",
    maxHeight: "Max height",
    fit: "fit",
    fill: "fill",
    crop: "crop",
    output: "Output",
    mode: "Mode",
    lossless: "Lossless",
    lossy: "Lossy",
    format: "Format",
    quality: "Quality",
    estimatedLoss: "Estimated loss",
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
    processing: "Processing",
    runBatch: "Run batch",
    downloadZip: "Download ZIP",
    clearQueue: "Clear queue",
    saved: "saved",
    name: "Name",
    size: "Size",
    status: "Status",
    queueEmpty: "Queue is empty",
    downloadImage: "Download image",
    kept: "kept",
    keptOriginal: "Kept original",
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
    files: "个文件",
    done: "已完成",
    workers: "个线程",
    addImages: "添加图片",
    local: "本地",
    controlsLabel: "批量控制",
    batchSummaryLabel: "批量摘要",
    actionsLabel: "批量操作",
    queueLabel: "图片队列",
    rename: "重命名",
    pattern: "规则",
    original: "原名",
    originalIndex: "原名 + 序号",
    prefixIndex: "前缀 + 序号",
    folderOriginal: "文件夹 + 原名",
    prefix: "前缀",
    suffix: "后缀",
    resizeCrop: "缩放与裁剪",
    maxWidth: "最大宽度",
    maxHeight: "最大高度",
    fit: "适应",
    fill: "填充",
    crop: "裁剪",
    output: "输出",
    mode: "模式",
    lossless: "无损",
    lossy: "有损",
    format: "格式",
    quality: "质量",
    estimatedLoss: "预计损失",
    none: "无",
    low: "低",
    medium: "中",
    high: "高",
    processing: "处理中",
    runBatch: "开始处理",
    downloadZip: "下载 ZIP",
    clearQueue: "清空队列",
    saved: "已节省",
    name: "名称",
    size: "大小",
    status: "状态",
    queueEmpty: "队列为空",
    downloadImage: "下载图片",
    kept: "已保留",
    keptOriginal: "保留原图",
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
    files: "файлов",
    done: "готово",
    workers: "потока",
    addImages: "Добавить",
    local: "Локально",
    controlsLabel: "Пакетные настройки",
    batchSummaryLabel: "Сводка пакета",
    actionsLabel: "Пакетные действия",
    queueLabel: "Очередь изображений",
    rename: "Имена",
    pattern: "Шаблон",
    original: "Исходное",
    originalIndex: "Исходное + номер",
    prefixIndex: "Префикс + номер",
    folderOriginal: "Папка + исходное",
    prefix: "Префикс",
    suffix: "Суффикс",
    resizeCrop: "Размер и кадр",
    maxWidth: "Макс. ширина",
    maxHeight: "Макс. высота",
    fit: "вписать",
    fill: "заполнить",
    crop: "кадр",
    output: "Вывод",
    mode: "Режим",
    lossless: "Без потерь",
    lossy: "С потерями",
    format: "Формат",
    quality: "Качество",
    estimatedLoss: "Оценка потерь",
    none: "Нет",
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
    processing: "Обработка",
    runBatch: "Запустить",
    downloadZip: "Скачать ZIP",
    clearQueue: "Очистить",
    saved: "сэкономлено",
    name: "Имя",
    size: "Размер",
    status: "Статус",
    queueEmpty: "Очередь пуста",
    downloadImage: "Скачать изображение",
    kept: "сохранено",
    keptOriginal: "Оригинал сохранен",
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
    files: "ファイル",
    done: "完了",
    workers: "ワーカー",
    addImages: "画像を追加",
    local: "ローカル",
    controlsLabel: "一括設定",
    batchSummaryLabel: "一括処理の概要",
    actionsLabel: "一括操作",
    queueLabel: "画像キュー",
    rename: "リネーム",
    pattern: "パターン",
    original: "元の名前",
    originalIndex: "元名 + 番号",
    prefixIndex: "接頭辞 + 番号",
    folderOriginal: "フォルダ + 元名",
    prefix: "接頭辞",
    suffix: "接尾辞",
    resizeCrop: "リサイズと切り抜き",
    maxWidth: "最大幅",
    maxHeight: "最大高さ",
    fit: "合わせる",
    fill: "埋める",
    crop: "切抜き",
    output: "出力",
    mode: "モード",
    lossless: "ロスレス",
    lossy: "非可逆",
    format: "形式",
    quality: "品質",
    estimatedLoss: "推定劣化",
    none: "なし",
    low: "低",
    medium: "中",
    high: "高",
    processing: "処理中",
    runBatch: "一括実行",
    downloadZip: "ZIP ダウンロード",
    clearQueue: "クリア",
    saved: "削減",
    name: "名前",
    size: "サイズ",
    status: "状態",
    queueEmpty: "キューは空です",
    downloadImage: "画像をダウンロード",
    kept: "保持",
    keptOriginal: "元画像を保持",
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
    files: "archivos",
    done: "listos",
    workers: "procesos",
    addImages: "Agregar imagenes",
    local: "Local",
    controlsLabel: "Controles por lote",
    batchSummaryLabel: "Resumen del lote",
    actionsLabel: "Acciones del lote",
    queueLabel: "Cola de imagenes",
    rename: "Renombrar",
    pattern: "Patron",
    original: "Original",
    originalIndex: "Original + indice",
    prefixIndex: "Prefijo + indice",
    folderOriginal: "Carpeta + original",
    prefix: "Prefijo",
    suffix: "Sufijo",
    resizeCrop: "Tamano y recorte",
    maxWidth: "Ancho max.",
    maxHeight: "Alto max.",
    fit: "ajustar",
    fill: "rellenar",
    crop: "recortar",
    output: "Salida",
    mode: "Modo",
    lossless: "Sin perdida",
    lossy: "Con perdida",
    format: "Formato",
    quality: "Calidad",
    estimatedLoss: "Perdida estimada",
    none: "Ninguna",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    processing: "Procesando",
    runBatch: "Ejecutar lote",
    downloadZip: "Descargar ZIP",
    clearQueue: "Limpiar",
    saved: "ahorrado",
    name: "Nombre",
    size: "Tamano",
    status: "Estado",
    queueEmpty: "La cola esta vacia",
    downloadImage: "Descargar imagen",
    kept: "conservado",
    keptOriginal: "Original conservado",
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
    files: "arquivos",
    done: "prontos",
    workers: "processos",
    addImages: "Adicionar imagens",
    local: "Local",
    controlsLabel: "Controles do lote",
    batchSummaryLabel: "Resumo do lote",
    actionsLabel: "Acoes do lote",
    queueLabel: "Fila de imagens",
    rename: "Renomear",
    pattern: "Padrao",
    original: "Original",
    originalIndex: "Original + indice",
    prefixIndex: "Prefixo + indice",
    folderOriginal: "Pasta + original",
    prefix: "Prefixo",
    suffix: "Sufixo",
    resizeCrop: "Tamanho e corte",
    maxWidth: "Largura max.",
    maxHeight: "Altura max.",
    fit: "ajustar",
    fill: "preencher",
    crop: "cortar",
    output: "Saida",
    mode: "Modo",
    lossless: "Sem perdas",
    lossy: "Com perdas",
    format: "Formato",
    quality: "Qualidade",
    estimatedLoss: "Perda estimada",
    none: "Nenhuma",
    low: "Baixa",
    medium: "Media",
    high: "Alta",
    processing: "Processando",
    runBatch: "Executar lote",
    downloadZip: "Baixar ZIP",
    clearQueue: "Limpar",
    saved: "economizado",
    name: "Nome",
    size: "Tamanho",
    status: "Status",
    queueEmpty: "A fila esta vazia",
    downloadImage: "Baixar imagem",
    kept: "mantido",
    keptOriginal: "Original mantido",
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
