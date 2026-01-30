/**
 * 图片处理工具函数
 * 封装背景移除和图片尺寸调整逻辑
 */

// NOTE: 不在顶层导入 @imgly/background-removal，避免阻塞应用初始化
// 改为在 removeImageBackground 函数内动态导入

// 预设尺寸选项
export interface SizeOption {
  label: string;
  width: number | null; // null 表示原始尺寸
  height: number | null;
}

export const SIZE_OPTIONS: SizeOption[] = [
  { label: '原始尺寸', width: null, height: null },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1280 × 720', width: 1280, height: 720 },
  { label: '800 × 600', width: 800, height: 600 },
  { label: '640 × 480', width: 640, height: 480 },
];

/**
 * 移除图片背景
 * @param imageSource 图片源（File 或 URL）
 * @param onProgress 进度回调函数
 * @returns 处理后的 Blob
 */
export async function removeImageBackground(
  imageSource: File | string,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  // 动态导入背景移除库，避免阻塞初始渲染
  onProgress?.(0, '正在加载 AI 模型...');

  const { removeBackground } = await import('@imgly/background-removal');

  const result = await removeBackground(imageSource, {
    // NOTE: 使用完整精度模型以获得更好的抠图质量
    model: 'isnet',  // 完整精度模型，比默认的 isnet_fp16 更精确
    device: 'gpu',   // 优先使用 GPU（WebGPU），如果不支持会自动回退到 CPU
    // NOTE: 进度回调用于更新 UI 状态
    progress: (key: string, current: number, total: number) => {
      const percentage = Math.round((current / total) * 100);
      const messages: Record<string, string> = {
        'fetch:model': '正在加载 AI 模型（首次约 80MB）...',
        'compute:inference': '正在处理图片...',
        'compute:postprocess': '正在优化结果...',
      };
      const message = messages[key] || '处理中...';
      onProgress?.(percentage, message);
    },
    output: {
      format: 'image/png',
      quality: 1,
    },
  });

  return result;
}

/**
 * 将 Blob 转换为 Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 调整图片尺寸
 * @param imageUrl 图片 URL（Data URL 或 Object URL）
 * @param targetWidth 目标宽度（null 表示原始尺寸）
 * @param targetHeight 目标高度（null 表示原始尺寸）
 * @param format 输出格式
 * @returns 调整后的 Blob
 */
export async function resizeImage(
  imageUrl: string,
  targetWidth: number | null,
  targetHeight: number | null,
  format: 'png' | 'jpeg' = 'png'
): Promise<Blob> {
  // NOTE: 如果是原始尺寸且格式为 PNG，直接从 Data URL 获取 Blob，避免 Canvas 处理丢失透明度
  if (targetWidth === null && targetHeight === null && format === 'png') {
    // 如果是 Data URL，直接转换为 Blob
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      return response.blob();
    }
    // 如果是 Object URL，也直接获取
    const response = await fetch(imageUrl);
    return response.blob();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      // 计算目标尺寸，保持宽高比
      let finalWidth = img.width;
      let finalHeight = img.height;

      if (targetWidth && targetHeight) {
        const aspectRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;

        if (aspectRatio > targetRatio) {
          // 图片更宽，以宽度为基准
          finalWidth = targetWidth;
          finalHeight = Math.round(targetWidth / aspectRatio);
        } else {
          // 图片更高，以高度为基准
          finalHeight = targetHeight;
          finalWidth = Math.round(targetHeight * aspectRatio);
        }
      }

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // IMPORTANT: 清除 Canvas 背景，确保透明
      ctx.clearRect(0, 0, finalWidth, finalHeight);

      // 如果是 JPEG 格式，需要填充白色背景（JPEG 不支持透明）
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      }

      // 使用高质量缩放
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 绘制图片
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // 导出
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.92 : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片导出失败'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });
}

/**
 * 获取图片尺寸信息
 */
export async function getImageDimensions(
  imageUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('无法获取图片尺寸'));
    img.src = imageUrl;
  });
}
