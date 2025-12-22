import request from '@/utils/request';

// 查询广告位列表
export function listAdPlacement(query) {
  return request({
    url: '/v1/ad-placements',
    method: 'get',
    params: query,
  });
}

// 查询广告位详细
export function getAdPlacement(id) {
  return request({
    url: '/v1/ad-placements/' + id,
    method: 'get',
  });
}

// 新增广告位
export function addAdPlacement(data) {
  return request({
    url: '/v1/ad-placements',
    method: 'post',
    data: data,
  });
}

// 修改广告位
export function updateAdPlacement(data) {
  return request({
    url: '/v1/ad-placements',
    method: 'put',
    data: data,
  });
}

// 删除广告位
export function delAdPlacement(id) {
  return request({
    url: '/v1/ad-placements/' + id,
    method: 'delete',
  });
}

// 启用广告位
export function enableAdPlacement(id) {
  return request({
    url: '/v1/ad-placements/' + id + '/enable',
    method: 'put',
  });
}

// 禁用广告位
export function disableAdPlacement(id) {
  return request({
    url: '/v1/ad-placements/' + id + '/disable',
    method: 'put',
  });
}

