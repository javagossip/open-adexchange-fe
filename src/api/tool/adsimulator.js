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

