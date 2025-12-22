import request from '@/utils/request';

// 通用文件上传（后端：/v1/files/upload，字段名：file）
export function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/v1/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false,
    },
  });
}


