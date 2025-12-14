import request from '@/utils/request';

// 查询账户交易列表
export function list(query) {
  return request({
    url: '/v1/statistics/list',
    method: 'get',
    params: query,
  });
}

// 导出账户交易列表
export function exportList(query) {
  return request({
    url: '/v1/statistics/excel',
    method: 'post',
    data: query, // POST 请求参数放在 data 中
    responseType: 'blob', // 关键：指定响应类型为 blob，以便接收二进制文件流
  });
}
