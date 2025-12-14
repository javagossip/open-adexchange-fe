// src/api/myDictApi.js

import request from '@/utils/request'; // 复用项目中封装好的 axios 实例

/**
 * 根据字典类型，获取你自己的字典数据
 * @param {string} dictType - 你在后端定义的字典类型标识
 */
export function getMyDicts(dictType) {
  return request({
    // 1. URL路径中不再拼接 dictType
    url: '/v1/dicts/options',
    method: 'get',
    // 2. 将 dictType 作为查询参数传递
    params: {
      // 这里的 'type' 必须和后端 @RequestParam 注解中定义的名字一致
      // 例如 @RequestParam("type") 就用 'type'
      // 如果后端是 @RequestParam("dictType")，这里就用 'dictType'
      type: dictType,
    },
  });
}
