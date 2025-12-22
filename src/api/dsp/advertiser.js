import request from '@/utils/request';

// 查询广告主列表
export function listAdvertiser(query) {
  return request({
    url: '/v1/advertisers',
    method: 'get',
    params: query,
  });
}

// 查询广告主详细
export function getAdvertiser(id) {
  return request({
    url: '/v1/advertisers/' + id,
    method: 'get',
  });
}

// 查询广告主聚合详情（包括基本信息、资质、审核信息）
export function getAdvertiserDetail(id) {
  return request({
    url: '/v1/advertisers/' + id + '/detail',
    method: 'get',
  });
}

// 新增广告主
export function addAdvertiser(data) {
  return request({
    url: '/v1/advertisers',
    method: 'post',
    data: data,
  });
}

// 修改广告主
export function updateAdvertiser(data) {
  return request({
    url: '/v1/advertisers',
    method: 'put',
    data: data,
  });
}

// 删除广告主
export function delAdvertiser(id) {
  return request({
    url: '/v1/advertisers/' + id,
    method: 'delete',
  });
}

// 启用广告主
export function enableAdvertiser(id) {
  return request({
    url: '/v1/advertisers/' + id + '/enable',
    method: 'put',
  });
}

// 禁用广告主
export function disableAdvertiser(id) {
  return request({
    url: '/v1/advertisers/' + id + '/disable',
    method: 'put',
  });
}

// 行业资质管理

// 为广告主添加行业资质
export function addAdvertiserLicense(advertiserId, data) {
  return request({
    url: '/v1/advertisers/' + advertiserId + '/licenses',
    method: 'post',
    data: data,
  });
}

// 更新广告主行业资质
export function updateAdvertiserLicense(licenseId, data) {
  return request({
    url: '/v1/advertisers/licenses/' + licenseId,
    method: 'put',
    data: data,
  });
}

// 删除广告主行业资质
export function deleteAdvertiserLicense(licenseId) {
  return request({
    url: '/v1/advertisers/licenses/' + licenseId,
    method: 'delete',
  });
}

// 获取广告主行业资质详情
export function getAdvertiserLicense(licenseId) {
  return request({
    url: '/v1/advertisers/licenses/' + licenseId,
    method: 'get',
  });
}

// 获取广告主的所有行业资质
export function getAdvertiserLicenses(advertiserId) {
  return request({
    url: '/v1/advertisers/' + advertiserId + '/licenses',
    method: 'get',
  });
}
