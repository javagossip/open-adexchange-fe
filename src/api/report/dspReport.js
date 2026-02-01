import request from '@/utils/request';

/**
 * 查询DSP报表列表
 * @param {Object} query 查询参数
 * @param {string} [query.dspName] DSP名称(可选,模糊匹配)
 * @param {string} [query.dspCode] DSP编码(精确匹配)
 * @param {number} [query.startDate] 开始日期(yyyyMMdd格式)
 * @param {number} [query.endDate] 结束日期(yyyyMMdd格式)
 * @param {number} [query.pageNo] 页码, 默认1
 * @param {number} [query.pageSize] 每页条数, 默认20
 */
export function listDspReport(query) {
  return request({
    url: '/v1/reports/dsp',
    method: 'get',
    params: query,
  });
}
