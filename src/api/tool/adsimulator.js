import request from '@/utils/request';

/**
 * 模拟拉取广告
 * @param {Object} data - 广告请求对象 AdGetRequest
 */
export function fetchAd(data) {
  return request({
    baseURL: '', // 不使用默认的 /dev-api 前缀
    url: '/publisher-api/v1/ads',
    method: 'post',
    data: data,
  });
}

/**
 * 广告引擎诊断 - 根据广告请求构建索引key
 * @param {Object} data - 广告请求对象 AdGetRequest
 */
export function buildIndexKeys(data) {
  return request({
    baseURL: '',
    url: '/publisher-api/v1/diagnostics/index-keys',
    method: 'post',
    data: data,
  });
}

/**
 * 广告引擎诊断 - 检查缓存数据
 * @param {string} key - 缓存键（如 DSP ID、站点 ID 等）
 * @param {number} cacheType - 缓存类型 1:PUBLISHER 2:SITE 3:SITE_AD_PLACEMENT 4:AD_PLACEMENT 5:DSP
 */
export function inspectCacheData(key, cacheType) {
  return request({
    baseURL: '',
    url: '/publisher-api/v1/diagnostics/cache-data/inspect',
    method: 'get',
    params: { key, cacheType },
  });
}

/**
 * 广告引擎诊断 - 根据广告请求匹配对应的 DSP
 * @param {Object} data - 广告请求对象 AdGetRequest
 */
export function matchDsps(data) {
  return request({
    baseURL: '',
    url: '/publisher-api/v1/diagnostics/match-dsps',
    method: 'post',
    data: data,
  });
}

