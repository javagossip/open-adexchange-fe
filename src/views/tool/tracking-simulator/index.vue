<template>
  <div class="app-container tracking-simulator">
    <el-row :gutter="20">
      <!-- 左侧：tk 生成 + 请求配置 -->
      <el-col :span="12">
        <el-card class="request-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Aim /></el-icon>
                广告追踪模拟
              </span>
              <div class="header-actions">
                <el-button type="warning" size="small" @click="resetForm">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>
          </template>

          <el-form :model="form" label-width="100px" size="default">
            <!-- 一、TrackToken 生成 -->
            <el-divider content-position="left">
              <el-icon><Edit /></el-icon> TrackToken 生成
            </el-divider>

            <el-form-item label="密钥 (TK)">
              <el-input
                v-model="form.secret"
                type="password"
                show-password
                placeholder="输入 oax.tracking.secret（仅本地调试用）"
              />
            </el-form-item>

            <el-form-item label="过期时间">
              <el-input-number
                v-model="form.ttlMinutes"
                :min="1"
                :max="1440"
                :step="5"
              />
              <span class="ttl-suffix">分钟后过期</span>
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="请求ID reqId">
                  <el-input v-model="trackToken.reqId" placeholder="自动生成或手填" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="曝光ID impId">
                  <el-input v-model="trackToken.impId" placeholder="自动生成或手填" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="媒体ID publisherId">
                  <el-input v-model="trackToken.publisherId" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="广告位ID adSotId">
                  <el-input v-model="trackToken.adSotId" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="创意ID crid">
                  <el-input v-model="trackToken.crid" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="广告主ID advId">
                  <el-input v-model="trackToken.advId" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="DSP ID dspId">
                  <el-input v-model="trackToken.dspId" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="价格 price">
                  <el-input v-model="trackToken.price" placeholder="如: 1.23" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="价格模式">
                  <el-select
                    v-model="trackToken.priceMode"
                    placeholder="选择结算模式"
                    style="width: 100%"
                  >
                    <el-option label="CPM" value="CPM" />
                    <el-option label="CPC" value="CPC" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="设备 UA">
              <el-input
                v-model="trackToken.ua"
                type="textarea"
                :rows="2"
                placeholder="User-Agent"
              />
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="IP">
                  <el-input v-model="trackToken.ip" placeholder="IPv4" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="OS / 版本">
                  <el-input
                    v-model="trackToken.os"
                    placeholder="如: ios / android"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="OSV">
                  <el-input v-model="trackToken.osv" placeholder="如: 17.0" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="ext(JSON)">
              <el-input
                v-model="trackTokenExtRaw"
                type="textarea"
                :rows="2"
                placeholder='可选，例如 {"k":"v"}'
              />
            </el-form-item>

            <div class="tk-actions">
              <el-button
                size="small"
                type="primary"
                plain
                @click="autoFillTrackToken"
              >
                <el-icon><MagicStick /></el-icon>
                自动填充示例字段
              </el-button>
              <el-button
                size="small"
                type="success"
                @click="generateTk"
                :loading="tkLoading"
              >
                生成 tk
              </el-button>
            </div>

            <el-form-item label="生成的 tk">
              <el-input
                v-model="form.tk"
                type="textarea"
                :rows="3"
                placeholder="点击“生成 tk”自动生成，或粘贴已有 tk"
                clearable
              />
            </el-form-item>

            <!-- 二、请求配置 -->
            <el-divider content-position="left">
              <el-icon><Setting /></el-icon> 追踪请求
            </el-divider>

            <el-form-item label="请求类型">
              <el-radio-group v-model="form.type">
                <el-radio-button label="imp">曝光</el-radio-button>
                <el-radio-button label="click">点击</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="说明">
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="接口说明"
                description="后端 TrackingController 提供 /v1/track/imp 与 /v1/track/click 两个 GET 接口，通过 Nginx 映射为 /tracking-api/v1/track/*。此页面仅用于模拟曝光/点击打点请求。"
              />
            </el-form-item>

            <el-form-item label="请求 URL">
              <el-input v-model="currentUrl" readonly>
                <template #append>
                  <el-button text @click="copyUrl">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="sendTrack"
              >
                <el-icon><Promotion /></el-icon>
                发送追踪请求
              </el-button>
              <el-button
                type="success"
                size="large"
                @click="openInNewTab"
              >
                以像素方式打开
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：结果与请求日志 -->
      <el-col :span="12">
        <el-card class="response-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><DataAnalysis /></el-icon>
                调用结果
              </span>
              <el-tag
                v-if="lastResult.status"
                :type="lastResult.status === 'success' ? 'success' : 'danger'"
                size="small"
              >
                {{ lastResult.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!lastResult.time" class="empty-response">
            <el-empty description="暂无请求，请先在左侧发送追踪请求">
              <template #image>
                <el-icon :size="60" color="#c0c4cc"><DataLine /></el-icon>
              </template>
            </el-empty>
          </div>

          <div v-else class="response-content">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="请求时间">
                {{ lastResult.time }}
              </el-descriptions-item>
              <el-descriptions-item label="请求类型">
                <el-tag size="small">
                  {{ lastResult.type === 'imp' ? '曝光（imp）' : '点击（click）' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="HTTP 状态码">
                {{ lastResult.httpStatus || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="错误信息">
                <span v-if="lastResult.error">{{ lastResult.error }}</span>
                <span v-else>-</span>
              </el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">最近请求记录</el-divider>
            <el-timeline class="request-timeline">
              <el-timeline-item
                v-for="(item, index) in requestHistory"
                :key="index"
                :timestamp="item.time"
                :type="item.status === 'success' ? 'success' : 'danger'"
              >
                <div class="timeline-item">
                  <div class="timeline-main">
                    <span class="timeline-type">
                      {{ item.type === 'imp' ? '曝光' : '点击' }}
                    </span>
                    <span class="timeline-status">
                      {{ item.status === 'success' ? '成功' : '失败' }}
                    </span>
                  </div>
                  <div class="timeline-url">{{ item.url }}</div>
                  <div v-if="item.error" class="timeline-error">{{ item.error }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="TrackingSimulator">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Aim,
  Edit,
  MagicStick,
  Setting,
  Refresh,
  Promotion,
  CopyDocument,
  DataAnalysis,
  DataLine,
} from '@element-plus/icons-vue';
import { trackImp, trackClick } from '@/api/tool/tracking';

const form = reactive({
  secret: '',
  ttlMinutes: 10,
  tk: '',
  type: 'imp', // imp | click
});

const loading = ref(false);
const tkLoading = ref(false);
const requestHistory = ref([]);

// TrackToken 表单（对应后端 top.openadexchange.dto.TrackToken）
const trackToken = reactive({
  reqId: '',
  impId: '',
  publisherId: '',
  adSotId: '',
  crid: '',
  advId: '',
  dspId: '',
  ts: 0,
  expireAt: 0,
  ua: '',
  ip: '',
  ipv6: '',
  price: '',
  os: '',
  osv: '',
  priceMode: '',
});

// ext 原始 JSON 文本
const trackTokenExtRaw = ref('');

// 当前请求 URL（仅用于展示）
const currentUrl = computed(() => {
  const base = '/tracking-api/v1/track';
  const path = form.type === 'imp' ? '/imp' : '/click';
  const tk = encodeURIComponent(form.tk || '');
  return `${base}${path}?tk=${tk || '{tk}'}`;
});

const lastResult = computed(() => {
  if (!requestHistory.value.length) {
    return {};
  }
  return requestHistory.value[0];
});

function pushHistory(entry) {
  requestHistory.value.unshift(entry);
  if (requestHistory.value.length > 20) {
    requestHistory.value = requestHistory.value.slice(0, 20);
  }
}

function resetForm() {
  form.secret = '';
  form.ttlMinutes = 10;
  form.tk = '';
  form.type = 'imp';
  Object.assign(trackToken, {
    reqId: '',
    impId: '',
    publisherId: '',
    adSotId: '',
    crid: '',
    advId: '',
    dspId: '',
    ts: 0,
    expireAt: 0,
    ua: '',
    ip: '',
    ipv6: '',
    price: '',
    os: '',
    osv: '',
    priceMode: '',
  });
  trackTokenExtRaw.value = '';
}

// 生成简易 UUID
function genId() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 自动填充一份示例 TrackToken 字段
function autoFillTrackToken() {
  const now = Date.now();
  const ttl = (form.ttlMinutes || 10) * 60 * 1000;
  Object.assign(trackToken, {
    reqId: trackToken.reqId || genId(),
    impId: trackToken.impId || genId(),
    publisherId: trackToken.publisherId || 'pub-1001',
    adSotId: trackToken.adSotId || 'adp-10001',
    crid: trackToken.crid || 'cr-20001',
    advId: trackToken.advId || 'adv-30001',
    dspId: trackToken.dspId || 'dsp-demo',
    ts: now,
    expireAt: now + ttl,
    ua:
      trackToken.ua ||
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ip: trackToken.ip || '223.104.63.88',
    ipv6: trackToken.ipv6 || '',
    price: trackToken.price || '1.23',
    os: trackToken.os || 'ios',
    osv: trackToken.osv || '17.0',
    priceMode: trackToken.priceMode || 'CPM',
  });
  if (!trackTokenExtRaw.value) {
    trackTokenExtRaw.value = '{"scene":"demo","channel":"ui"}';
  }
  ElMessage.success('已自动填充 TrackToken 示例字段');
}

// Base64 URL 安全编码（不带 padding）
function base64UrlEncode(bytes) {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // 浏览器环境保证 btoa 存在
  // eslint-disable-next-line no-undef
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 计算 HMAC-SHA256 并输出 hex（与后端 HmacUtils.hmacSha256 一致）
async function hmacSha256Hex(key, dataBytes) {
  const enc = new TextEncoder();
  const keyBytes = enc.encode(key);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  const sigBytes = new Uint8Array(sig);
  let hex = '';
  for (let i = 0; i < sigBytes.length; i++) {
    hex += sigBytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// 生成 tk: Base64URL(payloadBytes) + '.' + hexSignature
async function generateTk() {
  if (!form.secret) {
    ElMessage.warning('请先填写密钥（oax.tracking.secret）');
    return;
  }
  tkLoading.value = true;
  try {
    const now = Date.now();
    const ttl = (form.ttlMinutes || 10) * 60 * 1000;
    trackToken.ts = now;
    trackToken.expireAt = now + ttl;

    let ext = undefined;
    if (trackTokenExtRaw.value && trackTokenExtRaw.value.trim()) {
      try {
        ext = JSON.parse(trackTokenExtRaw.value);
      } catch (e) {
        ElMessage.error('ext 不是合法的 JSON');
        tkLoading.value = false;
        return;
      }
    }

    const payloadObj = {
      ...trackToken,
      ext,
    };
    if (!ext) {
      delete payloadObj.ext;
    }

    const json = JSON.stringify(payloadObj);
    const enc = new TextEncoder();
    const bytes = enc.encode(json);
    const payloadBase64 = base64UrlEncode(bytes);
    const signatureHex = await hmacSha256Hex(form.secret, bytes);
    form.tk = `${payloadBase64}.${signatureHex}`;
    ElMessage.success('tk 已生成');
  } catch (e) {
    console.error(e);
    ElMessage.error('生成 tk 失败');
  } finally {
    tkLoading.value = false;
  }
}

async function sendTrack() {
  if (!form.tk) {
    ElMessage.warning('请先填写 tk');
    return;
  }
  loading.value = true;
  const now = new Date();
  const timeStr = now.toLocaleString();
  const url = currentUrl.value;

  try {
    const fn = form.type === 'imp' ? trackImp : trackClick;
    const res = await fn(form.tk);

    pushHistory({
      time: timeStr,
      type: form.type,
      url,
      status: 'success',
      httpStatus: res.code || 200,
      error: '',
    });
    ElMessage.success('追踪请求发送成功（后端异步处理）');
  } catch (error) {
    pushHistory({
      time: timeStr,
      type: form.type,
      url,
      status: 'error',
      httpStatus: error?.response?.status,
      error: error?.message || '未知错误',
    });
    ElMessage.error('追踪请求失败：' + (error?.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

function openInNewTab() {
  if (!form.tk) {
    ElMessage.warning('请先填写 tk');
    return;
  }
  const url = currentUrl.value;
  window.open(url, '_blank');
}

function copyUrl() {
  if (!currentUrl.value) return;
  navigator.clipboard
    .writeText(currentUrl.value)
    .then(() => {
      ElMessage.success('请求 URL 已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动选择复制');
    });
}
</script>

<style scoped lang="scss">
.tracking-simulator {
  padding: 20px;
  min-height: calc(100vh - 100px);

  .request-card,
  .response-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__header) {
      border-radius: 12px 12px 0 0;
      padding: 16px 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;

        .el-icon {
          font-size: 20px;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .request-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }

  .response-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
      color: #fff;
    }
  }

  .action-buttons {
    margin-top: 24px;
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
      height: 44px;
      border-radius: 24px;
    }
  }

  .empty-response {
    padding: 40px 0;
    text-align: center;
  }

  .request-timeline {
    margin-top: 12px;

    .timeline-item {
      .timeline-main {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;

        .timeline-type {
          font-weight: 600;
        }

        .timeline-status {
          font-size: 12px;
        }
      }

      .timeline-url {
        font-size: 12px;
        color: #606266;
        word-break: break-all;
      }

      .timeline-error {
        margin-top: 4px;
        font-size: 12px;
        color: #f56c6c;
      }
    }
  }
}
</style>

