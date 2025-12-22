import request from '@/utils/request';

// 查询DSP列表
export function listDsp(query) {
  return request({
    url: '/v1/dsps',
    method: 'get',
    params: query,
  });
}

// 查询DSP详细
export function getDsp(id) {
  return request({
    url: '/v1/dsps/' + id,
    method: 'get',
  });
}

// 新增DSP
export function addDsp(data) {
  return request({
    url: '/v1/dsps',
    method: 'post',
    data: data,
  });
}

// 修改DSP
export function updateDsp(data) {
  return request({
    url: '/v1/dsps',
    method: 'put',
    data: data,
  });
}

// 删除DSP
export function delDsp(id) {
  return request({
    url: '/v1/dsps/' + id,
    method: 'delete',
  });
}

// 启用DSP
export function enableDsp(id) {
  return request({
    url: '/v1/dsps/' + id + '/enable',
    method: 'put',
  });
}

// 禁用DSP
export function disableDsp(id) {
  return request({
    url: '/v1/dsps/' + id + '/disable',
    method: 'put',
  });
}

// DSP设置
export function dspSetting(dspId, data) {
  return request({
    url: '/v1/dsps/' + dspId + '/setting',
    method: 'put',
    data: data,
  });
}

// 获取DSP设置
export function getDspSetting(dspId) {
  return request({
    url: '/v1/dsps/' + dspId + '/setting',
    method: 'get',
  });
}

