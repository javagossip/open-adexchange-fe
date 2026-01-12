#!/bin/bash

# 阿里云镜像仓库配置
REGISTRY="registry.cn-beijing.aliyuncs.com"
NAMESPACE="oax"
IMAGE_NAME="oax-fe"
FULL_IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

# 获取版本号，默认使用 latest
VERSION=${1:-latest}

echo "=========================================="
echo "  构建 Docker 镜像: ${FULL_IMAGE}:${VERSION}"
echo "=========================================="

# 进入脚本所在目录
cd "$(dirname "$0")"

# 构建镜像
echo ""
echo "[1/4] 构建 Docker 镜像..."
docker build -t ${FULL_IMAGE}:${VERSION} .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi
echo "✅ 镜像构建成功"

# 如果版本不是 latest，同时打上 latest 标签
if [ "${VERSION}" != "latest" ]; then
    echo ""
    echo "[2/4] 打 latest 标签..."
    docker tag ${FULL_IMAGE}:${VERSION} ${FULL_IMAGE}:latest
    echo "✅ 标签添加成功"
else
    echo ""
    echo "[2/4] 跳过 latest 标签（已是 latest）"
fi

# 登录阿里云镜像仓库
echo ""
echo "[3/4] 登录阿里云镜像仓库..."
echo "请输入阿里云镜像仓库密码："
docker login --username=${ALIYUN_DOCKER_USERNAME:-请设置ALIYUN_DOCKER_USERNAME环境变量} ${REGISTRY}

if [ $? -ne 0 ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"

# 推送镜像
echo ""
echo "[4/4] 推送镜像到阿里云镜像仓库..."
docker push ${FULL_IMAGE}:${VERSION}

if [ $? -ne 0 ]; then
    echo "❌ 镜像推送失败"
    exit 1
fi

# 如果版本不是 latest，同时推送 latest 标签
if [ "${VERSION}" != "latest" ]; then
    docker push ${FULL_IMAGE}:latest
fi

echo ""
echo "=========================================="
echo "✅ 镜像推送成功!"
echo "  镜像地址: ${FULL_IMAGE}:${VERSION}"
if [ "${VERSION}" != "latest" ]; then
    echo "  镜像地址: ${FULL_IMAGE}:latest"
fi
echo "=========================================="

