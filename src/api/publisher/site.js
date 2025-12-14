import request from '@/utils/request';

// 查询站点列表
export function listSite(query) {
  return request({
    url: '/v1/sites',
    method: 'get',
    params: query,
  });
}

// 查询站点详细
export function getSite(id) {
  return request({
    url: '/v1/sites/' + id,
    method: 'get',
  });
}

// 新增站点
export function addSite(data) {
  return request({
    url: '/v1/sites',
    method: 'post',
    data: data,
  });
}

// 修改站点
export function updateSite(data) {
  return request({
    url: '/v1/sites',
    method: 'put',
    data: data,
  });
}

// 删除站点
export function delSite(id) {
  return request({
    url: '/v1/sites/' + id,
    method: 'delete',
  });
}

// 启用站点
export function enableSite(id) {
  return request({
    url: '/v1/sites/' + id + '/enable',
    method: 'put',
  });
}

// 禁用站点
export function disableSite(id) {
  return request({
    url: '/v1/sites/' + id + '/disable',
    method: 'put',
  });
}

