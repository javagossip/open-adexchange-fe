import request from '@/utils/request';

// 查询分类列表
export function listCategory(query) {
  return request({
    url: '/v1/categories',
    method: 'get',
    params: query,
  });
}

// 查询分类详细
export function getCategory(id) {
  return request({
    url: '/v1/categories/' + id,
    method: 'get',
  });
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/v1/categories',
    method: 'post',
    data: data,
  });
}

// 修改分类
export function updateCategory(data) {
  return request({
    url: '/v1/categories',
    method: 'put',
    data: data,
  });
}

// 删除分类
export function delCategory(id) {
  return request({
    url: '/v1/categories/' + id,
    method: 'delete',
  });
}

// 根据父级分类编码和分类体系查询分类列表
export function listCategoriesByParentCode(parentCode, system) {
  return request({
    url: '/v1/categories/list',
    method: 'get',
    params: { parentCode: parentCode, system: system },
  });
}

