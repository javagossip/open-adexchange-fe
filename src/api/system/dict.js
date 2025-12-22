import request from '@/utils/request';

// 获取国家列表，支持模糊搜索
export function getCountries(searchKey) {
  return request({
    url: '/v1/sys-dicts/countries',
    method: 'get',
    params: { searchKey },
  });
}

// 获取行政区划，通过parentId获取下一级数据
export function getDistricts(parentId = 0) {
  return request({
    url: '/v1/sys-dicts/districts',
    method: 'get',
    params: { parentId },
  });
}

