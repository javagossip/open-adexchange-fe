<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="广告位名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入广告位名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入广告编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告位格式" prop="adFormat">
        <el-select
          v-model="queryParams.adFormat"
          placeholder="广告位格式"
          clearable
          style="width: 240px"
        >
          <el-option label="横幅广告" value="BANNER" />
          <el-option label="视频广告" value="VIDEO" />
          <el-option label="原生广告" value="NATIVE" />
          <el-option label="音频广告" value="AUDIO" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px"
        >
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="adPlacementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="广告位名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="广告编码"
        align="center"
        prop="code"
        width="150"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="广告位格式" align="center" prop="adFormat" width="120">
        <template #default="scope">
          <el-tag>{{ getFormatLabel(scope.row.adFormat) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="scope.row.status === 0"
            link
            type="success"
            icon="Check"
            @click="handleEnable(scope.row)"
            >启用</el-button
          >
          <el-button
            v-if="scope.row.status === 1"
            link
            type="warning"
            icon="Close"
            @click="handleDisable(scope.row)"
            >禁用</el-button
          >
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改广告位对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="adPlacementRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="广告位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入广告位名称" />
        </el-form-item>
        <el-form-item v-if="form.id" label="广告位编码" prop="code">
          <el-input v-model="form.code" placeholder="广告位编码" :disabled="true" />
        </el-form-item>
        <el-form-item label="广告位格式" prop="adFormat">
          <el-select v-model="form.adFormat" placeholder="请选择广告位格式" style="width: 100%" @change="handleAdFormatChange">
            <el-option label="横幅广告" value="BANNER" />
            <el-option label="视频广告" value="VIDEO" />
            <el-option label="原生广告" value="NATIVE" />
            <el-option label="音频广告" value="AUDIO" />
          </el-select>
        </el-form-item>

        <!-- Banner 广告规格配置 -->
        <el-divider v-if="form.adFormat === 'BANNER'" content-position="left">Banner广告规格配置</el-divider>
        <template v-if="form.adFormat === 'BANNER'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Banner宽度" prop="banner.width">
                <el-input-number
                  v-model="form.banner.width"
                  :min="0"
                  placeholder="宽度(px)"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Banner高度" prop="banner.height">
                <el-input-number
                  v-model="form.banner.height"
                  :min="0"
                  placeholder="高度(px)"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 视频广告规格配置 -->
        <el-divider v-if="form.adFormat === 'VIDEO'" content-position="left">视频广告规格配置</el-divider>
        <template v-if="form.adFormat === 'VIDEO'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最小时长(秒)" prop="video.minDuration">
                <el-input-number
                  v-model="form.video.minDuration"
                  :min="0"
                  placeholder="最小时长"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大时长(秒)" prop="video.maxDuration">
                <el-input-number
                  v-model="form.video.maxDuration"
                  :min="0"
                  placeholder="最大时长"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="允许跳过" prop="video.skippable">
            <el-switch v-model="form.video.skippable" />
          </el-form-item>
          <el-row v-if="form.video.skippable" :gutter="20">
            <el-col :span="12">
              <el-form-item label="跳过时间(秒)" prop="video.skipAfter">
                <el-input-number
                  v-model="form.video.skipAfter"
                  :min="0"
                  placeholder="播放几秒后可跳过"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最小跳过时长" prop="video.skipMin">
                <el-input-number
                  v-model="form.video.skipMin"
                  :min="0"
                  placeholder="视频总时长需大于此值"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="支持的格式" prop="video.mimes">
            <el-select
              v-model="form.video.mimes"
              multiple
              placeholder="请选择支持的视频格式"
              style="width: 100%"
            >
              <el-option label="video/mp4" value="video/mp4" />
              <el-option label="video/webm" value="video/webm" />
              <el-option label="video/ogg" value="video/ogg" />
              <el-option label="video/3gpp" value="video/3gpp" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 音频广告规格配置 -->
        <el-divider v-if="form.adFormat === 'AUDIO'" content-position="left">音频广告规格配置</el-divider>
        <template v-if="form.adFormat === 'AUDIO'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最小时长(秒)" prop="audio.minDuration">
                <el-input-number
                  v-model="form.audio.minDuration"
                  :min="0"
                  placeholder="最小时长"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大时长(秒)" prop="audio.maxDuration">
                <el-input-number
                  v-model="form.audio.maxDuration"
                  :min="0"
                  placeholder="最大时长"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="允许跳过" prop="audio.skippable">
            <el-switch v-model="form.audio.skippable" />
          </el-form-item>
          <el-row v-if="form.audio.skippable" :gutter="20">
            <el-col :span="12">
              <el-form-item label="跳过时间(秒)" prop="audio.skipAfter">
                <el-input-number
                  v-model="form.audio.skipAfter"
                  :min="0"
                  placeholder="播放几秒后可跳过"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最小跳过时长" prop="audio.skipMin">
                <el-input-number
                  v-model="form.audio.skipMin"
                  :min="0"
                  placeholder="音频总时长需大于此值"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="支持的格式" prop="audio.mimes">
            <el-select
              v-model="form.audio.mimes"
              multiple
              placeholder="请选择支持的音频格式"
              style="width: 100%"
            >
              <el-option label="audio/mpeg" value="audio/mpeg" />
              <el-option label="audio/mp3" value="audio/mp3" />
              <el-option label="audio/ogg" value="audio/ogg" />
              <el-option label="audio/wav" value="audio/wav" />
              <el-option label="audio/aac" value="audio/aac" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 原生广告规格配置 -->
        <el-divider v-if="form.adFormat === 'NATIVE'" content-position="left">原生广告规格配置</el-divider>
        <template v-if="form.adFormat === 'NATIVE'">
          <el-form-item label="原生资产配置">
            <el-button type="primary" size="small" @click="handleAddNativeAsset">添加资产</el-button>
          </el-form-item>
          <el-table :data="form.nativeAd.nativeAssets" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column label="字段名称" prop="assetName" width="100" />
            <el-table-column label="字段标识" prop="assetKey" width="100" />
            <el-table-column label="资产类型" prop="assetType" width="100">
              <template #default="scope">
                {{ scope.row.assetType || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="数据资产类型" prop="dataAssetType" width="120">
              <template #default="scope">
                <span v-if="scope.row.dataAssetType">{{ scope.row.dataAssetType }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="格式" prop="format" width="80">
              <template #default="scope">
                <el-tag size="small" :type="getFormatTagType(getRowFormat(scope.row))">
                  {{ getNativeAssetFormatLabel(getRowFormat(scope.row)) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="必填" prop="required" width="60" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.required ? 'danger' : 'info'" size="small">
                  {{ scope.row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="尺寸/长度" width="120">
              <template #default="scope">
                <span v-if="isImageOrVideoFormat(getRowFormat(scope.row))">
                  {{ scope.row.width || '-' }}×{{ scope.row.height || '-' }}
                </span>
                <span v-else-if="isTextFormat(getRowFormat(scope.row))">
                  {{ scope.row.minLength || 0 }}-{{ scope.row.maxLength || '∞' }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="约束配置" width="150">
              <template #default="scope">
                <span style="font-size: 12px;">
                  {{ formatConstraints(scope.row.constraints, getRowFormat(scope.row)) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEditNativeAsset(scope.$index)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteNativeAsset(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 原生资产编辑对话框 -->
    <el-dialog title="编辑原生资产" v-model="nativeAssetDialogOpen" width="600px" append-to-body>
      <el-form ref="nativeAssetRef" :model="nativeAssetForm" :rules="nativeAssetRules" label-width="100px">
        <el-form-item label="资产类型" prop="assetTypeKey">
          <el-select v-model="nativeAssetForm.assetTypeKey" placeholder="请选择资产类型" style="width: 100%" @change="handleAssetTypeChange">
            <el-option-group label="标题类型">
              <el-option label="标题" value="TITLE" />
            </el-option-group>
            <el-option-group label="图片类型">
              <el-option label="图标" value="ICON" />
              <el-option label="主图" value="MAIN_IMAGE" />
              <el-option label="图片" value="IMAGE" />
            </el-option-group>
            <el-option-group label="视频类型">
              <el-option label="视频" value="VIDEO" />
            </el-option-group>
            <el-option-group label="数据类型 - 文本">
              <el-option label="描述" value="DESC" />
              <el-option label="描述2" value="DESC2" />
              <el-option label="赞助方" value="SPONSORED" />
              <el-option label="CTA" value="CTA" />
              <el-option label="地址" value="ADDRESS" />
            </el-option-group>
            <el-option-group label="数据类型 - 数字">
              <el-option label="评分" value="RATING" />
              <el-option label="点赞数" value="LIKES" />
              <el-option label="下载数" value="DOWNLOADS" />
            </el-option-group>
            <el-option-group label="数据类型 - 货币">
              <el-option label="价格" value="PRICE" />
              <el-option label="销售价格" value="SALE_PRICE" />
            </el-option-group>
            <el-option-group label="数据类型 - 电话">
              <el-option label="电话" value="PHONE" />
            </el-option-group>
            <el-option-group label="URL类型">
              <el-option label="展示地址" value="DISPLAY_URL" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item v-if="nativeAssetForm.assetTypeKey && getAssetInfo(nativeAssetForm.assetTypeKey)?.dataAssetType" label="数据资产类型" prop="dataAssetType">
          <el-input v-model="nativeAssetForm.dataAssetType" :disabled="true" placeholder="自动填充" />
        </el-form-item>
        <el-form-item label="字段名称" prop="assetName">
          <el-input v-model="nativeAssetForm.assetName" placeholder="请输入字段名称，如：标题" />
        </el-form-item>
        <el-form-item label="字段标识" prop="assetKey">
          <el-input v-model="nativeAssetForm.assetKey" placeholder="请输入字段标识，如：title" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否必填" prop="required">
              <el-switch v-model="nativeAssetForm.required" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可重复" prop="repeatable">
              <el-switch v-model="nativeAssetForm.repeatable" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 文本格式字段 (text) -->
        <template v-if="nativeAssetForm.assetTypeKey && isTextFormat(getAssetFormat(nativeAssetForm.assetTypeKey))">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最小长度" prop="minLength">
                <el-input-number v-model="nativeAssetForm.minLength" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大长度" prop="maxLength">
                <el-input-number v-model="nativeAssetForm.maxLength" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <!-- 图片/视频格式字段 (image/video) -->
        <template v-if="nativeAssetForm.assetTypeKey && isImageOrVideoFormat(getAssetFormat(nativeAssetForm.assetTypeKey))">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="宽度" prop="width">
                <el-input-number v-model="nativeAssetForm.width" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="高度" prop="height">
                <el-input-number v-model="nativeAssetForm.height" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="比例限制" prop="ratio">
            <el-input v-model="nativeAssetForm.ratio" placeholder="如：16:9" />
          </el-form-item>
          <el-form-item label="MIME类型" prop="mimeTypes">
            <el-input v-model="nativeAssetForm.mimeTypes" placeholder="如：image/jpeg,image/png" />
          </el-form-item>
          <el-form-item label="最大大小(KB)" prop="maxSizeKb">
            <el-input-number v-model="nativeAssetForm.maxSizeKb" :min="0" style="width: 100%" />
          </el-form-item>
        </template>
        <!-- 数据资产约束 (constraints) - 用于 number/money/phone 等格式 -->
        <template v-if="nativeAssetForm.assetTypeKey && isDataAssetWithConstraints(nativeAssetForm.assetTypeKey)">
          <el-divider content-position="left">约束配置</el-divider>
          <!-- number 类型约束：min, max, scale -->
          <template v-if="getAssetFormat(nativeAssetForm.assetTypeKey) === 'number'">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="最小值" prop="constraints.min">
                  <el-input
                    v-model.number="nativeAssetForm.constraints.min"
                    type="number"
                    placeholder="最小值"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大值" prop="constraints.max">
                  <el-input
                    v-model.number="nativeAssetForm.constraints.max"
                    type="number"
                    placeholder="最大值"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="小数位数" prop="constraints.scale">
                  <el-input
                    v-model.number="nativeAssetForm.constraints.scale"
                    type="number"
                    placeholder="小数位数"
                    :min="0"
                    :max="10"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          <!-- money 类型约束：currency, precision -->
          <template v-if="getAssetFormat(nativeAssetForm.assetTypeKey) === 'money'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="币种" prop="constraints.currency">
                  <el-select
                    v-model="nativeAssetForm.constraints.currency"
                    placeholder="请选择币种"
                    filterable
                    allow-create
                    clearable
                    style="width: 100%"
                  >
                    <el-option label="USD (美元)" value="USD" />
                    <el-option label="CNY (人民币)" value="CNY" />
                    <el-option label="EUR (欧元)" value="EUR" />
                    <el-option label="GBP (英镑)" value="GBP" />
                    <el-option label="JPY (日元)" value="JPY" />
                    <el-option label="HKD (港币)" value="HKD" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="精度" prop="constraints.precision">
                  <el-input
                    v-model.number="nativeAssetForm.constraints.precision"
                    type="number"
                    placeholder="精度（小数位数）"
                    :min="0"
                    :max="10"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          <!-- phone 类型约束：可以添加格式验证规则 -->
          <template v-if="getAssetFormat(nativeAssetForm.assetTypeKey) === 'phone'">
            <el-form-item label="格式验证" prop="constraints.pattern">
              <el-input
                v-model="nativeAssetForm.constraints.pattern"
                placeholder="正则表达式，如：^1[3-9]\\d{9}$ (中国手机号)"
                clearable
              />
              <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                可选：输入正则表达式用于验证电话号码格式
              </div>
            </el-form-item>
          </template>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitNativeAsset">确 定</el-button>
          <el-button @click="nativeAssetDialogOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdPlacement">
import {
  listAdPlacement,
  getAdPlacement,
  delAdPlacement,
  addAdPlacement,
  updateAdPlacement,
  enableAdPlacement,
  disableAdPlacement,
} from '@/api/publisher/adplacement';

const { proxy } = getCurrentInstance();

const adPlacementList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 原生资产编辑
const nativeAssetDialogOpen = ref(false);
const nativeAssetForm = ref({});
const editingNativeAssetIndex = ref(-1);

// 原生资产类型映射 - 根据 NativeAssetType 枚举定义
const nativeAssetTypeMap = {
  // title 类型
  TITLE: { name: '标题', code: 'title', assetType: 'title', dataAssetType: null, format: 'text' },
  // image 类型
  ICON: { name: '图标', code: 'icon', assetType: 'image', dataAssetType: null, format: 'image' },
  MAIN_IMAGE: { name: '主图', code: 'main_image', assetType: 'image', dataAssetType: null, format: 'image' },
  IMAGE: { name: '图片', code: 'image', assetType: 'image', dataAssetType: null, format: 'image' },
  // video 类型
  VIDEO: { name: '视频', code: 'video', assetType: 'video', dataAssetType: null, format: 'video' },
  // data 类型 - 文本格式
  DESC: { name: '描述', code: 'desc', assetType: 'data', dataAssetType: 'desc', format: 'text' },
  DESC2: { name: '描述2', code: 'desc2', assetType: 'data', dataAssetType: 'desc2', format: 'text' },
  SPONSORED: { name: '赞助方', code: 'sponsored', assetType: 'data', dataAssetType: 'sponsored', format: 'text' },
  CTA: { name: 'CTA', code: 'ctatext', assetType: 'data', dataAssetType: 'ctatext', format: 'text' },
  ADDRESS: { name: '地址', code: 'address', assetType: 'data', dataAssetType: 'address', format: 'text' },
  // data 类型 - 数字格式
  RATING: { name: '评分', code: 'rating', assetType: 'data', dataAssetType: 'rating', format: 'number' },
  LIKES: { name: '点赞数', code: 'likes', assetType: 'data', dataAssetType: 'likes', format: 'number' },
  DOWNLOADS: { name: '下载数', code: 'downloads', assetType: 'data', dataAssetType: 'downloads', format: 'number' },
  // data 类型 - 货币格式
  PRICE: { name: '价格', code: 'price', assetType: 'data', dataAssetType: 'price', format: 'money' },
  SALE_PRICE: { name: '销售价格', code: 'saleprice', assetType: 'data', dataAssetType: 'saleprice', format: 'money' },
  // data 类型 - 电话格式
  PHONE: { name: '电话', code: 'phone', assetType: 'data', dataAssetType: 'phone', format: 'phone' },
  // url 类型
  DISPLAY_URL: { name: '展示地址', code: 'displayurl', assetType: 'url', dataAssetType: 'displayurl', format: 'url' },
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    code: undefined,
    adFormat: undefined,
    status: undefined,
  },
  rules: {
    name: [{ required: true, message: '广告位名称不能为空', trigger: 'blur' }],
    adFormat: [{ required: true, message: '广告位格式不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const nativeAssetRules = {
  assetName: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  assetKey: [{ required: true, message: '字段标识不能为空', trigger: 'blur' }],
  assetTypeKey: [{ required: true, message: '资产类型不能为空', trigger: 'change' }],
};

const { queryParams, form, rules } = toRefs(data);

/** 获取格式标签 */
function getFormatLabel(adFormat) {
  const formatMap = {
    BANNER: '横幅广告',
    VIDEO: '视频广告',
    NATIVE: '原生广告',
    AUDIO: '音频广告',
  };
  return formatMap[adFormat] || adFormat;
}

/** 获取资产信息 */
function getAssetInfo(assetTypeKey) {
  return nativeAssetTypeMap[assetTypeKey];
}

/** 获取资产类型标签（通过枚举键） */
function getAssetTypeLabel(assetTypeKey) {
  return nativeAssetTypeMap[assetTypeKey]?.name || assetTypeKey;
}

/** 获取资产类型标签（通过行数据，兼容新旧数据） */
function getAssetTypeLabelByKey(row) {
  // 如果 row 中有 assetTypeKey（枚举键），使用它
  if (row.assetTypeKey) {
    return getAssetTypeLabel(row.assetTypeKey);
  }
  // 否则尝试通过 assetType 和 dataAssetType 查找匹配的枚举
  for (const [key, info] of Object.entries(nativeAssetTypeMap)) {
    if (info.assetType === row.assetType && info.dataAssetType === row.dataAssetType) {
      return info.name;
    }
  }
  // 如果找不到，返回 assetName 或 assetType
  return row.assetName || row.assetType || '-';
}

/** 获取原生资产格式标签 */
function getNativeAssetFormatLabel(format) {
  const formatMap = {
    text: '文本',
    image: '图片',
    video: '视频',
    number: '数字',
    money: '货币',
    phone: '电话',
    url: 'URL',
  };
  return formatMap[format] || format || '-';
}

/** 获取格式标签颜色 */
function getFormatTagType(format) {
  const formatTagMap = {
    text: '',
    image: 'success',
    video: 'warning',
    number: 'info',
    money: 'warning',
    phone: '',
    url: 'danger',
  };
  return formatTagMap[format] || '';
}

/** 获取资产格式 */
function getAssetFormat(assetTypeKey) {
  return nativeAssetTypeMap[assetTypeKey]?.format;
}

/** 获取行的格式（从 format 字段或根据 assetType 和 dataAssetType 推断） */
function getRowFormat(row) {
  // 如果已经有 format 字段，直接返回
  if (row.format) {
    return row.format;
  }
  // 否则根据 assetType 和 dataAssetType 查找对应的枚举并返回 format
  const assetTypeKey = findAssetTypeKey(row.assetType, row.dataAssetType);
  if (assetTypeKey) {
    return getAssetFormat(assetTypeKey);
  }
  // 如果找不到，根据 assetType 返回默认格式
  const defaultFormatMap = {
    title: 'text',
    image: 'image',
    video: 'video',
    data: 'text', // data 类型默认是 text，但实际应该根据 dataAssetType 确定
    url: 'url',
  };
  return defaultFormatMap[row.assetType] || '';
}

/** 判断是否为文本格式 */
function isTextFormat(format) {
  return format === 'text';
}

/** 判断是否为图片/视频格式 */
function isImageOrVideoFormat(format) {
  return format === 'image' || format === 'video';
}

/** 判断是否为需要约束配置的数据资产 */
function isDataAssetWithConstraints(assetTypeKey) {
  const format = getAssetFormat(assetTypeKey);
  return format === 'number' || format === 'money' || format === 'phone';
}

/** 格式化约束信息用于显示 */
function formatConstraints(constraints, format) {
  if (!constraints || typeof constraints !== 'object') {
    return '-';
  }
  const parts = [];
  if (format === 'number') {
    if (constraints.min !== undefined) parts.push(`min:${constraints.min}`);
    if (constraints.max !== undefined) parts.push(`max:${constraints.max}`);
    if (constraints.scale !== undefined) parts.push(`scale:${constraints.scale}`);
  } else if (format === 'money') {
    if (constraints.currency) parts.push(`币种:${constraints.currency}`);
    if (constraints.precision !== undefined) parts.push(`精度:${constraints.precision}`);
  } else if (format === 'phone') {
    if (constraints.pattern) parts.push('已配置格式');
  }
  return parts.length > 0 ? parts.join(', ') : '-';
}

/** 查询广告位列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listAdPlacement(params).then((response) => {
    if (response.records) {
      adPlacementList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      adPlacementList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      adPlacementList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      adPlacementList.value = Array.isArray(response) ? response : [];
      total.value = adPlacementList.value.length;
    }
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
    adFormat: undefined,
    banner: { width: undefined, height: undefined },
    video: { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] },
    audio: { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] },
    nativeAd: { nativeAssets: [] },
    status: 1,
  };
  proxy.resetForm('adPlacementRef');
}

/** 广告位格式变化处理 */
function handleAdFormatChange(val) {
  // 切换格式时重置对应的规格配置
  if (val === 'BANNER') {
    form.value.banner = { width: undefined, height: undefined };
  } else if (val === 'VIDEO') {
    form.value.video = { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] };
  } else if (val === 'AUDIO') {
    form.value.audio = { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] };
  } else if (val === 'NATIVE') {
    form.value.nativeAd = { nativeAssets: [] };
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加广告位';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getAdPlacement(id).then((response) => {
    const data = response.data || response;
    form.value = {
      ...data,
      banner: data.banner || { width: undefined, height: undefined },
      video: data.video || { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] },
      audio: data.audio || { minDuration: undefined, maxDuration: undefined, skippable: false, skipAfter: undefined, skipMin: undefined, mimes: [] },
      nativeAd: data.nativeAd || { nativeAssets: [] },
    };
    open.value = true;
    title.value = '修改广告位';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['adPlacementRef'].validate((valid) => {
    if (valid) {
      // 根据adFormat清理不需要的规格配置
      const submitData = { ...form.value };
      if (submitData.adFormat !== 'BANNER') submitData.banner = null;
      if (submitData.adFormat !== 'VIDEO') submitData.video = null;
      if (submitData.adFormat !== 'AUDIO') submitData.audio = null;
      if (submitData.adFormat !== 'NATIVE') submitData.nativeAd = null;

      if (submitData.id != undefined) {
        updateAdPlacement(submitData).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addAdPlacement(submitData).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const adPlacementIds = row.id || ids.value;
  const adPlacementId = Array.isArray(adPlacementIds) ? adPlacementIds[0] : adPlacementIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + adPlacementId + '"的数据项？')
    .then(function () {
      return delAdPlacement(adPlacementId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 启用按钮操作 */
function handleEnable(row) {
  const id = row.id;
  proxy.$modal
    .confirm('是否确认启用ID为"' + id + '"的广告位？')
    .then(function () {
      return enableAdPlacement(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('启用成功');
    })
    .catch(() => {});
}

/** 禁用按钮操作 */
function handleDisable(row) {
  const id = row.id;
  proxy.$modal
    .confirm('是否确认禁用ID为"' + id + '"的广告位？')
    .then(function () {
      return disableAdPlacement(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

// ========== 原生资产管理 ==========

/** 添加原生资产 */
function handleAddNativeAsset() {
  editingNativeAssetIndex.value = -1;
  nativeAssetForm.value = {
    assetTypeKey: undefined, // 枚举键（用于选择器）
    assetName: undefined,
    assetKey: undefined,
    assetType: undefined, // 基础资产类型 (title/image/video/data/url)
    dataAssetType: undefined, // 数据资产类型（当 assetType 为 data 时）
    required: false,
    repeatable: false,
    minLength: undefined,
    maxLength: undefined,
    width: undefined,
    height: undefined,
    ratio: undefined,
    mimeTypes: undefined,
    maxSizeKb: undefined,
    constraints: {
      min: null,
      max: null,
      scale: null,
      currency: null,
      precision: null,
      pattern: null,
    }, // 数据资产约束（用于 number/money/phone 等），初始化为 null 以保持响应式
  };
  nativeAssetDialogOpen.value = true;
}

/** 编辑原生资产 */
function handleEditNativeAsset(index) {
  editingNativeAssetIndex.value = index;
  const asset = form.value.nativeAd.nativeAssets[index];
  // 根据 assetType 和 dataAssetType 查找对应的枚举键
  const assetTypeKey = findAssetTypeKey(asset.assetType, asset.dataAssetType);
  // 确保 constraints 是一个对象，并创建新的对象以保持响应式
  // 初始化所有可能的约束属性
  const constraints = {
    min: null,
    max: null,
    scale: null,
    currency: null,
    precision: null,
    pattern: null,
  };
  // 如果资产已有约束，则复制过来
  if (asset.constraints && typeof asset.constraints === 'object') {
    Object.assign(constraints, asset.constraints);
  }
  nativeAssetForm.value = {
    ...asset,
    assetTypeKey: assetTypeKey, // 设置枚举键用于选择器回显
    constraints: constraints, // 确保 constraints 是对象，包含所有属性
  };
  nativeAssetDialogOpen.value = true;
}

/** 删除原生资产 */
function handleDeleteNativeAsset(index) {
  form.value.nativeAd.nativeAssets.splice(index, 1);
}

/** 资产类型变化 */
function handleAssetTypeChange(assetTypeKey) {
  // 自动填充字段名称、字段标识、资产类型和数据资产类型
  const assetInfo = nativeAssetTypeMap[assetTypeKey];
  if (assetInfo) {
    nativeAssetForm.value.assetName = assetInfo.name;
    nativeAssetForm.value.assetKey = assetInfo.code;
    nativeAssetForm.value.assetType = assetInfo.assetType; // 设置基础资产类型 (title/image/video/data/url)
    nativeAssetForm.value.dataAssetType = assetInfo.dataAssetType || null; // 设置数据资产类型（如果有）
  }
  // 重置类型相关字段
  nativeAssetForm.value.minLength = undefined;
  nativeAssetForm.value.maxLength = undefined;
  nativeAssetForm.value.width = undefined;
  nativeAssetForm.value.height = undefined;
  nativeAssetForm.value.ratio = undefined;
  nativeAssetForm.value.mimeTypes = undefined;
  nativeAssetForm.value.maxSizeKb = undefined;
  // 重置约束配置 - 确保 constraints 对象存在并更新其属性
  if (!nativeAssetForm.value.constraints) {
    nativeAssetForm.value.constraints = {
      min: null,
      max: null,
      scale: null,
      currency: null,
      precision: null,
      pattern: null,
    };
  }
  const format = getAssetFormat(assetTypeKey);
  if (format === 'number') {
    // 重置 number 类型的约束
    nativeAssetForm.value.constraints.min = null;
    nativeAssetForm.value.constraints.max = null;
    nativeAssetForm.value.constraints.scale = null;
    // 清空其他类型的约束
    nativeAssetForm.value.constraints.currency = null;
    nativeAssetForm.value.constraints.precision = null;
    nativeAssetForm.value.constraints.pattern = null;
  } else if (format === 'money') {
    // 重置 money 类型的约束
    nativeAssetForm.value.constraints.currency = null;
    nativeAssetForm.value.constraints.precision = null;
    // 清空其他类型的约束
    nativeAssetForm.value.constraints.min = null;
    nativeAssetForm.value.constraints.max = null;
    nativeAssetForm.value.constraints.scale = null;
    nativeAssetForm.value.constraints.pattern = null;
  } else if (format === 'phone') {
    // 重置 phone 类型的约束
    nativeAssetForm.value.constraints.pattern = null;
    // 清空其他类型的约束
    nativeAssetForm.value.constraints.min = null;
    nativeAssetForm.value.constraints.max = null;
    nativeAssetForm.value.constraints.scale = null;
    nativeAssetForm.value.constraints.currency = null;
    nativeAssetForm.value.constraints.precision = null;
  } else {
    // 清空所有约束
    nativeAssetForm.value.constraints.min = null;
    nativeAssetForm.value.constraints.max = null;
    nativeAssetForm.value.constraints.scale = null;
    nativeAssetForm.value.constraints.currency = null;
    nativeAssetForm.value.constraints.precision = null;
    nativeAssetForm.value.constraints.pattern = null;
  }
}

/** 根据 assetType 和 dataAssetType 查找对应的枚举键（用于编辑时回显） */
function findAssetTypeKey(assetType, dataAssetType) {
  for (const [key, info] of Object.entries(nativeAssetTypeMap)) {
    if (info.assetType === assetType && info.dataAssetType === dataAssetType) {
      return key;
    }
  }
  return null;
}

/** 提交原生资产 */
function submitNativeAsset() {
  proxy.$refs['nativeAssetRef'].validate((valid) => {
    if (valid) {
      // 构建提交数据，移除 assetTypeKey（仅用于前端选择器）
      const submitData = { ...nativeAssetForm.value };
      delete submitData.assetTypeKey;
      
      // 清理空的 constraints 对象
      if (submitData.constraints && Object.keys(submitData.constraints).length === 0) {
        submitData.constraints = undefined;
      } else if (submitData.constraints) {
        // 清理 constraints 中的 undefined 值
        const cleanedConstraints = {};
        for (const [key, value] of Object.entries(submitData.constraints)) {
          if (value !== undefined && value !== null && value !== '') {
            cleanedConstraints[key] = value;
          }
        }
        submitData.constraints = Object.keys(cleanedConstraints).length > 0 ? cleanedConstraints : undefined;
      }
      
      if (editingNativeAssetIndex.value >= 0) {
        form.value.nativeAd.nativeAssets[editingNativeAssetIndex.value] = submitData;
      } else {
        form.value.nativeAd.nativeAssets.push(submitData);
      }
      nativeAssetDialogOpen.value = false;
    }
  });
}

getList();
</script>
