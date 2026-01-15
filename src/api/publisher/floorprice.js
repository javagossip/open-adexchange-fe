import request from '@/utils/request';

// 查询底价列表（分页）
export function listFloorPrice(query) {
  return request({
    url: '/v1/floor-prices',
    method: 'get',
    params: query,
  });
}

// 查询底价详情
export function getFloorPrice(id) {
  return request({
    url: '/v1/floor-prices/' + id,
    method: 'get',
  });
}

// 新增底价
export function addFloorPrice(data) {
  return request({
    url: '/v1/floor-prices',
    method: 'post',
    data: data,
  });
}

// 修改底价
export function updateFloorPrice(data) {
  return request({
    url: '/v1/floor-prices',
    method: 'put',
    data: data,
  });
}

// 删除底价
export function delFloorPrice(id) {
  return request({
    url: '/v1/floor-prices/' + id,
    method: 'delete',
  });
}

