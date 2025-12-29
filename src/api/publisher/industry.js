import request from '@/utils/request';

// 查询行业列表
export function listIndustry(query) {
  return request({
    url: '/v1/industries',
    method: 'get',
    params: query,
  });
}

// 查询行业详细
export function getIndustry(id) {
  return request({
    url: '/v1/industries/' + id,
    method: 'get',
  });
}

// 新增行业
export function addIndustry(data) {
  return request({
    url: '/v1/industries',
    method: 'post',
    data: data,
  });
}

// 修改行业
export function updateIndustry(data) {
  return request({
    url: '/v1/industries',
    method: 'put',
    data: data,
  });
}

// 删除行业
export function delIndustry(id) {
  return request({
    url: '/v1/industries/' + id,
    method: 'delete',
  });
}

// 根据父级ID查询行业列表
export function listIndustriesByParentId(parentId) {
  return request({
    url: '/v1/industries/list',
    method: 'get',
    params: { parentId: parentId },
  });
}

