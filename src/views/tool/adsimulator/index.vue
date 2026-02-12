<template>
  <div class="app-container ad-simulator">
    <!-- 模式切换：广告模拟 | 广告引擎诊断 -->
    <div class="mode-tabs">
      <el-radio-group v-model="mainMode" size="large" class="mode-switch">
        <el-radio-button value="simulator">
          <el-icon><Promotion /></el-icon>
          广告模拟
        </el-radio-button>
        <el-radio-button value="diagnostic">
          <el-icon><Setting /></el-icon>
          广告引擎诊断
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-row v-show="mainMode === 'simulator'" :gutter="20">
      <!-- 左侧：请求配置 -->
      <el-col :span="12">
        <el-card class="request-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Edit /></el-icon>
                广告请求配置
              </span>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="generateSampleRequest">
                  <el-icon><MagicStick /></el-icon>
                  生成示例
                </el-button>
                <el-button type="warning" size="small" @click="resetForm">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </div>
          </template>

          <el-form ref="formRef" :model="form" label-width="100px" size="default">
            <!-- 基础配置 -->
            <el-divider content-position="left">
              <el-icon><Setting /></el-icon> 基础配置
            </el-divider>

            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="请求ID" prop="id">
                  <el-input v-model="form.id" placeholder="SSP广告请求ID（自动生成）" clearable>
                    <template #append>
                      <el-button @click="generateRequestId">
                        <el-icon><Refresh /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="测试流量" prop="test">
                  <el-switch v-model="form.test" active-text="是" inactive-text="否" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="调试模式" prop="debug">
                  <el-switch v-model="form.debug" active-text="是" inactive-text="否" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 曝光对象配置 -->
            <el-divider content-position="left">
              <el-icon><View /></el-icon> 曝光对象 (Imp)
            </el-divider>

            <div v-for="(imp, index) in form.imp" :key="index" class="imp-item">
              <el-row :gutter="16" align="middle">
                <el-col :span="10">
                  <el-form-item :label="'曝光ID-' + (index + 1)" :prop="'imp.' + index + '.id'">
                    <el-input v-model="imp.id" placeholder="曝光唯一标识">
                      <template #append>
                        <el-button @click="regenerateImpId(index)">
                          <el-icon><Refresh /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="广告位ID" :prop="'imp.' + index + '.tagid'">
                    <el-input v-model="imp.tagid" placeholder="媒体广告位ID" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button
                    v-if="form.imp.length > 1"
                    type="danger"
                    :icon="Delete"
                    circle
                    size="small"
                    @click="removeImp(index)"
                  />
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" plain size="small" @click="addImp" class="add-btn">
              <el-icon><Plus /></el-icon>
              添加曝光对象
            </el-button>

            <!-- 流量类型切换 -->
            <el-divider content-position="left">
              <el-icon><Monitor /></el-icon> 流量类型
            </el-divider>

            <el-form-item label="流量类型">
              <el-radio-group v-model="trafficType" @change="handleTrafficTypeChange">
                <el-radio-button value="site">网站流量</el-radio-button>
                <el-radio-button value="app">App流量</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 网站流量配置 -->
            <template v-if="trafficType === 'site'">
              <el-form-item label="内容标题" prop="site.content.title">
                <el-input v-model="form.site.content.title" placeholder="网站内容标题" />
              </el-form-item>
              <el-form-item label="内容关键字" prop="site.content.keywords">
                <el-input v-model="form.site.content.keywords" placeholder="网站内容关键字" />
              </el-form-item>
            </template>

            <!-- App流量配置 -->
            <template v-if="trafficType === 'app'">
              <el-form-item label="App版本" prop="app.ver">
                <el-input v-model="form.app.ver" placeholder="App版本号" />
              </el-form-item>
              <el-form-item label="内容标题" prop="app.content.title">
                <el-input v-model="form.app.content.title" placeholder="App内容标题" />
              </el-form-item>
              <el-form-item label="内容关键字" prop="app.content.keywords">
                <el-input v-model="form.app.content.keywords" placeholder="App内容关键字" />
              </el-form-item>
            </template>

            <!-- 设备信息 -->
            <el-divider content-position="left">
              <el-icon><Iphone /></el-icon> 设备信息
            </el-divider>

            <el-collapse v-model="activeCollapse">
              <el-collapse-item name="device-basic">
                <template #title>
                  <div class="collapse-title">
                    <span>设备基础信息</span>
                    <el-button type="primary" size="small" link @click.stop="generateDeviceBasic" class="generate-btn">
                      <el-icon><MagicStick /></el-icon>
                      自动生成
                    </el-button>
                  </div>
                </template>
                <el-row :gutter="16">
                  <el-col :span="24">
                    <el-form-item label="User-Agent" prop="device.ua">
                      <el-input v-model="form.device.ua" placeholder="设备User-Agent" type="textarea" :rows="2" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="IP地址" prop="device.ip">
                      <el-input v-model="form.device.ip" placeholder="设备IPv4地址" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="IPv6地址" prop="device.ipv6">
                      <el-input v-model="form.device.ipv6" placeholder="设备IPv6地址" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="设备类型" prop="device.deviceType">
                      <el-select v-model="form.device.deviceType" placeholder="选择设备类型" style="width: 100%">
                        <el-option label="手机" :value="1" />
                        <el-option label="平板" :value="2" />
                        <el-option label="PC" :value="3" />
                        <el-option label="电视" :value="4" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="网络类型" prop="device.connectionType">
                      <el-select v-model="form.device.connectionType" placeholder="选择网络类型" style="width: 100%">
                        <el-option label="未知" :value="0" />
                        <el-option label="WiFi" :value="1" />
                        <el-option label="2G" :value="2" />
                        <el-option label="3G" :value="3" />
                        <el-option label="4G" :value="4" />
                        <el-option label="5G" :value="5" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <el-collapse-item name="device-detail">
                <template #title>
                  <div class="collapse-title">
                    <span>设备详细信息</span>
                    <el-button type="primary" size="small" link @click.stop="generateDeviceDetail" class="generate-btn">
                      <el-icon><MagicStick /></el-icon>
                      自动生成
                    </el-button>
                  </div>
                </template>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="制造商" prop="device.make">
                      <el-input v-model="form.device.make" placeholder="如：Apple" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="型号" prop="device.model">
                      <el-input v-model="form.device.model" placeholder="如：iPhone" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="操作系统" prop="device.os">
                      <el-select v-model="form.device.os" placeholder="选择操作系统" style="width: 100%" allow-create filterable>
                        <el-option label="iOS" value="ios" />
                        <el-option label="Android" value="Android" />
                        <el-option label="Windows" value="Windows" />
                        <el-option label="macOS" value="macOS" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="系统版本" prop="device.osv">
                      <el-input v-model="form.device.osv" placeholder="如：17.0" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="屏幕宽度" prop="device.w">
                      <el-input-number v-model="form.device.w" :min="0" placeholder="像素" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="屏幕高度" prop="device.h">
                      <el-input-number v-model="form.device.h" :min="0" placeholder="像素" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="运营商" prop="device.carrier">
                      <el-select v-model="form.device.carrier" placeholder="选择运营商" style="width: 100%">
                        <el-option label="未知" value="0" />
                        <el-option label="移动" value="1" />
                        <el-option label="联通" value="2" />
                        <el-option label="电信" value="3" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <el-collapse-item name="device-id">
                <template #title>
                  <div class="collapse-title">
                    <span>设备标识</span>
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click.stop="generateDeviceIdsAll"
                      class="generate-btn"
                    >
                      <el-icon><MagicStick /></el-icon>
                      自动生成
                    </el-button>
                  </div>
                </template>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="IDFA/IMEI" prop="device.ifa">
                      <el-input v-model="form.device.ifa" placeholder="明文设备码">
                        <template #append>
                          <el-button @click="generateIfa">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="设备码MD5" prop="device.didmd5">
                      <el-input v-model="form.device.didmd5" placeholder="MD5设备码">
                        <template #append>
                          <el-button @click="generateDidmd5">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="MAC地址" prop="device.mac">
                      <el-input v-model="form.device.mac" placeholder="MAC地址明文">
                        <template #append>
                          <el-button @click="generateMac">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="MAC MD5" prop="device.macmd5">
                      <el-input v-model="form.device.macmd5" placeholder="MAC地址MD5">
                        <template #append>
                          <el-button @click="generateMacmd5">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="Android ID" prop="device.adid">
                      <el-input v-model="form.device.adid" placeholder="Android ID">
                        <template #append>
                          <el-button @click="generateAdid">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <el-collapse-item title="地理位置" name="device-geo">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="纬度" prop="device.geo.lat">
                      <el-input-number v-model="form.device.geo.lat" :precision="6" :step="0.1" placeholder="纬度" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="经度" prop="device.geo.lon">
                      <el-input-number v-model="form.device.geo.lon" :precision="6" :step="0.1" placeholder="经度" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>

            <!-- 发送请求按钮 -->
            <div class="submit-section">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="submitRequest"
                class="submit-btn"
              >
                <el-icon><Promotion /></el-icon>
                发送广告请求
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：响应结果 -->
      <el-col :span="12">
        <!-- 请求预览 -->
        <el-card class="preview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Document /></el-icon>
                请求预览 (JSON)
              </span>
              <el-button type="primary" text size="small" @click="copyRequestJson">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
          </template>
          <div class="json-viewer">
            <pre><code>{{ requestJsonFormatted }}</code></pre>
          </div>
        </el-card>

        <!-- 响应结果 -->
        <el-card class="response-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><DataAnalysis /></el-icon>
                响应结果
              </span>
              <el-tag v-if="responseStatus" :type="responseStatus === 'success' ? 'success' : 'danger'" size="small">
                {{ responseStatus === 'success' ? '成功' : '失败' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!response && !responseError" class="empty-response">
            <el-empty description="暂无响应数据，请发送请求">
              <template #image>
                <el-icon :size="60" color="#c0c4cc"><DataLine /></el-icon>
              </template>
            </el-empty>
          </div>

          <div v-else-if="responseError" class="error-response">
            <el-alert :title="responseError.title" :description="responseError.message" type="error" show-icon :closable="false" />
          </div>

          <div v-else class="response-content">
            <!-- 响应概览 -->
            <div class="response-overview">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="请求ID">{{ response.id || '-' }}</el-descriptions-item>
                <el-descriptions-item label="广告数量">{{ response.ads?.length || 0 }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 广告列表 -->
            <div v-if="response.ads && response.ads.length > 0" class="ads-list">
              <el-divider content-position="left">广告列表</el-divider>
              <el-collapse v-model="activeAdCollapse">
                <el-collapse-item
                  v-for="(ad, index) in response.ads"
                  :key="index"
                  :name="'ad-' + index"
                  :title="'广告 ' + (index + 1) + ' - ' + (ad.tagid || ad.impid || '未知')"
                >
                  <el-descriptions :column="1" border size="small" class="ad-detail">
                    <el-descriptions-item label="曝光ID">{{ ad.impid || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="广告位ID">{{ ad.tagid || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="创意ID">{{ ad.crid || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="点击类型">
                      <el-tag size="small">{{ getClickTypeLabel(ad.ct) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="落地页">
                      <el-link v-if="ad.ldp" :href="ad.ldp" target="_blank" type="primary">{{ ad.ldp }}</el-link>
                      <span v-else>-</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="创意地址">
                      <el-link v-if="ad.curl" :href="ad.curl" target="_blank" type="primary">{{ ad.curl }}</el-link>
                      <span v-else>-</span>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="ad.bundle" label="包名/AppID">{{ ad.bundle }}</el-descriptions-item>
                    <el-descriptions-item v-if="ad.adl" label="下载地址">
                      <el-link :href="ad.adl" target="_blank" type="primary">{{ ad.adl }}</el-link>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="ad.dlk" label="DeepLink">{{ ad.dlk }}</el-descriptions-item>
                  </el-descriptions>

                  <!-- 曝光监测 -->
                  <div v-if="ad.pm && ad.pm.length > 0" class="tracking-urls">
                    <div class="tracking-title">曝光监测 ({{ ad.pm.length }})</div>
                    <el-tag v-for="(url, pIndex) in ad.pm" :key="pIndex" size="small" type="info" class="tracking-tag">
                      {{ url }}
                    </el-tag>
                  </div>

                  <!-- 点击监测 -->
                  <div v-if="ad.cm && ad.cm.length > 0" class="tracking-urls">
                    <div class="tracking-title">点击监测 ({{ ad.cm.length }})</div>
                    <el-tag v-for="(url, cIndex) in ad.cm" :key="cIndex" size="small" type="warning" class="tracking-tag">
                      {{ url }}
                    </el-tag>
                  </div>

                  <!-- 原生广告 -->
                  <div v-if="ad.nativeAd" class="native-ad-section">
                    <el-divider content-position="left">原生广告素材</el-divider>
                    <el-descriptions :column="2" border size="small">
                      <el-descriptions-item v-if="ad.nativeAd.title" label="标题" :span="2">{{ ad.nativeAd.title }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.desc" label="描述" :span="2">{{ ad.nativeAd.desc }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.desc2" label="描述2" :span="2">{{ ad.nativeAd.desc2 }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.cta" label="CTA">{{ ad.nativeAd.cta }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.sponsored" label="赞助方">{{ ad.nativeAd.sponsored }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.rating" label="评分">{{ ad.nativeAd.rating }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.likes" label="点赞数">{{ ad.nativeAd.likes }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.price" label="价格">{{ ad.nativeAd.price }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.salePrice" label="销售价格">{{ ad.nativeAd.salePrice }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.downloads" label="下载数">{{ ad.nativeAd.downloads }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.phone" label="电话">{{ ad.nativeAd.phone }}</el-descriptions-item>
                      <el-descriptions-item v-if="ad.nativeAd.address" label="地址" :span="2">{{ ad.nativeAd.address }}</el-descriptions-item>
                    </el-descriptions>

                    <!-- 图片预览 -->
                    <div v-if="ad.nativeAd.icon || ad.nativeAd.mainImage || (ad.nativeAd.images && ad.nativeAd.images.length)" class="native-images">
                      <div class="images-title">图片素材</div>
                      <div class="images-grid">
                        <div v-if="ad.nativeAd.icon" class="image-item">
                          <el-image :src="ad.nativeAd.icon" fit="contain" :preview-src-list="[ad.nativeAd.icon]" />
                          <span class="image-label">图标</span>
                        </div>
                        <div v-if="ad.nativeAd.mainImage" class="image-item main-image">
                          <el-image :src="ad.nativeAd.mainImage" fit="contain" :preview-src-list="[ad.nativeAd.mainImage]" />
                          <span class="image-label">主图</span>
                        </div>
                        <div v-for="(img, imgIndex) in ad.nativeAd.images" :key="imgIndex" class="image-item">
                          <el-image :src="img" fit="contain" :preview-src-list="ad.nativeAd.images" />
                          <span class="image-label">图片{{ imgIndex + 1 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 原始JSON -->
            <el-divider content-position="left">原始响应 (JSON)</el-divider>
            <div class="json-viewer response-json">
              <pre><code>{{ responseJsonFormatted }}</code></pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 广告引擎诊断模式 -->
    <el-row v-show="mainMode === 'diagnostic'" :gutter="20">
      <el-col :span="12">
        <el-card class="request-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Setting /></el-icon>
                诊断配置
              </span>
            </div>
          </template>

          <el-tabs v-model="diagnosticTab" type="border-card" class="diagnostic-tabs">
            <el-tab-pane name="index-keys" label="构建索引Key">
              <div class="diagnostic-tip">输入广告位、操作系统、设备类型和 IP，构建索引 Key 用于调试广告引擎索引逻辑。</div>
              <el-form :model="buildIndexForm" label-width="90px" size="default" class="build-index-form">
                <el-form-item label="广告位ID" prop="adSlotId">
                  <el-input v-model="buildIndexForm.adSlotId" placeholder="媒体广告位ID，如 adp-10001" clearable />
                </el-form-item>
                <el-form-item label="操作系统" prop="os">
                  <el-select v-model="buildIndexForm.os" placeholder="选择操作系统" style="width: 100%" allow-clear>
                    <el-option label="iOS" value="ios" />
                    <el-option label="Android" value="Android" />
                    <el-option label="Windows" value="Windows" />
                    <el-option label="macOS" value="macOS" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="buildIndexForm.deviceType" placeholder="选择设备类型" style="width: 100%" allow-clear>
                    <el-option label="PHONE (手机)" value="PHONE" />
                    <el-option label="PAD (平板)" value="PAD" />
                    <el-option label="PC" value="PC" />
                    <el-option label="TV (电视)" value="TV" />
                  </el-select>
                </el-form-item>
                <el-form-item label="用户IP" prop="ip">
                  <el-input v-model="buildIndexForm.ip" placeholder="如 223.104.63.88" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="diagLoading.indexKeys" @click="runBuildIndexKeys">
                    <el-icon><Key /></el-icon>
                    构建索引 Key
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane name="match-dsps" label="匹配 DSP">
              <div class="diagnostic-tip">输入广告位、操作系统、设备类型和 IP，查询能匹配到的 DSP 列表。</div>
              <el-form :model="buildIndexForm" label-width="90px" size="default" class="build-index-form">
                <el-form-item label="广告位ID" prop="adSlotId">
                  <el-input v-model="buildIndexForm.adSlotId" placeholder="媒体广告位ID，如 adp-10001" clearable />
                </el-form-item>
                <el-form-item label="操作系统" prop="os">
                  <el-select v-model="buildIndexForm.os" placeholder="选择操作系统" style="width: 100%" allow-clear>
                    <el-option label="iOS" value="ios" />
                    <el-option label="Android" value="Android" />
                    <el-option label="Windows" value="Windows" />
                    <el-option label="macOS" value="macOS" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="buildIndexForm.deviceType" placeholder="选择设备类型" style="width: 100%" allow-clear>
                    <el-option label="PHONE (手机)" value="PHONE" />
                    <el-option label="PAD (平板)" value="PAD" />
                    <el-option label="PC" value="PC" />
                    <el-option label="TV (电视)" value="TV" />
                  </el-select>
                </el-form-item>
                <el-form-item label="用户IP" prop="ip">
                  <el-input v-model="buildIndexForm.ip" placeholder="如 223.104.63.88" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="diagLoading.matchDsps" @click="runMatchDsps">
                    <el-icon><Connection /></el-icon>
                    匹配 DSP
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane name="cache-inspect" label="检查缓存">
              <div class="diagnostic-tip">根据 Key 和缓存类型检查缓存数据。</div>
              <el-form label-width="100px" size="default" class="cache-form">
                <el-form-item label="缓存 Key">
                  <el-input v-model="cacheForm.key" placeholder="如 DSP ID、站点 ID、广告位 ID 等" clearable />
                </el-form-item>
                <el-form-item label="缓存类型">
                  <el-select v-model="cacheForm.cacheType" placeholder="选择缓存类型" style="width: 100%">
                    <el-option label="PUBLISHER (媒体主)" :value="1" />
                    <el-option label="SITE (站点)" :value="2" />
                    <el-option label="SITE_AD_PLACEMENT (站点广告位)" :value="3" />
                    <el-option label="AD_PLACEMENT (广告位)" :value="4" />
                    <el-option label="DSP" :value="5" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="diagLoading.cacheInspect" @click="runInspectCache">
                    <el-icon><Search /></el-icon>
                    检查缓存
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="response-card diagnostic-result-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><DataAnalysis /></el-icon>
                诊断结果
              </span>
              <el-tag v-if="diagResultStatus" :type="diagResultStatus === 'success' ? 'success' : 'danger'" size="small">
                {{ diagResultStatus === 'success' ? '成功' : '失败' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!diagResult && !diagError" class="empty-response">
            <el-empty description="请执行诊断操作查看结果">
              <template #image>
                <el-icon :size="60" color="#c0c4cc"><DataLine /></el-icon>
              </template>
            </el-empty>
          </div>
          <div v-else-if="diagError" class="error-response">
            <el-alert :title="diagError" type="error" show-icon :closable="false" />
          </div>
          <div v-else class="diagnostic-result">
            <!-- 索引 Key 结果 -->
            <template v-if="diagnosticTab === 'index-keys' && diagResult">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item v-if="diagResult.tagIdKeys?.length" label="广告位索引">
                  <el-tag v-for="(k, i) in diagResult.tagIdKeys" :key="i" size="small" type="info" class="result-tag">{{ k }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item v-if="diagResult.osKeys?.length" label="操作系统索引">
                  <el-tag v-for="(k, i) in diagResult.osKeys" :key="i" size="small" type="success" class="result-tag">{{ k }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item v-if="diagResult.deviceTypeKeys?.length" label="设备类型索引">
                  <el-tag v-for="(k, i) in diagResult.deviceTypeKeys" :key="i" size="small" type="warning" class="result-tag">{{ k }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item v-if="diagResult.regionKeys?.length" label="地域索引">
                  <el-tag v-for="(k, i) in diagResult.regionKeys" :key="i" size="small" type="primary" class="result-tag">{{ k }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </template>
            <!-- 匹配 DSP 结果 -->
            <template v-else-if="diagnosticTab === 'match-dsps' && diagResult">
              <div v-if="Array.isArray(diagResult) && diagResult.length === 0" class="empty-list">未匹配到任何 DSP</div>
              <el-table v-else-if="Array.isArray(diagResult)" :data="diagResult" size="small" stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="dspId" label="DSP ID" width="120" />
                <el-table-column prop="name" label="名称" min-width="120" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>
            <!-- 缓存检查结果 / 其他 -->
            <template v-else>
              <div class="json-viewer">
                <pre><code>{{ diagResultJson }}</code></pre>
              </div>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="AdSimulator">
import { ref, reactive, computed } from 'vue';
import { fetchAd, buildIndexKeys, inspectCacheData, matchDsps } from '@/api/tool/adsimulator';
import { ElMessage } from 'element-plus';
import {
  Edit,
  MagicStick,
  Refresh,
  Setting,
  View,
  Monitor,
  Iphone,
  Plus,
  Delete,
  Promotion,
  Document,
  CopyDocument,
  DataAnalysis,
  DataLine,
  Key,
  Connection,
  Search,
} from '@element-plus/icons-vue';

// 表单引用
const formRef = ref(null);

// 加载状态
const loading = ref(false);

// 主模式：广告模拟 | 广告引擎诊断
const mainMode = ref('simulator');

// 广告引擎诊断
const diagnosticTab = ref('index-keys');
const buildIndexForm = reactive({
  adSlotId: '',
  os: 'ios',
  deviceType: 'PHONE',
  ip: '223.104.63.88',
});
const cacheForm = reactive({ key: '', cacheType: 5 });
const diagLoading = reactive({ indexKeys: false, matchDsps: false, cacheInspect: false });
const diagResult = ref(null);
const diagError = ref(null);
const diagResultStatus = ref(null);

// 流量类型（默认 App 流量）
const trafficType = ref('app');

// 折叠面板状态
const activeCollapse = ref(['device-basic']);
const activeAdCollapse = ref([]);

// 响应数据
const response = ref(null);
const responseError = ref(null);
const responseStatus = ref(null);

// 生成 UUID（去掉连接符）- 提前声明供初始化使用
function generateUUIDInit() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).replace(/-/g, '');
}

// 表单数据
const form = reactive({
  id: '',
  test: true,
  debug: true,
  imp: [{ id: generateUUIDInit(), tagid: '' }],
  site: {
    content: {
      title: '',
      keywords: '',
    },
  },
  app: {
    ver: '',
    content: {
      title: '',
      keywords: '',
    },
    ext: {},
  },
  device: {
    ua: '',
    ip: '',
    ipv6: '',
    deviceType: 1,
    make: '',
    model: '',
    os: '',
    osv: '',
    carrier: '',
    connectionType: 1,
    ifa: '',
    didmd5: '',
    mac: '',
    macmd5: '',
    adid: '',
    h: undefined,
    w: undefined,
    geo: {
      lat: undefined,
      lon: undefined,
    },
  },
  ext: {},
});

// 生成 UUID（去掉连接符）
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).replace(/-/g, '');
}

// 生成请求ID
function generateRequestId() {
  form.id = generateUUID();
}

// 生成曝光ID
function generateImpId() {
  return generateUUID();
}

// 重新生成指定曝光的ID
function regenerateImpId(index) {
  form.imp[index].id = generateImpId();
}

// 添加曝光对象
function addImp() {
  form.imp.push({
    id: generateImpId(),
    tagid: '',
  });
}

// 移除曝光对象
function removeImp(index) {
  form.imp.splice(index, 1);
}

// 处理流量类型变化
function handleTrafficTypeChange(type) {
  if (type === 'site') {
    form.app = { ver: '', content: { title: '', keywords: '' }, ext: {} };
  } else {
    form.site = { content: { title: '', keywords: '' } };
  }
}

// 设备数据库 - 用于随机生成
const deviceDatabase = {
  ios: [
    { make: 'Apple', model: 'iPhone 15 Pro Max', w: 1290, h: 2796, osv: '17.2' },
    { make: 'Apple', model: 'iPhone 15 Pro', w: 1179, h: 2556, osv: '17.1' },
    { make: 'Apple', model: 'iPhone 15', w: 1179, h: 2556, osv: '17.0' },
    { make: 'Apple', model: 'iPhone 14 Pro', w: 1179, h: 2556, osv: '16.5' },
    { make: 'Apple', model: 'iPhone 14', w: 1170, h: 2532, osv: '16.4' },
    { make: 'Apple', model: 'iPhone 13', w: 1170, h: 2532, osv: '15.6' },
    { make: 'Apple', model: 'iPhone SE', w: 750, h: 1334, osv: '16.0' },
  ],
  android: [
    { make: 'Samsung', model: 'Galaxy S24 Ultra', w: 1440, h: 3120, osv: '14' },
    { make: 'Samsung', model: 'Galaxy S24', w: 1080, h: 2340, osv: '14' },
    { make: 'Samsung', model: 'Galaxy S23', w: 1080, h: 2340, osv: '13' },
    { make: 'Xiaomi', model: 'Mi 14 Pro', w: 1440, h: 3200, osv: '14' },
    { make: 'Xiaomi', model: 'Mi 13', w: 1080, h: 2400, osv: '13' },
    { make: 'Xiaomi', model: 'Redmi Note 13', w: 1080, h: 2400, osv: '13' },
    { make: 'OPPO', model: 'Find X7 Ultra', w: 1440, h: 3168, osv: '14' },
    { make: 'OPPO', model: 'Reno 11', w: 1080, h: 2412, osv: '14' },
    { make: 'vivo', model: 'X100 Pro', w: 1440, h: 3200, osv: '14' },
    { make: 'vivo', model: 'S18', w: 1080, h: 2400, osv: '14' },
    { make: 'HUAWEI', model: 'Mate 60 Pro', w: 1260, h: 2720, osv: '12' },
    { make: 'HUAWEI', model: 'P60', w: 1080, h: 2700, osv: '12' },
    { make: 'OnePlus', model: '12', w: 1440, h: 3168, osv: '14' },
    { make: 'Google', model: 'Pixel 8 Pro', w: 1344, h: 2992, osv: '14' },
  ],
  tablet: [
    { make: 'Apple', model: 'iPad Pro 12.9', w: 2048, h: 2732, os: 'ios', osv: '17.0' },
    { make: 'Apple', model: 'iPad Air', w: 1640, h: 2360, os: 'ios', osv: '17.0' },
    { make: 'Samsung', model: 'Galaxy Tab S9', w: 1600, h: 2560, os: 'Android', osv: '13' },
    { make: 'Xiaomi', model: 'Pad 6 Pro', w: 1800, h: 2880, os: 'Android', osv: '13' },
    { make: 'HUAWEI', model: 'MatePad Pro', w: 1600, h: 2560, os: 'Android', osv: '12' },
  ],
  pc: [
    { make: 'Apple', model: 'MacBook Pro', w: 3024, h: 1964, os: 'macOS', osv: '14.0' },
    { make: 'Apple', model: 'MacBook Air', w: 2560, h: 1664, os: 'macOS', osv: '14.0' },
    { make: 'Dell', model: 'XPS 15', w: 3840, h: 2400, os: 'Windows', osv: '11' },
    { make: 'Lenovo', model: 'ThinkPad X1', w: 2880, h: 1800, os: 'Windows', osv: '11' },
    { make: 'HP', model: 'Spectre x360', w: 3840, h: 2160, os: 'Windows', osv: '11' },
  ],
};

const userAgents = {
  ios: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  ],
  // Android UA 增加更多国产机型：小米、华为、OPPO、vivo、荣耀等
  android: [
    // 三星 / Google 保留一些国外机型
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    // 小米
    'Mozilla/5.0 (Linux; Android 14; 2210132C Build/UKQ1.230804.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; 2201123G Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; 23013RK75C Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    // Redmi
    'Mozilla/5.0 (Linux; Android 14; 2312DRAABC Build/UKQ1.230804.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; 23021RAA2C Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    // OPPO
    'Mozilla/5.0 (Linux; Android 14; PJF110 Build/UKQ1.230804.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; PGFM10 Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; PGKM10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
    // vivo
    'Mozilla/5.0 (Linux; Android 14; V2302A Build/UKQ1.230804.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; V2241A Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; V2254A Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    // 华为
    'Mozilla/5.0 (Linux; Android 12; HMA-AL00 Build/HUAWEIHMA-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; LYA-AL00 Build/HUAWEILYA-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; NOH-AN00 Build/HUAWEINOH-AN00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    // 荣耀
    'Mozilla/5.0 (Linux; Android 13; ELZ-AN20 Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; CMA-AN40 Build/TKQ1.221114.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  ],
  tablet: [
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ],
  pc: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ],
};

// 生成随机 IP 地址
function generateRandomIP() {
  // 生成中国常见 IP 段
  const ipPrefixes = ['223.104', '117.136', '120.230', '183.192', '114.247', '125.119', '218.205', '202.108'];
  const prefix = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)];
  return `${prefix}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// 生成设备基础信息
function generateDeviceBasic() {
  const deviceTypes = [1, 1, 1, 2, 3]; // 手机概率更高
  const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
  const connectionTypes = [1, 4, 4, 4, 5]; // WiFi 和 4G 概率更高
  const connectionType = connectionTypes[Math.floor(Math.random() * connectionTypes.length)];

  let uaList;
  if (deviceType === 1) {
    uaList = Math.random() > 0.4 ? userAgents.android : userAgents.ios;
  } else if (deviceType === 2) {
    uaList = userAgents.tablet;
  } else {
    uaList = userAgents.pc;
  }

  form.device.ua = uaList[Math.floor(Math.random() * uaList.length)];
  form.device.ip = generateRandomIP();
  form.device.deviceType = deviceType;
  form.device.connectionType = connectionType;

  ElMessage.success('已生成设备基础信息');
}

// 生成设备详细信息
function generateDeviceDetail() {
  const deviceType = form.device.deviceType || 1;
  const carriers = ['1', '2', '3']; // 移动、联通、电信
  
  let deviceList;
  let os;
  
  if (deviceType === 1) {
    // 手机 - 根据 UA 判断是 iOS 还是 Android
    const isIOS = form.device.ua && form.device.ua.includes('iPhone');
    deviceList = isIOS ? deviceDatabase.ios : deviceDatabase.android;
    os = isIOS ? 'ios' : 'Android';
  } else if (deviceType === 2) {
    deviceList = deviceDatabase.tablet;
  } else if (deviceType === 3) {
    deviceList = deviceDatabase.pc;
  } else {
    deviceList = deviceDatabase.android;
    os = 'Android';
  }

  const device = deviceList[Math.floor(Math.random() * deviceList.length)];
  
  form.device.make = device.make;
  form.device.model = device.model;
  form.device.os = device.os || os;
  form.device.osv = device.osv;
  form.device.w = device.w;
  form.device.h = device.h;
  form.device.carrier = carriers[Math.floor(Math.random() * carriers.length)];

  ElMessage.success('已生成设备详细信息');
}

// 生成随机十六进制字符串
function randomHex(length) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 生成 IDFA/IMEI 字符串
function generateIfaValue() {
  // 使用带连字符的 UUID 形式，更接近真实 IDFA
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 生成 MAC 地址
function generateMacValue() {
  const segments = [];
  for (let i = 0; i < 6; i++) {
    segments.push(randomHex(2));
  }
  return segments.join(':').toUpperCase();
}

// 生成 Android ID
function generateAdidValue() {
  return randomHex(16);
}

// 设备标识 - 一键生成
function generateDeviceIdsAll() {
  const ifa = generateIfaValue();
  form.device.ifa = ifa;
  // didmd5 默认生成
  form.device.didmd5 = randomHex(32);
  form.device.mac = generateMacValue();
  form.device.macmd5 = randomHex(32);
  form.device.adid = generateAdidValue();
  ElMessage.success('已生成设备标识信息');
}

// 单字段生成：IDFA/IMEI
function generateIfa() {
  const ifa = generateIfaValue();
  form.device.ifa = ifa;
  // 如果 didmd5 为空，则默认一并生成
  if (!form.device.didmd5) {
    form.device.didmd5 = randomHex(32);
  }
  ElMessage.success('已生成 IDFA/IMEI');
}

// 单字段生成：设备码 MD5
function generateDidmd5() {
  form.device.didmd5 = randomHex(32);
  ElMessage.success('已生成设备码 MD5');
}

// 单字段生成：MAC
function generateMac() {
  form.device.mac = generateMacValue();
  ElMessage.success('已生成 MAC 地址');
}

// 单字段生成：MAC MD5
function generateMacmd5() {
  form.device.macmd5 = randomHex(32);
  ElMessage.success('已生成 MAC MD5');
}

// 单字段生成：Android ID
function generateAdid() {
  form.device.adid = generateAdidValue();
  ElMessage.success('已生成 Android ID');
}

// App 示例数据 - 用于生成示例
const APP_SAMPLE_VERSIONS = ['1.0.0', '2.3.1', '3.1.5', '4.0.2', '1.8.6'];
const APP_SAMPLE_TITLES = [
  '首页信息流', '视频推荐页', '资讯详情', '发现频道', '个人中心',
  '开屏广告位', 'Banner横幅', '插屏广告', '激励视频', '信息流列表',
  '搜索结果页', '商品详情', '直播间', '短视频播放', '文章阅读页',
  '分类列表', '购物车', '订单确认', '消息中心', '设置页',
  '活动专题', '品牌馆', '会员中心', '客服对话', '地图导航',
];
const APP_SAMPLE_KEYWORDS = [
  '社交,资讯,视频', '电商,购物,促销', '新闻,热点,头条', '娱乐,游戏,直播', '工具,生活,服务',
  '金融,理财,保险', '教育,学习,课程', '旅游,出行,酒店', '美食,外卖,团购', '健康,医疗,运动',
  '母婴,亲子,育儿', '汽车,二手车,保养', '房产,装修,家居', '招聘,求职,职场', '摄影,美图,滤镜',
  '音乐,电台,播客', '阅读,小说,漫画', '天气,日历,闹钟', '输入法,翻译,词典', '安全,清理,加速',
  '短视频,种草,好物', '直播,打赏,互动', '会员,VIP,订阅', '优惠券,秒杀,拼团',
];

// 生成示例请求（默认使用 App 流量，自动生成版本号、内容和关键字）
function generateSampleRequest() {
  generateRequestId();
  form.test = true;
  form.debug = true;
  form.imp = [{ id: generateImpId(), tagid: 'adp-10001' }];
  trafficType.value = 'app';
  form.site = { content: { title: '', keywords: '' } };
  // 随机生成 App 版本号、内容标题和关键字
  form.app = {
    ver: APP_SAMPLE_VERSIONS[Math.floor(Math.random() * APP_SAMPLE_VERSIONS.length)],
    content: {
      title: APP_SAMPLE_TITLES[Math.floor(Math.random() * APP_SAMPLE_TITLES.length)],
      keywords: APP_SAMPLE_KEYWORDS[Math.floor(Math.random() * APP_SAMPLE_KEYWORDS.length)],
    },
    ext: {},
  };
  form.device = {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ip: '223.104.63.88',
    ipv6: '',
    deviceType: 1,
    make: 'Apple',
    model: 'iPhone 15',
    os: 'ios',
    osv: '17.0',
    carrier: '1',
    connectionType: 4,
    ifa: '',
    didmd5: '',
    mac: '',
    macmd5: '',
    adid: '',
    h: 2556,
    w: 1179,
    geo: {
      lat: 39.9042,
      lon: 116.4074,
    },
  };
  ElMessage.success('已生成示例请求数据');
}

// 重置表单
function resetForm() {
  form.id = '';
  form.test = true;
  form.debug = true;
  form.imp = [{ id: generateImpId(), tagid: '' }];
  trafficType.value = 'app';
  form.site = { content: { title: '', keywords: '' } };
  form.app = { ver: '', content: { title: '', keywords: '' }, ext: {} };
  form.device = {
    ua: '',
    ip: '',
    ipv6: '',
    deviceType: 1,
    make: '',
    model: '',
    os: '',
    osv: '',
    carrier: '',
    connectionType: 1,
    ifa: '',
    didmd5: '',
    mac: '',
    macmd5: '',
    adid: '',
    h: undefined,
    w: undefined,
    geo: { lat: undefined, lon: undefined },
  };
  form.ext = {};
  response.value = null;
  responseError.value = null;
  responseStatus.value = null;
  ElMessage.info('表单已重置');
}

// 构建请求数据（清理空值）
function buildRequestData() {
  const data = {
    id: form.id || undefined,
    test: form.test,
    debug: form.debug,
    imp: form.imp.filter((i) => i.tagid).map((i) => ({
      id: i.id || undefined,
      tagid: i.tagid,
    })),
    device: {},
  };

  // 根据流量类型添加 site 或 app
  if (trafficType.value === 'site') {
    if (form.site.content.title || form.site.content.keywords) {
      data.site = { content: {} };
      if (form.site.content.title) data.site.content.title = form.site.content.title;
      if (form.site.content.keywords) data.site.content.keywords = form.site.content.keywords;
    }
  } else {
    if (form.app.ver || form.app.content.title || form.app.content.keywords) {
      data.app = { content: {} };
      if (form.app.ver) data.app.ver = form.app.ver;
      if (form.app.content.title) data.app.content.title = form.app.content.title;
      if (form.app.content.keywords) data.app.content.keywords = form.app.content.keywords;
    }
  }

  // 设备信息
  const device = form.device;
  if (device.ua) data.device.ua = device.ua;
  if (device.ip) data.device.ip = device.ip;
  if (device.ipv6) data.device.ipv6 = device.ipv6;
  if (device.deviceType) data.device.deviceType = device.deviceType;
  if (device.make) data.device.make = device.make;
  if (device.model) data.device.model = device.model;
  if (device.os) data.device.os = device.os;
  if (device.osv) data.device.osv = device.osv;
  if (device.carrier) data.device.carrier = device.carrier;
  if (device.connectionType !== undefined) data.device.connectionType = device.connectionType;
  if (device.ifa) data.device.ifa = device.ifa;
  if (device.didmd5) data.device.didmd5 = device.didmd5;
  if (device.mac) data.device.mac = device.mac;
  if (device.macmd5) data.device.macmd5 = device.macmd5;
  if (device.adid) data.device.adid = device.adid;
  if (device.h) data.device.h = device.h;
  if (device.w) data.device.w = device.w;

  // 地理位置
  if (device.geo.lat !== undefined || device.geo.lon !== undefined) {
    data.device.geo = {};
    if (device.geo.lat !== undefined) data.device.geo.lat = device.geo.lat;
    if (device.geo.lon !== undefined) data.device.geo.lon = device.geo.lon;
  }

  return data;
}

// 请求JSON格式化
const requestJsonFormatted = computed(() => {
  try {
    return JSON.stringify(buildRequestData(), null, 2);
  } catch {
    return '{}';
  }
});

// 响应JSON格式化
const responseJsonFormatted = computed(() => {
  if (!response.value) return '{}';
  try {
    return JSON.stringify(response.value, null, 2);
  } catch {
    return '{}';
  }
});

// 诊断结果 JSON 格式化（用于缓存检查等）
const diagResultJson = computed(() => {
  if (!diagResult.value) return '{}';
  try {
    return JSON.stringify(diagResult.value, null, 2);
  } catch {
    return '{}';
  }
});

// 构建 BuildIndexRequest 数据
function buildDiagnosticData() {
  return {
    adSlotId: buildIndexForm.adSlotId || undefined,
    os: buildIndexForm.os || undefined,
    deviceType: buildIndexForm.deviceType || undefined,
    ip: buildIndexForm.ip || undefined,
  };
}

// 诊断：构建索引 Key
async function runBuildIndexKeys() {
  if (!buildIndexForm.adSlotId?.trim()) {
    ElMessage.warning('请输入广告位ID');
    return;
  }
  diagLoading.indexKeys = true;
  diagResult.value = null;
  diagError.value = null;
  diagResultStatus.value = null;
  try {
    const res = await buildIndexKeys(buildDiagnosticData());
    diagResult.value = res.data ?? res;
    diagResultStatus.value = 'success';
    ElMessage.success('构建成功');
  } catch (error) {
    diagError.value = error.message || '未知错误';
    diagResultStatus.value = 'error';
    ElMessage.error('构建失败：' + (error.message || '未知错误'));
  } finally {
    diagLoading.indexKeys = false;
  }
}

// 诊断：匹配 DSP
async function runMatchDsps() {
  if (!buildIndexForm.adSlotId?.trim()) {
    ElMessage.warning('请输入广告位ID');
    return;
  }
  diagLoading.matchDsps = true;
  diagResult.value = null;
  diagError.value = null;
  diagResultStatus.value = null;
  try {
    const res = await matchDsps(buildDiagnosticData());
    diagResult.value = res.data ?? res;
    diagResultStatus.value = 'success';
    ElMessage.success('匹配成功');
  } catch (error) {
    diagError.value = error.message || '未知错误';
    diagResultStatus.value = 'error';
    ElMessage.error('匹配失败：' + (error.message || '未知错误'));
  } finally {
    diagLoading.matchDsps = false;
  }
}

// 诊断：检查缓存
async function runInspectCache() {
  if (!cacheForm.key?.trim()) {
    ElMessage.warning('请输入缓存 Key');
    return;
  }
  diagLoading.cacheInspect = true;
  diagResult.value = null;
  diagError.value = null;
  diagResultStatus.value = null;
  try {
    const res = await inspectCacheData(cacheForm.key.trim(), cacheForm.cacheType);
    diagResult.value = res.data ?? res;
    diagResultStatus.value = 'success';
    ElMessage.success('检查成功');
  } catch (error) {
    diagError.value = error.message || '未知错误';
    diagResultStatus.value = 'error';
    ElMessage.error('检查失败：' + (error.message || '未知错误'));
  } finally {
    diagLoading.cacheInspect = false;
  }
}

// 复制请求JSON
function copyRequestJson() {
  const json = requestJsonFormatted.value;

  // 优先使用现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(json)
      .then(() => {
        ElMessage.success('已复制到剪贴板');
      })
      .catch(() => {
        ElMessage.error('复制失败');
      });
    return;
  }

  // 回退方案：使用 textarea + execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = json;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (success) {
      ElMessage.success('已复制到剪贴板');
    } else {
      ElMessage.error('复制失败');
    }
  } catch {
    ElMessage.error('复制失败');
  }
}

// 获取点击类型标签
function getClickTypeLabel(ct) {
  const types = {
    1: '浏览器打开',
    2: '安卓应用下载',
    3: 'DeepLink',
    4: 'iOS应用',
  };
  return types[ct] || '未知';
}

// 发送请求
async function submitRequest() {
  const requestData = buildRequestData();

  if (!requestData.imp || requestData.imp.length === 0) {
    ElMessage.warning('请至少配置一个有效的曝光对象（广告位ID必填）');
    return;
  }

  loading.value = true;
  response.value = null;
  responseError.value = null;
  responseStatus.value = null;

  try {
    const res = await fetchAd(requestData);
    response.value = res.data || res;
    responseStatus.value = 'success';
    activeAdCollapse.value = response.value.ads?.length > 0 ? ['ad-0'] : [];
    ElMessage.success('请求成功');
  } catch (error) {
    responseStatus.value = 'error';
    responseError.value = {
      title: '请求失败',
      message: error.message || '未知错误',
    };
    ElMessage.error('请求失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 初始化
generateRequestId();
</script>

<style scoped lang="scss">
.ad-simulator {
  padding: 20px;
  min-height: calc(100vh - 100px);

  .mode-tabs {
    margin-bottom: 20px;

    .mode-switch {
      :deep(.el-radio-button__inner) {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .diagnostic-tabs {
    border: none;
    box-shadow: none;

    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    .diagnostic-tip {
      font-size: 13px;
      color: #909399;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .diagnostic-btn {
      margin-bottom: 16px;
    }

    .cache-form {
      max-width: 400px;
    }

    .build-index-form {
      max-width: 400px;
    }
  }

  .diagnostic-result {
    .result-tag {
      margin: 2px 4px 2px 0;
    }

    .empty-list {
      color: #909399;
      padding: 20px;
      text-align: center;
    }
  }

  .request-card,
  .preview-card,
  .response-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        color: #fff;

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

  .preview-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
  }

  .response-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
    }
  }

  .imp-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e9ecef;
  }

  .collapse-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 20px;

    .generate-btn {
      font-size: 12px;
      padding: 4px 8px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .add-btn {
    width: 100%;
    margin-bottom: 16px;
    border-style: dashed;
  }

  .submit-section {
    margin-top: 24px;
    text-align: center;

    .submit-btn {
      min-width: 200px;
      height: 48px;
      font-size: 16px;
      border-radius: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      }
    }
  }

  .json-viewer {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 16px;
    max-height: 300px;
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

  .response-json {
    max-height: 400px;
  }

  .empty-response {
    padding: 40px 0;
    text-align: center;
  }

  .error-response {
    padding: 20px 0;
  }

  .response-overview {
    margin-bottom: 20px;
  }

  .ads-list {
    margin-top: 16px;

    .ad-detail {
      margin-bottom: 16px;
    }
  }

  .tracking-urls {
    margin-top: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;

    .tracking-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 8px;
    }

    .tracking-tag {
      margin: 4px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .native-ad-section {
    margin-top: 16px;
  }

  .native-images {
    margin-top: 16px;

    .images-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 12px;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;

      .image-item {
        text-align: center;

        .el-image {
          width: 100%;
          height: 80px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        &.main-image .el-image {
          height: 120px;
        }

        .image-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  :deep(.el-collapse-item__header) {
    font-weight: 500;
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

