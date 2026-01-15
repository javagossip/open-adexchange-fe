import request from '@/utils/request';

// 分页查询地域包列表
export function listRegionPkg(query) {
  return request({
    url: '/v1/region-pkgs',
    method: 'get',
    params: query,
  });
}

// 查询地域包详情
export function getRegionPkg(id) {
  return request({
    url: '/v1/region-pkgs/' + id,
    method: 'get',
  });
}

// 新增地域包
export function addRegionPkg(data) {
  return request({
    url: '/v1/region-pkgs',
    method: 'post',
    data: data,
  });
}

// 修改地域包
export function updateRegionPkg(data) {
  return request({
    url: '/v1/region-pkgs',
    method: 'put',
    data: data,
  });
}

// 删除地域包
export function delRegionPkg(id) {
  return request({
    url: '/v1/region-pkgs/' + id,
    method: 'delete',
  });
}


