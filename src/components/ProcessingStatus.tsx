/**
 * 处理进度组件
 * 显示抠图处理进度
 */

import './ProcessingStatus.css';

interface ProcessingStatusProps {
    progress: number;
    message: string;
}

export function ProcessingStatus({ progress, message }: ProcessingStatusProps) {
    return (
        <div className="processing-status glass-card">
            <div className="status-icon-wrapper">
                <div className="status-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                </div>
                <div className="status-ring" />
            </div>

            <div className="status-content">
                <p className="status-message">{message}</p>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="status-percentage">{progress}%</p>
            </div>
        </div>
    );
}
