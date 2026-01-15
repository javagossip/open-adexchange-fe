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

// 根据地区编码列表获取地区信息
export function getDistrictsByCodes(codes) {
  return request({
    url: '/v1/sys-dicts/districts/by-codes',
    method: 'post',
    data: codes,
  });
}

// 获取地域等级列表
export function getRegionLevels() {
  return request({
    url: '/v1/sys-dicts/region-levels',
    method: 'get',
  });
}

