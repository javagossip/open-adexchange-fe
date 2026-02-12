<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="日志类型" prop="logType">
        <el-select
          v-model="queryParams.logType"
          placeholder="请选择日志类型"
          clearable
          style="width: 240px"
        >
          <el-option label="全局" value="GLOBAL" />
          <el-option label="竞价请求" value="BID_REQ" />
          <el-option label="竞价响应" value="BID_RSP" />
          <el-option label="DSP请求" value="DSP_REQ" />
          <el-option label="DSP响应" value="DSP_RSP" />
        </el-select>
      </el-form-item>
      <el-form-item label="媒体" prop="mediaId">
        <el-select
          v-model="queryParams.mediaId"
          placeholder="请选择媒体"
          clearable
          filterable
          remote
          :remote-method="searchPublishers"
          :loading="publisherLoading"
          style="width: 240px"
        >
          <el-option
            v-for="item in publisherOptions"
            :key="item.id"
            :label="`${item.name} (ID:${item.id})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="DSP平台" prop="dspId">
        <el-select
          v-model="queryParams.dspId"
          placeholder="请选择DSP平台"
          clearable
          filterable
          remote
          :remote-method="searchDsps"
          :loading="dspLoading"
          style="width: 240px"
        >
          <el-option
            v-for="item in dspOptions"
            :key="item.id"
            :label="`${item.name} (ID:${item.id})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="广告位" prop="adSlotId">
        <el-select
          v-model="queryParams.adSlotId"
          placeholder="请选择广告位"
          clearable
          filterable
          remote
          :remote-method="searchAdSlots"
          :loading="adSlotLoading"
          style="width: 240px"
        >
          <el-option
            v-for="item in adSlotOptions"
            :key="item.id"
            :label="`${item.name} (ID:${item.id})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 240px"
        >
          <el-option label="禁用" :value="0" />
          <el-option label="启用" :value="1" />
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

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="日志类型" align="center" prop="logType" width="120">
        <template #default="scope">
          <el-tag :type="getLogTypeTag(scope.row.logType)">{{ getLogTypeLabel(scope.row.logType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="媒体ID" align="center" prop="mediaId" width="100">
        <template #default="scope">
          <span v-if="scope.row.mediaId">{{ scope.row.mediaId }}</span>
          <el-tag v-else type="info" size="small">全部</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="DSP平台ID" align="center" prop="dspId" width="120">
        <template #default="scope">
          <span v-if="scope.row.dspId">{{ scope.row.dspId }}</span>
          <el-tag v-else type="info" size="small">全部</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="广告位ID" align="center" prop="adSlotId" width="120">
        <template #default="scope">
          <span v-if="scope.row.adSlotId">{{ scope.row.adSlotId }}</span>
          <el-tag v-else type="info" size="small">全部</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="采样率(万分位)" align="center" prop="samplingRate" width="140">
        <template #default="scope">
          <el-tag type="warning" size="large">{{ scope.row.samplingRate }}</el-tag>
          <span style="color: #909399; font-size: 12px; margin-left: 5px;">
            ({{ (scope.row.samplingRate / 100).toFixed(2) }}%)
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
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

    <!-- 添加或修改日志采样配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="日志类型" prop="logType">
          <el-select
            v-model="form.logType"
            placeholder="请选择日志类型"
            style="width: 100%"
          >
            <el-option label="全局" value="GLOBAL" />
            <el-option label="竞价请求" value="BID_REQ" />
            <el-option label="竞价响应" value="BID_RSP" />
            <el-option label="DSP请求" value="DSP_REQ" />
            <el-option label="DSP响应" value="DSP_RSP" />
          </el-select>
        </el-form-item>
        <el-form-item label="媒体" prop="mediaId">
          <el-select
            v-model="form.mediaId"
            placeholder="留空表示全部媒体"
            clearable
            filterable
            remote
            :remote-method="searchPublishers"
            :loading="publisherLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in publisherOptions"
              :key="item.id"
              :label="`${item.name} (ID:${item.id})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="DSP平台" prop="dspId">
          <el-select
            v-model="form.dspId"
            placeholder="留空表示全部DSP"
            clearable
            filterable
            remote
            :remote-method="searchDsps"
            :loading="dspLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in dspOptions"
              :key="item.id"
              :label="`${item.name} (ID:${item.id})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="广告位" prop="adSlotId">
          <el-select
            v-model="form.adSlotId"
            placeholder="留空表示全部广告位"
            clearable
            filterable
            remote
            :remote-method="searchAdSlots"
            :loading="adSlotLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in adSlotOptions"
              :key="item.id"
              :label="`${item.name} (ID:${item.id})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采样率(万分位)" prop="samplingRate">
          <div style="display: flex; width: 100%; align-items: center; gap: 8px;">
            <el-input-number
              v-model="form.samplingRate"
              :min="0"
              :max="10000"
              placeholder="0-10000，10000表示100%"
              style="flex: 1"
              controls-position="right"
            />
            <el-button type="primary" link @click="setFullSampling">全量采样</el-button>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            万分位采样率，0-10000之间，例如：1000表示10%，10000表示100%
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
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
  </div>
</template>

<script setup name="LogSamplingConfig">
import {
  listLogSamplingConfig,
  getLogSamplingConfig,
  delLogSamplingConfig,
  addLogSamplingConfig,
  updateLogSamplingConfig,
} from '@/api/monitor/logSamplingConfig';
import { searchPublisher } from '@/api/publisher/publisher';
import { searchDsp } from '@/api/dsp/dsp';
import { searchSiteAdPlacement } from '@/api/publisher/siteadplacement';

const { proxy } = getCurrentInstance();

const configList = ref([]);
const publisherOptions = ref([]);
const dspOptions = ref([]);
const adSlotOptions = ref([]);
const publisherLoading = ref(false);
const dspLoading = ref(false);
const adSlotLoading = ref(false);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    logType: undefined,
    mediaId: undefined,
    dspId: undefined,
    adSlotId: undefined,
    status: undefined,
  },
  rules: {
    logType: [{ required: true, message: '日志类型不能为空', trigger: 'change' }],
    samplingRate: [
      { required: true, message: '采样率不能为空', trigger: 'blur' },
      { type: 'number', min: 0, max: 10000, message: '采样率必须在0-10000之间', trigger: 'blur' },
    ],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 获取日志类型标签 */
function getLogTypeTag(logType) {
  const tagMap = {
    GLOBAL: '',
    BID_REQ: 'success',
    BID_RSP: 'info',
    DSP_REQ: 'warning',
    DSP_RSP: 'danger',
  };
  return tagMap[logType] || '';
}

/** 获取日志类型文本 */
function getLogTypeLabel(logType) {
  const labelMap = {
    GLOBAL: '全局',
    BID_REQ: '竞价请求',
    BID_RSP: '竞价响应',
    DSP_REQ: 'DSP请求',
    DSP_RSP: 'DSP响应',
  };
  return labelMap[logType] || logType;
}

/** 查询配置列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;

  listLogSamplingConfig(params).then((response) => {
    if (response.data && response.data.records) {
      configList.value = response.data.records;
      total.value = response.data.total;
    } else if (response.records) {
      configList.value = response.records;
      total.value = response.total;
    } else {
      configList.value = [];
      total.value = 0;
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
    logType: undefined,
    mediaId: undefined,
    dspId: undefined,
    adSlotId: undefined,
    samplingRate: 0,
    status: 1,
  };
  proxy.resetForm('configRef');
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
  title.value = '添加日志采样配置';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getLogSamplingConfig(id).then((response) => {
    const data = response.data || response;
    form.value = { ...data };
    open.value = true;
    title.value = '修改日志采样配置';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['configRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateLogSamplingConfig(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addLogSamplingConfig(form.value).then((response) => {
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
  const configIds = row.id || ids.value;
  const configId = Array.isArray(configIds) ? configIds[0] : configIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + configId + '"的日志采样配置？')
    .then(function () {
      return delLogSamplingConfig(configId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 状态切换 */
function handleStatusChange(row) {
  const text = row.status === 1 ? '启用' : '禁用';
  proxy.$modal
    .confirm('确认要"' + text + '"该配置吗？')
    .then(function () {
      return updateLogSamplingConfig(row);
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功');
      getList();
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1;
    });
}

/** 一键设置全量采样 */
function setFullSampling() {
  form.value.samplingRate = 10000;
}

/** 远程搜索媒体 */
async function searchPublishers(searchKey) {
  if (!searchKey && publisherOptions.value.length > 0) {
    return;
  }
  publisherLoading.value = true;
  try {
    const response = await searchPublisher(searchKey || '', 50);
    if (response.data) {
      publisherOptions.value = Array.isArray(response.data) ? response.data : [];
    } else {
      publisherOptions.value = Array.isArray(response) ? response : [];
    }
  } catch (e) {
    publisherOptions.value = [];
  } finally {
    publisherLoading.value = false;
  }
}

/** 远程搜索DSP */
async function searchDsps(searchKey) {
  if (!searchKey && dspOptions.value.length > 0) {
    return;
  }
  dspLoading.value = true;
  try {
    const response = await searchDsp(searchKey || '');
    if (response.data) {
      dspOptions.value = Array.isArray(response.data) ? response.data : [];
    } else {
      dspOptions.value = Array.isArray(response) ? response : [];
    }
  } catch (e) {
    dspOptions.value = [];
  } finally {
    dspLoading.value = false;
  }
}

/** 远程搜索广告位 */
async function searchAdSlots(searchKey) {
  if (!searchKey && adSlotOptions.value.length > 0) {
    return;
  }
  adSlotLoading.value = true;
  try {
    const response = await searchSiteAdPlacement(searchKey || '', 50);
    if (response.data) {
      adSlotOptions.value = Array.isArray(response.data) ? response.data : [];
    } else {
      adSlotOptions.value = Array.isArray(response) ? response : [];
    }
  } catch (e) {
    adSlotOptions.value = [];
  } finally {
    adSlotLoading.value = false;
  }
}

// 初始化时加载默认数据
searchPublishers('');
searchDsps('');
searchAdSlots('');
getList();
</script>
