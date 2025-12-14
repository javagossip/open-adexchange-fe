import request from '@/utils/request';

// 查询发布商列表
export function listPublisher(query) {
  return request({
    url: '/v1/publishers',
    method: 'get',
    params: query,
  });
}

// 查询发布商详细
export function getPublisher(id) {
  return request({
    url: '/v1/publishers/' + id,
    method: 'get',
  });
}

// 新增发布商
export function addPublisher(data) {
  return request({
    url: '/v1/publishers',
    method: 'post',
    data: data,
  });
}

// 修改发布商
export function updatePublisher(data) {
  return request({
    url: '/v1/publishers',
    method: 'put',
    data: data,
  });
}

// 删除发布商
export function delPublisher(id) {
  return request({
    url: '/v1/publishers/' + id,
    method: 'delete',
  });
}

// 启用发布商
export function enablePublisher(id) {
  return request({
    url: '/v1/publishers/' + id + '/enable',
    method: 'put',
  });
}

// 禁用发布商
export function disablePublisher(id) {
  return request({
    url: '/v1/publishers/' + id + '/disable',
    method: 'put',
  });
}

