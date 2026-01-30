# 🎨 抠图大师 (BG Remover)

一键去除图片背景的 Web 应用，完全在浏览器端运行，保护您的隐私。

![Screenshot](screenshot.png)

## ✨ 特性

- **🚀 极速处理** - AI 算法秒级完成抠图
- **🔒 隐私安全** - 完全本地处理，图片不上传服务器
- **✨ 高清输出** - 保留原图质量，支持透明背景
- **📐 多尺寸下载** - 原始尺寸、1080p、720p 等多种规格
- **🎯 精准抠图** - 支持人物、商品、动物等多种场景

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **抠图引擎**: [@imgly/background-removal](https://github.com/nicepayinc/background-removal-js)
- **样式**: 原生 CSS（深色主题 + 玻璃态效果）

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

### 构建生产版本

```bash
npm run build
```

## 📖 使用说明

1. 打开网站，将图片拖拽到上传区域（或点击选择文件）
2. 等待 AI 处理完成（首次加载需下载约 80MB 模型）
3. 使用滑块对比原图和抠图效果
4. 选择需要的尺寸和格式，点击下载

## 📄 License

MIT License
