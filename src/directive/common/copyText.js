/**
 * v-copyText 复制文本内容
 * Copyright (c) 2022 ruoyi
 */
export default {
  // 推荐使用 mounted 钩子进行 DOM 操作和事件监听，因为此时元素已被插入到 DOM
  mounted(el, binding) {
    const { value, arg } = binding;
    // 根据 arg 判断是复制的值还是回调函数
    if (arg === 'callback') {
      el.$copyCallback = value; // 存储回调函数
    } else {
      el.$copyValue = value; // 存储要复制的值
    }

    // 定义复制处理函数
    el.handler = () => {
      const textToCopy = el.$copyValue; // 获取要复制的文本
      if (textToCopy !== undefined && textToCopy !== null) {
        // 确保有值才尝试复制
        const isSuccess = copyTextToClipboard(textToCopy); // 执行复制操作并获取结果

        if (isSuccess) {
          // 如果复制成功，触发自定义事件 'copy-text-success'
          // 这样可以在 Vue 组件中通过 @copy-text-success 监听
          el.dispatchEvent(new CustomEvent('copy-text-success', { detail: textToCopy }));
          // 同时，如果原始的 $copyCallback 存在（通过 v-copyText:callback 设置），也调用它
          if (el.$copyCallback) {
            el.$copyCallback(textToCopy);
          }
        } else {
          // 如果复制失败，可以触发一个失败事件或者进行其他处理
          el.dispatchEvent(new CustomEvent('copy-text-fail', { detail: textToCopy }));
        }
      }
    };

    // 绑定点击事件
    el.addEventListener('click', el.handler);
  },
  // 确保在值更新时也更新指令内部的 $copyValue
  updated(el, binding) {
    const { value, arg } = binding;
    if (arg === 'callback') {
      el.$copyCallback = value;
    } else {
      el.$copyValue = value;
    }
  },
  // 在组件卸载前移除事件监听器，避免内存泄漏
  beforeUnmount(el) {
    if (el.handler) {
      el.removeEventListener('click', el.handler);
    }
  },
};

// 复制文本到剪贴板的辅助函数
function copyTextToClipboard(input, { target = document.body } = {}) {
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement;

  element.value = input;

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '');

  element.style.contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt'; // Prevent zooming on iOS

  const selection = document.getSelection();
  const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);

  target.append(element);
  element.select();

  // Explicit selection workaround for iOS
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch (err) {
    console.error('复制到剪贴板失败:', err); // 打印错误信息方便调试
  }

  element.remove();

  if (originalRange) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement) {
    // 确保之前聚焦的元素还在文档中且可聚焦
    if (
      document.body.contains(previouslyFocusedElement) &&
      typeof previouslyFocusedElement.focus === 'function'
    ) {
      previouslyFocusedElement.focus();
    }
  }

  return isSuccess;
}
