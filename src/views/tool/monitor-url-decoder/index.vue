<template>
  <div class="app-container monitor-url-decoder">
    <el-row :gutter="20">
      <!-- 左侧：输入与配置 -->
      <el-col :span="12">
        <el-card class="request-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Link /></el-icon>
                监测 URL 解码
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
            <el-form-item label="监测 URL">
              <el-input
                v-model="form.url"
                type="textarea"
                :rows="4"
                placeholder="粘贴曝光/点击监测 URL，例如广告返回中的 pm/cm、或 tracking-api 追踪地址"
              />
            </el-form-item>

            <el-form-item label="密钥 (可选)">
              <el-input
                v-model="form.secret"
                type="password"
                show-password
                placeholder="用于校验 tk 签名，对应 oax.tracking.secret，仅本地调试使用"
              />
            </el-form-item>

            <el-alert
              type="info"
              :closable="false"
              show-icon
              class="tips-alert"
              title="功能说明"
              description="本工具会对监测 URL 做多层 URL 解码，解析查询参数；如包含 tk 参数，将参考广告追踪模拟工具的算法，对 tk 做解码与可选验签。"
            />

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="analyzeUrl"
              >
                <el-icon><Search /></el-icon>
                解析 URL
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：解析结果 -->
      <el-col :span="12">
        <el-card class="response-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><DataAnalysis /></el-icon>
                解析结果
              </span>
              <el-tag
                v-if="resultStatus"
                :type="resultStatus === 'success' ? 'success' : 'warning'"
                size="small"
              >
                {{ resultStatus === 'success' ? '解析成功' : '部分成功' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!hasResult" class="empty-response">
            <el-empty description="暂无解析结果，请先在左侧输入监测 URL 并点击解析">
              <template #image>
                <el-icon :size="60" color="#c0c4cc"><DataLine /></el-icon>
              </template>
            </el-empty>
          </div>

          <div v-else class="response-content">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="原始 URL">
                <span class="mono">{{ rawResult.originalUrl }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="一次解码">
                <span class="mono">{{ rawResult.decodedOnce || '-' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="二次解码">
                <span class="mono">{{ rawResult.decodedTwice || '-' }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">查询参数</el-divider>
            <div v-if="!rawResult.queryParams || !rawResult.queryParams.length">
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="未解析到查询参数"
                description="URL 中未包含 ?key=value 形式的查询字符串，或无法识别。"
              />
            </div>
            <div v-else class="params-table">
              <el-table
                :data="rawResult.queryParams"
                border
                size="small"
                style="width: 100%"
              >
                <el-table-column prop="key" label="参数名" width="140" />
                <el-table-column prop="rawValue" label="原始值" />
                <el-table-column prop="decodedValue" label="解码后" />
              </el-table>
            </div>

            <template v-if="tkResult">
              <el-divider content-position="left">tk 解析</el-divider>

              <el-alert
                v-if="tkResult.verifyMessage"
                :type="tkResult.verifyOk ? 'success' : 'error'"
                :closable="false"
                show-icon
                class="tk-alert"
                :title="tkResult.verifyTitle"
                :description="tkResult.verifyMessage"
              />

              <el-descriptions :column="1" border size="small" class="tk-meta">
                <el-descriptions-item label="原始 tk">
                  <span class="mono">{{ tkResult.rawTk }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="payload Base64URL">
                  <span class="mono">{{ tkResult.payloadBase64 }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="签名(hex)">
                  <span class="mono">{{ tkResult.signatureHex }}</span>
                </el-descriptions-item>
              </el-descriptions>

              <el-divider content-position="left">payload JSON</el-divider>
              <div class="json-viewer">
                <pre><code>{{ tkResult.payloadPretty }}</code></pre>
              </div>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="MonitorUrlDecoder">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Link,
  Refresh,
  Search,
  DataAnalysis,
  DataLine,
} from '@element-plus/icons-vue';

const form = reactive({
  url: '',
  // 默认密钥，用于本地快速验签，可手动修改
  secret: '1234567890123456',
});

const loading = ref(false);
const rawResult = ref({
  originalUrl: '',
  decodedOnce: '',
  decodedTwice: '',
  queryParams: [],
});
const tkResult = ref(null);
const resultStatus = ref('');

const hasResult = computed(() => !!rawResult.value.originalUrl);

function resetForm() {
  form.url = '';
  form.secret = '';
  rawResult.value = {
    originalUrl: '',
    decodedOnce: '',
    decodedTwice: '',
    queryParams: [],
  };
  tkResult.value = null;
  resultStatus.value = '';
}

function safeDecodeURIComponent(str) {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

function parseQuery(url) {
  const res = [];
  if (!url) return res;
  let query = '';
  const qIndex = url.indexOf('?');
  if (qIndex >= 0) {
    query = url.substring(qIndex + 1);
  }
  if (!query) return res;
  const hashIndex = query.indexOf('#');
  if (hashIndex >= 0) {
    query = query.substring(0, hashIndex);
  }
  const parts = query.split('&');
  for (const part of parts) {
    if (!part) continue;
    const [k, ...rest] = part.split('=');
    const v = rest.join('=');
    const rawValue = v;
    const decodedValue = safeDecodeURIComponent(v);
    res.push({
      key: k,
      rawValue,
      decodedValue,
    });
  }
  return res;
}

function base64UrlToBytes(base64url) {
  if (!base64url) {
    throw new Error('空的 Base64URL 字符串');
  }
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) base64 += '==';
  else if (padding === 3) base64 += '=';
  else if (padding === 1) throw new Error('非法 Base64URL 长度');
  // eslint-disable-next-line no-undef
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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

async function analyzeTkIfPresent(queryParams) {
  const tkParam = queryParams.find((p) => p.key === 'tk' && p.decodedValue);
  if (!tkParam) {
    tkResult.value = null;
    return;
  }

  const rawTk = tkParam.decodedValue || tkParam.rawValue;
  const parts = rawTk.split('.');
  if (parts.length !== 2) {
    tkResult.value = {
      rawTk,
      payloadBase64: '',
      signatureHex: '',
      payloadPretty: 'tk 格式不符合预期（应为 Base64URL.payload + "." + hex 签名）',
      verifyOk: false,
      verifyTitle: 'tk 格式异常',
      verifyMessage: '',
    };
    return;
  }

  const [payloadBase64, signatureHex] = parts;
  try {
    const payloadBytes = base64UrlToBytes(payloadBase64);
    const dec = new TextDecoder();
    const jsonStr = dec.decode(payloadBytes);
    let obj;
    let pretty = '';
    try {
      obj = JSON.parse(jsonStr);
      pretty = JSON.stringify(obj, null, 2);
    } catch (e) {
      pretty = jsonStr;
    }

    let verifyOk = false;
    let verifyTitle = '未校验签名';
    let verifyMessage = '';

    if (form.secret) {
      try {
        const hex = await hmacSha256Hex(form.secret, payloadBytes);
        verifyOk = hex === signatureHex;
        verifyTitle = verifyOk ? '签名校验通过' : '签名校验失败';
        verifyMessage = verifyOk
          ? '使用填写的密钥对 payload 计算 HMAC-SHA256，与 tk 中签名一致。'
          : '使用填写的密钥对 payload 计算 HMAC-SHA256，与 tk 中签名不一致，请检查密钥或 tk 是否正确。';
      } catch (e) {
        verifyOk = false;
        verifyTitle = '签名校验异常';
        verifyMessage = '计算 HMAC-SHA256 过程中发生错误：' + (e?.message || e);
      }
    }

    tkResult.value = {
      rawTk,
      payloadBase64,
      signatureHex,
      payloadPretty: pretty,
      verifyOk,
      verifyTitle,
      verifyMessage,
    };
  } catch (e) {
    tkResult.value = {
      rawTk,
      payloadBase64: '',
      signatureHex: '',
      payloadPretty: 'tk 解析失败：' + (e?.message || e),
      verifyOk: false,
      verifyTitle: 'tk 解析失败',
      verifyMessage: '',
    };
  }
}

async function analyzeUrl() {
  if (!form.url || !form.url.trim()) {
    ElMessage.warning('请先填写监测 URL');
    return;
  }
  loading.value = true;
  try {
    const originalUrl = form.url.trim();
    const decodedOnce = safeDecodeURIComponent(originalUrl);
    const decodedTwice = safeDecodeURIComponent(decodedOnce);

    const querySource =
      decodedTwice && decodedTwice !== originalUrl
        ? decodedTwice
        : decodedOnce || originalUrl;
    const queryParams = parseQuery(querySource);

    rawResult.value = {
      originalUrl,
      decodedOnce: decodedOnce !== originalUrl ? decodedOnce : '',
      decodedTwice:
        decodedTwice && decodedTwice !== decodedOnce ? decodedTwice : '',
      queryParams,
    };

    await analyzeTkIfPresent(queryParams);

    resultStatus.value =
      (!tkResult.value || tkResult.value.verifyOk || !form.secret) &&
      (!tkResult.value || tkResult.value.verifyTitle !== 'tk 解析失败')
        ? 'success'
        : 'warning';

    ElMessage.success('URL 解析完成');
  } catch (e) {
    console.error(e);
    ElMessage.error('URL 解析失败：' + (e?.message || e));
    resultStatus.value = '';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.monitor-url-decoder {
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
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #fff;
    }
  }

  .response-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
      color: #fff;
    }
  }

  .tips-alert {
    margin-top: 8px;
  }

  .action-buttons {
    margin-top: 24px;
    display: flex;
    justify-content: center;

    .el-button {
      min-width: 200px;
      height: 44px;
      border-radius: 24px;
    }
  }

  .empty-response {
    padding: 40px 0;
    text-align: center;
  }

  .mono {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    word-break: break-all;
  }

  .params-table {
    margin-top: 12px;
  }

  .tk-alert {
    margin-bottom: 12px;
  }

  .tk-meta {
    margin-bottom: 12px;
  }

  .json-viewer {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 12px;
    max-height: 260px;
    overflow: auto;

    pre {
      margin: 0;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.6;

      code {
        color: #9cdcfe;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }

  :deep(.el-divider__text) {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #606266;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}
</style>

