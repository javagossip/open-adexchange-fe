#!/bin/bash

# 阿里云镜像仓库配置
REGISTRY="registry.cn-beijing.aliyuncs.com"
NAMESPACE="oax"
IMAGE_NAME="oax-fe"
FULL_IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

# 默认值
VERSION="latest"
NO_CACHE=""

# 解析参数
for arg in "$@"; do
    case $arg in
        --no-cache)
            NO_CACHE="--no-cache"
            ;;
        -h|--help)
            echo "用法: $0 [版本号] [--no-cache]"
            echo ""
            echo "参数:"
            echo "  版本号      镜像版本标签，默认为 latest"
            echo "  --no-cache  禁用 Docker 构建缓存"
            echo ""
            echo "示例:"
            echo "  $0                    # 构建 latest 版本，使用缓存"
            echo "  $0 v1.0.0             # 构建 v1.0.0 版本，使用缓存"
            echo "  $0 --no-cache         # 构建 latest 版本，禁用缓存"
            echo "  $0 v1.0.0 --no-cache  # 构建 v1.0.0 版本，禁用缓存"
            exit 0
            ;;
        *)
            # 非选项参数作为版本号
            VERSION="$arg"
            ;;
    esac
done

echo "=========================================="
echo "  构建 Docker 镜像: ${FULL_IMAGE}:${VERSION}"
if [ -n "${NO_CACHE}" ]; then
    echo "  构建模式: 禁用缓存"
fi
echo "=========================================="

# 进入脚本所在目录
cd "$(dirname "$0")"

# 构建镜像
echo ""
echo "[1/4] 构建 Docker 镜像..."
docker build ${NO_CACHE} -t ${FULL_IMAGE}:${VERSION} .

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

# 检查是否已经登录（通过查看 docker config 或尝试访问仓库）
echo ""
echo "[3/4] 检查阿里云镜像仓库登录状态..."

# 检查 ~/.docker/config.json 中是否已存在该仓库的认证信息
if grep -q "${REGISTRY}" ~/.docker/config.json 2>/dev/null; then
    echo "✅ 检测到已存在的登录凭证，跳过登录步骤"
else
    echo "⚠️  未检测到登录凭证，需要登录..."
    echo "请输入阿里云镜像仓库密码："
    docker login --username=${ACR_USERNAME:-请设置ALIYUN_DOCKER_USERNAME环境变量} ${REGISTRY}
    
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
    echo "✅ 登录成功"
fi

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

