import request from '@/utils/request';

// 分页查询日志采样配置
export function listLogSamplingConfig(query) {
  return request({
    url: '/v1/log-sampling-configs',
    method: 'get',
    params: query,
  });
}

// 获取日志采样配置详情
export function getLogSamplingConfig(id) {
  return request({
    url: '/v1/log-sampling-configs/' + id,
    method: 'get',
  });
}

// 新增日志采样配置
export function addLogSamplingConfig(data) {
  return request({
    url: '/v1/log-sampling-configs',
    method: 'post',
    data: data,
  });
}

// 更新日志采样配置
export function updateLogSamplingConfig(data) {
  return request({
    url: '/v1/log-sampling-configs',
    method: 'put',
    data: data,
  });
}

// 删除日志采样配置
export function delLogSamplingConfig(id) {
  return request({
    url: '/v1/log-sampling-configs/' + id,
    method: 'delete',
  });
}

