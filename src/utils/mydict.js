// src/hooks/useMyDict.js

import { ref, toRefs } from 'vue';
import useDictStore from '@/store/modules/dict';
// 重点：导入你在上一步创建的 API 函数 src/api/system/customDict.js
import { getMyDicts } from '@/api/system/customDict';

/**
 * 获取你自定义的字典数据 Hook
 */
export function useMyDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType) => {
      res.value[dictType] = [];
      // 1. 优先从 Pinia 缓存 Store 中获取
      const dicts = useDictStore().getDict(dictType);
      console.log(`dicts:`, dicts);
      if (dicts) {
        res.value[dictType] = dicts;
        return; // 命中缓存，直接返回
      }

      // 2. 如果缓存中没有，则调用你自己的 API
      getMyDicts(dictType)
        .then((response) => {
          const list = response.data;

          res.value[dictType] = list.map((item) => ({
            label: item.label,
            // 将 value 映射到数据库的 dict_key 字段
            value: item.value,
          }));
          // 将获取并格式化后的数据，存入 Pinia Store 以便下次复用
          useDictStore().setDict(dictType, res.value[dictType]);
          console.log(`[useMyDict] 获取字典 [${dictType}] 成功:`, res.value[dictType]);
        })
        .catch((error) => {
          console.error(`[useMyDict] 获取字典 [${dictType}] 失败:`, error);
        });
    });
    return toRefs(res.value);
  })();
}
