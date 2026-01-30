/**
 * 一键抠图应用 - 主组件
 * 整合上传、处理、预览和下载流程
 */

import { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { DownloadPanel } from './components/DownloadPanel';
import { ProcessingStatus } from './components/ProcessingStatus';
import { removeImageBackground, blobToDataUrl } from './utils/imageProcessor';
import { trackEvent } from './utils/analytics';
import './App.css';

// 应用状态类型
type AppState = 'idle' | 'processing' | 'done' | 'error';

interface ProcessingProgress {
  percentage: number;
  message: string;
}

function App() {
  // 状态管理
  const [appState, setAppState] = useState<AppState>('idle');
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [progress, setProgress] = useState<ProcessingProgress>({
    percentage: 0,
    message: '准备中...',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * 处理文件上传
   */
  const handleFileSelect = useCallback(async (file: File) => {
    // 重置状态
    setAppState('processing');
    setOriginalFilename(file.name);
    setResultUrl(null);
    setErrorMessage('');

    // 追踪图片选择事件
    trackEvent('image_upload', { name: file.name, size: file.size, type: file.type });

    // 创建原图预览 URL
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);

    try {
      // 调用抠图处理
      const resultBlob = await removeImageBackground(file, (percentage, message) => {
        setProgress({ percentage, message });
      });

      // 转换为 Data URL 用于预览
      const dataUrl = await blobToDataUrl(resultBlob);
      setResultUrl(dataUrl);
      setAppState('done');

      // 追踪抠图处理成功
      trackEvent('processing_complete');
    } catch (error) {
      console.error('抠图处理失败:', error);
      setErrorMessage('抠图处理失败，请尝试其他图片');
      setAppState('error');

      // 追踪抠图处理失败
      trackEvent('processing_error', { error: String(error) });
    }
  }, []);

  /**
   * 重置状态，处理新图片
   */
  const handleReset = useCallback(() => {
    // 释放之前的 Object URL
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }

    setAppState('idle');
    setOriginalUrl(null);
    setResultUrl(null);
    setOriginalFilename('');
    setProgress({ percentage: 0, message: '准备中...' });
    setErrorMessage('');

    // 追踪重置操作
    trackEvent('reset_click');
  }, [originalUrl, resultUrl]);

  return (
    <div className="app">
      {/* 头部 */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <span className="logo-text">抠图大师</span>
          </div>
          <p className="header-tagline">AI 智能抠图，一键去除背景</p>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="main">
        <div className="container">
          {/* 初始状态：显示上传区域 */}
          {appState === 'idle' && (
            <section className="section section-upload">
              <h1 className="section-title">上传图片开始抠图</h1>
              <p className="section-subtitle">
                支持人物、商品、动物等多种场景，秒级处理
              </p>
              <UploadZone onFileSelect={handleFileSelect} />

              {/* 特性展示 */}
              <div className="features">
                <div className="feature">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">
                    <h4>极速处理</h4>
                    <p>AI 算法秒级完成</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">
                    <h4>隐私安全</h4>
                    <p>本地处理不上传</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">✨</div>
                  <div className="feature-text">
                    <h4>高清输出</h4>
                    <p>保留原图质量</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 处理中状态 */}
          {appState === 'processing' && originalUrl && (
            <section className="section section-processing">
              <ImagePreview
                originalUrl={originalUrl}
                resultUrl={null}
                isProcessing={true}
              />
              <ProcessingStatus
                progress={progress.percentage}
                message={progress.message}
              />
            </section>
          )}

          {/* 完成状态：显示预览和下载 */}
          {appState === 'done' && originalUrl && resultUrl && (
            <section className="section section-result">
              <h2 className="section-title result-title">
                <span className="success-icon">✓</span>
                抠图完成
              </h2>
              <ImagePreview
                originalUrl={originalUrl}
                resultUrl={resultUrl}
                isProcessing={false}
              />
              <DownloadPanel
                resultUrl={resultUrl}
                originalFilename={originalFilename}
                onReset={handleReset}
              />
            </section>
          )}

          {/* 错误状态 */}
          {appState === 'error' && (
            <section className="section section-error">
              <div className="error-card glass-card">
                <div className="error-icon">❌</div>
                <h3>处理失败</h3>
                <p>{errorMessage}</p>
                <button className="btn-primary" onClick={handleReset}>
                  重新上传
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 底部 */}
      <footer className="footer">
        <p>
          由 <span className="highlight">@imgly/background-removal</span> 驱动 · 完全本地处理，保护您的隐私
        </p>
      </footer>
    </div>
  );
}

export default App;
