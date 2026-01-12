<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="站点" prop="siteId">
        <el-select
          v-model="queryParams.siteId"
          placeholder="请选择站点"
          clearable
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.id"
            :label="site.name"
            :value="site.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="广告位" prop="adPlacementId">
        <el-select
          v-model="queryParams.adPlacementId"
          placeholder="请选择广告位"
          clearable
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="adPlacement in adPlacementOptions"
            :key="adPlacement.id"
            :label="adPlacement.name"
            :value="adPlacement.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px"
        >
          <el-option label="使用中" :value="1" />
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

    <el-table v-loading="loading" :data="siteAdPlacementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="媒体广告位名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="站点"
        align="center"
        prop="siteId"
        width="150"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ getSiteName(scope.row.siteId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="广告位"
        align="center"
        prop="adPlacementId"
        width="150"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ getAdPlacementName(scope.row.adPlacementId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="广告位编码"
        align="center"
        prop="adPlacementCode"
        width="150"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ getAdPlacementCode(scope.row.adPlacementId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="截图URL"
        align="center"
        prop="demoUrl"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <el-link v-if="scope.row.demoUrl" :href="scope.row.demoUrl" target="_blank" type="primary">
            查看截图
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '使用中' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
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

    <!-- 添加或修改媒体广告位对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="siteAdPlacementRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="站点" prop="siteId">
          <el-select
            v-model="form.siteId"
            placeholder="请选择站点"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="site in siteOptions"
              :key="site.id"
              :label="site.name"
              :value="site.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="广告位" prop="adPlacementId">
          <el-select
            v-model="form.adPlacementId"
            placeholder="请选择广告位"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="adPlacement in adPlacementOptions"
              :key="adPlacement.id"
              :label="adPlacement.name"
              :value="adPlacement.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.id" label="广告位编码" prop="adPlacementCode">
          <el-input
            v-model="adPlacementCodeDisplay"
            placeholder="广告位编码"
            disabled
          />
        </el-form-item>
        <el-form-item label="媒体广告位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入媒体广告位名称" />
        </el-form-item>
        <el-form-item label="广告位截图URL" prop="demoUrl">
          <el-input
            v-model="form.demoUrl"
            placeholder="请输入广告位截图URL"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">使用中</el-radio>
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

<script setup name="SiteAdPlacement">
import {
  listSiteAdPlacement,
  getSiteAdPlacement,
  delSiteAdPlacement,
  addSiteAdPlacement,
  updateSiteAdPlacement,
  enableSiteAdPlacement,
  disableSiteAdPlacement,
} from '@/api/publisher/siteadplacement';
import { listSite } from '@/api/publisher/site';
import { listAdPlacement } from '@/api/publisher/adplacement';

const { proxy } = getCurrentInstance();

const siteAdPlacementList = ref([]);
const siteOptions = ref([]);
const adPlacementOptions = ref([]);
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
    siteId: undefined,
    adPlacementId: undefined,
    status: undefined,
  },
  rules: {
    siteId: [{ required: true, message: '站点不能为空', trigger: 'change' }],
    adPlacementId: [{ required: true, message: '广告位不能为空', trigger: 'change' }],
    name: [{ required: true, message: '媒体广告位名称不能为空', trigger: 'blur' }],
    demoUrl: [{ type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 计算属性：广告位编码显示 */
const adPlacementCodeDisplay = computed(() => {
  if (form.value.adPlacementId) {
    const adPlacement = adPlacementOptions.value.find((ap) => ap.id === form.value.adPlacementId);
    return adPlacement ? adPlacement.code : '';
  }
  return '';
});

/** 查询站点列表 */
function getSiteList() {
  listSite({ pageNo: 1, pageSize: 1000 }).then((response) => {
    if (response.records) {
      siteOptions.value = response.records;
    } else if (response.rows) {
      siteOptions.value = response.rows;
    } else if (response.data) {
      siteOptions.value = response.data.records || response.data.rows || [];
    } else {
      siteOptions.value = Array.isArray(response) ? response : [];
    }
  });
}

/** 查询广告位列表 */
function getAdPlacementList() {
  listAdPlacement({ pageNo: 1, pageSize: 1000 }).then((response) => {
    if (response.records) {
      adPlacementOptions.value = response.records;
    } else if (response.rows) {
      adPlacementOptions.value = response.rows;
    } else if (response.data) {
      adPlacementOptions.value = response.data.records || response.data.rows || [];
    } else {
      adPlacementOptions.value = Array.isArray(response) ? response : [];
    }
  });
}

/** 获取站点名称 */
function getSiteName(siteId) {
  const site = siteOptions.value.find((s) => s.id === siteId);
  return site ? site.name : '-';
}

/** 获取广告位名称 */
function getAdPlacementName(adPlacementId) {
  const adPlacement = adPlacementOptions.value.find((ap) => ap.id === adPlacementId);
  return adPlacement ? adPlacement.name : '-';
}

/** 获取广告位编码 */
function getAdPlacementCode(adPlacementId) {
  const adPlacement = adPlacementOptions.value.find((ap) => ap.id === adPlacementId);
  return adPlacement ? adPlacement.code : '-';
}

/** 查询媒体广告位列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listSiteAdPlacement(params).then((response) => {
    // 后端返回 Page<SiteAdPlacement>，需要适配前端格式
    if (response.records) {
      siteAdPlacementList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      siteAdPlacementList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      siteAdPlacementList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      siteAdPlacementList.value = Array.isArray(response) ? response : [];
      total.value = siteAdPlacementList.value.length;
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
    siteId: undefined,
    adPlacementId: undefined,
    name: undefined,
    demoUrl: undefined,
    status: 1,
  };
  proxy.resetForm('siteAdPlacementRef');
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
  title.value = '添加媒体广告位';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getSiteAdPlacement(id).then((response) => {
    form.value = response.data || response;
    open.value = true;
    title.value = '修改媒体广告位';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['siteAdPlacementRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateSiteAdPlacement(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addSiteAdPlacement(form.value).then((response) => {
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
  const siteAdPlacementIds = row.id || ids.value;
  const siteAdPlacementId = Array.isArray(siteAdPlacementIds)
    ? siteAdPlacementIds[0]
    : siteAdPlacementIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + siteAdPlacementId + '"的数据项？')
    .then(function () {
      return delSiteAdPlacement(siteAdPlacementId);
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
    .confirm('是否确认启用ID为"' + id + '"的媒体广告位？')
    .then(function () {
      return enableSiteAdPlacement(id);
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
    .confirm('是否确认禁用ID为"' + id + '"的媒体广告位？')
    .then(function () {
      return disableSiteAdPlacement(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

// 初始化
getSiteList();
getAdPlacementList();
getList();
</script>

