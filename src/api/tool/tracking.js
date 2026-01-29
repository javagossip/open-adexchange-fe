import request from '@/utils/request';

const TRACKING_BASE_PATH = '/tracking-api/v1/track';

/**
 * 广告曝光追踪
 * 对应后端 TrackingController.impTracking
 * GET /v1/track/imp?tk=xxx （通过网关前缀 /tracking-api 转发）
 * @param {string} tk - 追踪 token
 */
export function trackImp(tk) {
  return request({
    baseURL: '', // 不使用默认的 /dev-api 前缀，直接走 Nginx 配置的 /tracking-api
    url: `${TRACKING_BASE_PATH}/imp`,
    method: 'get',
    headers: {
      isToken: false, // 追踪请求通常无需登录态
    },
    params: { tk },
  });
}

/**
 * 广告点击追踪
 * 对应后端 TrackingController.clickTracking
 * GET /v1/track/click?tk=xxx （通过网关前缀 /tracking-api 转发）
 * @param {string} tk - 追踪 token
 */
export function trackClick(tk) {
  return request({
    baseURL: '',
    url: `${TRACKING_BASE_PATH}/click`,
    method: 'get',
    headers: {
      isToken: false,
    },
    params: { tk },
  });
}

