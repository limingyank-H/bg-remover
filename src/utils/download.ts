/**
 * 下载工具函数
 */

/**
 * 下载 Blob 文件
 * @param blob 要下载的 Blob
 * @param filename 文件名
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放 URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * 生成下载文件名
 * @param originalName 原始文件名
 * @param suffix 后缀标识
 * @param format 文件格式
 */
export function generateFilename(
    originalName: string,
    suffix: string = 'nobg',
    format: 'png' | 'jpeg' = 'png'
): string {
    // 移除原始扩展名
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    return `${baseName}_${suffix}.${extension}`;
}
