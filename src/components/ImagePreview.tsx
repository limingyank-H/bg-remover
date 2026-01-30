/**
 * 图片预览组件
 * 显示原图和抠图结果的对比
 */

import { useState, useRef, useEffect } from 'react';
import './ImagePreview.css';

interface ImagePreviewProps {
    originalUrl: string;
    resultUrl: string | null;
    isProcessing: boolean;
}

export function ImagePreview({
    originalUrl,
    resultUrl,
    isProcessing,
}: ImagePreviewProps) {
    // 滑块位置（0-100）
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * 处理滑块拖动
     */
    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    // 触摸事件支持
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    // 监听全局鼠标抬起
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div className="preview-wrapper">
            <div
                ref={containerRef}
                className="preview-container"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                {/* 原图（底层） */}
                <div className="preview-original">
                    <img src={originalUrl} alt="原图" draggable={false} />
                    <span className="preview-label label-original">原图</span>
                </div>

                {/* 抠图结果（顶层，被裁剪） */}
                {resultUrl && (
                    <div
                        className="preview-result checkerboard"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <img src={resultUrl} alt="抠图结果" draggable={false} />
                        <span className="preview-label label-result">抠图</span>
                    </div>
                )}

                {/* 处理中遮罩 */}
                {isProcessing && (
                    <div className="preview-processing">
                        <div className="processing-spinner" />
                        <span>正在处理...</span>
                    </div>
                )}

                {/* 滑块控制器 */}
                {resultUrl && !isProcessing && (
                    <div
                        className={`preview-slider ${isDragging ? 'dragging' : ''}`}
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                    >
                        <div className="slider-line" />
                        <div className="slider-handle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l6-7-6-7zm8 0v14l-6-7 6-7z" transform="rotate(90 12 12)" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* 操作提示 */}
            {resultUrl && !isProcessing && (
                <p className="preview-hint">
                    拖动滑块对比原图和抠图效果
                </p>
            )}
        </div>
    );
}
