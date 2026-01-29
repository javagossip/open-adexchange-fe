import request from '@/utils/request';

/**
 * 查询媒体报表列表
 * @param {Object} query 查询参数
 * @param {number} [query.publisherId] 媒体ID(可选)
 * @param {string} [query.publisherName] 媒体名称(可选,模糊匹配)
 * @param {number} [query.startDate] 开始日期(yyyyMMdd格式)
 * @param {number} [query.endDate] 结束日期(yyyyMMdd格式)
 * @param {number} [query.pageNo] 页码, 默认1
 * @param {number} [query.pageSize] 每页条数, 默认20
 */
export function listPublisherReport(query) {
  return request({
    url: '/v1/reports/publisher',
    method: 'get',
    params: query,
  });
}

/**
 * 查询广告位报表列表（媒体下钻）
 * @param {Object} query 查询参数
 * @param {number} query.publisherId 媒体ID(必填)
 * @param {number} [query.siteId] 站点/APP ID(可选)
 * @param {number} [query.startDate] 开始日期(yyyyMMdd格式)
 * @param {number} [query.endDate] 结束日期(yyyyMMdd格式)
 * @param {number} [query.pageNo] 页码, 默认1
 * @param {number} [query.pageSize] 每页条数, 默认20
 */
export function listAdSlotReport(query) {
  return request({
    url: '/v1/reports/publisher/adslot',
    method: 'get',
    params: query,
  });
}
