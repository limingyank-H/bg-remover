/**
 * 用户行为分析工具类
 * 基于 PostHog 实现事件追踪
 */
import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * 初始化分析 SDK
 */
export const initAnalytics = () => {
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: true, // 开启自动捕获基本点击事件
            capture_pageview: true, // 开启自动捕获页面浏览
        });
    } else {
        console.warn('PostHog API Key 未配置，分析功能已禁用。');
    }
};

/**
 * 追踪自定义事件
 * @param eventName 事件名称
 * @param properties 附加属性
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    }
};

/**
 * 设置用户属性
 * @param userId 用户唯一标识
 * @param properties 用户属性
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
        posthog.identify(userId, properties);
    }
};
