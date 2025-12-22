import request from '@/utils/request';

// 查询媒体广告位列表
export function listSiteAdPlacement(query) {
  return request({
    url: '/v1/site-ad-placements',
    method: 'get',
    params: query,
  });
}

// 查询媒体广告位详细
export function getSiteAdPlacement(id) {
  return request({
    url: '/v1/site-ad-placements/' + id,
    method: 'get',
  });
}

// 新增媒体广告位
export function addSiteAdPlacement(data) {
  return request({
    url: '/v1/site-ad-placements',
    method: 'post',
    data: data,
  });
}

// 修改媒体广告位
export function updateSiteAdPlacement(data) {
  return request({
    url: '/v1/site-ad-placements',
    method: 'put',
    data: data,
  });
}

// 删除媒体广告位
export function delSiteAdPlacement(id) {
  return request({
    url: '/v1/site-ad-placements/' + id,
    method: 'delete',
  });
}

// 启用媒体广告位
export function enableSiteAdPlacement(id) {
  return request({
    url: '/v1/site-ad-placements/' + id + '/enable',
    method: 'put',
  });
}

// 禁用媒体广告位
export function disableSiteAdPlacement(id) {
  return request({
    url: '/v1/site-ad-placements/' + id + '/disable',
    method: 'put',
  });
}

