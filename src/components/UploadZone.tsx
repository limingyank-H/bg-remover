/**
 * 上传区域组件
 * 支持拖拽和点击上传
 */

import { useCallback, useState, useRef } from 'react';
import './UploadZone.css';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

// 支持的图片格式
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * 验证文件是否有效
     */
    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return '请上传 JPG、PNG 或 WebP 格式的图片';
        }
        if (file.size > MAX_FILE_SIZE) {
            return '文件大小不能超过 20MB';
        }
        return null;
    };

    /**
     * 处理文件选择
     */
    const handleFile = useCallback(
        (file: File) => {
            const errorMsg = validateFile(file);
            if (errorMsg) {
                setError(errorMsg);
                return;
            }
            setError(null);
            onFileSelect(file);
        },
        [onFileSelect]
    );

    /**
     * 拖拽事件处理
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [disabled, handleFile]
    );

    /**
     * 点击上传
     */
    const handleClick = useCallback(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.click();
        }
    }, [disabled]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
            // 重置 input，允许重复选择同一文件
            e.target.value = '';
        },
        [handleFile]
    );

    return (
        <div className="upload-zone-wrapper">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleInputChange}
                    className="upload-input"
                />

                <div className="upload-content">
                    {/* 上传图标 */}
                    <div className="upload-icon">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>

                    {/* 提示文字 */}
                    <h3 className="upload-title">
                        {isDragging ? '松开以上传' : '拖拽图片到这里'}
                    </h3>
                    <p className="upload-subtitle">
                        或点击选择文件
                    </p>
                    <p className="upload-hint">
                        支持 JPG、PNG、WebP，最大 20MB
                    </p>
                </div>

                {/* 装饰边框 */}
                <div className="upload-border" />
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="upload-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}
