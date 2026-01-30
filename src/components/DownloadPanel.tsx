/**
 * 下载面板组件
 * 选择尺寸和格式，下载抠图结果
 */

import { useState } from 'react';
import { SIZE_OPTIONS, resizeImage } from '../utils/imageProcessor';
import { downloadBlob, generateFilename } from '../utils/download';
import './DownloadPanel.css';

interface DownloadPanelProps {
    resultUrl: string;
    originalFilename: string;
    onReset: () => void;
}

type ImageFormat = 'png' | 'jpeg';

export function DownloadPanel({
    resultUrl,
    originalFilename,
    onReset,
}: DownloadPanelProps) {
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [format, setFormat] = useState<ImageFormat>('png');
    const [isDownloading, setIsDownloading] = useState(false);
    const [customWidth, setCustomWidth] = useState('');
    const [customHeight, setCustomHeight] = useState('');
    const [showCustomSize, setShowCustomSize] = useState(false);

    /**
     * 处理下载
     */
    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            let targetWidth: number | null = null;
            let targetHeight: number | null = null;

            if (showCustomSize && customWidth && customHeight) {
                targetWidth = parseInt(customWidth, 10);
                targetHeight = parseInt(customHeight, 10);
            } else {
                const sizeOption = SIZE_OPTIONS[selectedSizeIndex];
                targetWidth = sizeOption.width;
                targetHeight = sizeOption.height;
            }

            // 调整尺寸
            const blob = await resizeImage(resultUrl, targetWidth, targetHeight, format);

            // 生成文件名并下载
            const sizeLabel = showCustomSize
                ? `${customWidth}x${customHeight}`
                : SIZE_OPTIONS[selectedSizeIndex].label.replace(/\s/g, '');
            const filename = generateFilename(originalFilename, `nobg_${sizeLabel}`, format);
            downloadBlob(blob, filename);
        } catch (error) {
            console.error('下载失败:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="download-panel glass-card">
            <h3 className="panel-title">下载设置</h3>

            {/* 尺寸选择 */}
            <div className="panel-section">
                <label className="section-label">选择尺寸</label>
                <div className="size-options">
                    {SIZE_OPTIONS.map((option, index) => (
                        <button
                            key={option.label}
                            className={`size-option ${selectedSizeIndex === index && !showCustomSize ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedSizeIndex(index);
                                setShowCustomSize(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                    <button
                        className={`size-option ${showCustomSize ? 'active' : ''}`}
                        onClick={() => setShowCustomSize(true)}
                    >
                        自定义
                    </button>
                </div>

                {/* 自定义尺寸输入 */}
                {showCustomSize && (
                    <div className="custom-size">
                        <input
                            type="number"
                            placeholder="宽度"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            min="1"
                            max="10000"
                        />
                        <span className="size-separator">×</span>
                        <input
                            type="number"
                            placeholder="高度"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            min="1"
                            max="10000"
                        />
                    </div>
                )}
            </div>

            {/* 格式选择 */}
            <div className="panel-section">
                <label className="section-label">输出格式</label>
                <div className="format-options">
                    <button
                        className={`format-option ${format === 'png' ? 'active' : ''}`}
                        onClick={() => setFormat('png')}
                    >
                        <span className="format-name">PNG</span>
                        <span className="format-desc">透明背景</span>
                    </button>
                    <button
                        className={`format-option ${format === 'jpeg' ? 'active' : ''}`}
                        onClick={() => setFormat('jpeg')}
                    >
                        <span className="format-name">JPG</span>
                        <span className="format-desc">白色背景</span>
                    </button>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="panel-actions">
                <button
                    className="btn-primary download-btn"
                    onClick={handleDownload}
                    disabled={isDownloading || (showCustomSize && (!customWidth || !customHeight))}
                >
                    {isDownloading ? (
                        <>
                            <span className="btn-spinner" />
                            下载中...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            下载图片
                        </>
                    )}
                </button>

                <button className="btn-secondary reset-btn" onClick={onReset}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    处理新图片
                </button>
            </div>
        </div>
    );
}
