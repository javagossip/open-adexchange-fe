<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="120px"
    >
      <el-form-item label="DSP编码" prop="dspCode">
        <el-input
          v-model="queryParams.dspCode"
          placeholder="请输入DSP编码"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="媒体广告位编码" prop="siteAdPlacementCode">
        <el-input
          v-model="queryParams.siteAdPlacementCode"
          placeholder="请输入媒体广告位编码"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="DSP广告位ID" prop="dspSlotId">
        <el-input
          v-model="queryParams.dspSlotId"
          placeholder="请输入DSP广告位ID"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
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

    <el-table v-loading="loading" :data="mappingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="DSP编码" align="center" prop="dspCode" width="120" />
      <el-table-column
        label="DSP名称"
        align="center"
        prop="dspName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="媒体广告位编码"
        align="center"
        prop="siteAdPlacementCode"
        width="150"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="媒体广告位名称"
        align="center"
        prop="siteAdPlacementName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="DSP广告位ID"
        align="center"
        prop="dspSlotId"
        width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
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

    <!-- 添加DSP广告位映射对话框 -->
    <el-dialog title="新增DSP广告位映射" v-model="open" width="600px" append-to-body>
      <el-form ref="mappingRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="DSP" prop="dspId">
          <el-select
            v-model="form.dspId"
            placeholder="请选择或搜索DSP"
            filterable
            remote
            :remote-method="searchDspList"
            :loading="dspLoading"
            @focus="handleDspFocus"
            @change="handleDspChange"
            style="width: 100%"
          >
            <el-option
              v-for="dsp in dspOptions"
              :key="dsp.id"
              :label="dsp.name"
              :value="dsp.id"
            >
              <span>{{ dsp.name }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 8px;">{{ dsp.dspCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="媒体广告位" prop="siteAdPlacementId">
          <el-select
            v-model="form.siteAdPlacementId"
            placeholder="请选择或搜索媒体广告位"
            filterable
            remote
            :remote-method="searchSiteAdPlacementList"
            :loading="siteAdPlacementLoading"
            @focus="handleSiteAdPlacementFocus"
            style="width: 100%"
          >
            <el-option
              v-for="item in siteAdPlacementOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 8px;">{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="DSP广告位ID" prop="dspSlotId">
          <el-input v-model="form.dspSlotId" placeholder="请输入DSP广告位ID" />
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

<script setup name="DspAdpMapping">
import {
  pageDspPlacementMappings,
  addDspPlacementMapping,
  delDspPlacementMapping,
  searchDsp,
} from '@/api/dsp/dsp';
import { searchSiteAdPlacement } from '@/api/publisher/siteadplacement';

const { proxy } = getCurrentInstance();

const mappingList = ref([]);
const dspOptions = ref([]);
const siteAdPlacementOptions = ref([]);
const dspLoading = ref(false);
const siteAdPlacementLoading = ref(false);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dspCode: undefined,
    siteAdPlacementCode: undefined,
    dspSlotId: undefined,
  },
  rules: {
    dspId: [{ required: true, message: 'DSP不能为空', trigger: 'change' }],
    siteAdPlacementId: [{ required: true, message: '媒体广告位不能为空', trigger: 'change' }],
    dspSlotId: [{ required: true, message: 'DSP广告位ID不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 搜索DSP列表 */
function searchDspList(query) {
  dspLoading.value = true;
  searchDsp(query || '')
    .then((response) => {
      const data = response.data || response;
      dspOptions.value = Array.isArray(data) ? data : [];
    })
    .finally(() => {
      dspLoading.value = false;
    });
}

/** DSP下拉框获取焦点 */
function handleDspFocus() {
  if (dspOptions.value.length === 0) {
    searchDspList('');
  }
}

/** DSP选择变化时 */
function handleDspChange(value) {
  // 可以在这里处理DSP选择变化的逻辑
}

/** 搜索媒体广告位列表 */
function searchSiteAdPlacementList(query) {
  siteAdPlacementLoading.value = true;
  searchSiteAdPlacement(query || '', 50)
    .then((response) => {
      const data = response.data || response;
      siteAdPlacementOptions.value = Array.isArray(data) ? data : [];
    })
    .finally(() => {
      siteAdPlacementLoading.value = false;
    });
}

/** 媒体广告位下拉框获取焦点 */
function handleSiteAdPlacementFocus() {
  if (siteAdPlacementOptions.value.length === 0) {
    searchSiteAdPlacementList('');
  }
}

/** 查询DSP广告位映射列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  pageDspPlacementMappings(params).then((response) => {
    // 后端返回 Page<DspPlacementMappingDto>，需要适配前端格式
    if (response.records) {
      mappingList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      mappingList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      mappingList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      mappingList.value = Array.isArray(response) ? response : [];
      total.value = mappingList.value.length;
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
    dspId: undefined,
    siteAdPlacementId: undefined,
    dspSlotId: undefined,
  };
  proxy.resetForm('mappingRef');
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
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['mappingRef'].validate((valid) => {
    if (valid) {
      addDspPlacementMapping(form.value).then((response) => {
        proxy.$modal.msgSuccess('新增成功');
        open.value = false;
        getList();
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const mappingIds = row.id || ids.value;
  const mappingId = Array.isArray(mappingIds) ? mappingIds[0] : mappingIds;
  
  // 构建确认信息
  let confirmMsg = '是否确认删除该DSP广告位映射？';
  if (row.dspName && row.siteAdPlacementName) {
    confirmMsg = `是否确认删除DSP"${row.dspName}"与媒体广告位"${row.siteAdPlacementName}"的映射关系？`;
  }
  
  proxy.$modal
    .confirm(confirmMsg)
    .then(function () {
      return delDspPlacementMapping(mappingId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

// 初始化
getList();
</script>

