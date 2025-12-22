<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="站点名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入站点名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="站点类型"
          clearable
          style="width: 240px"
        >
          <el-option label="网站" :value="1" />
          <el-option label="App" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="平台" prop="platform">
        <el-select
          v-model="queryParams.platform"
          placeholder="平台"
          clearable
          style="width: 240px"
        >
          <el-option label="iOS" value="IOS" />
          <el-option label="Android" value="ANDROID" />
          <el-option label="Web" value="WEB" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布商" prop="publisherId">
        <el-select
          v-model="queryParams.publisherId"
          placeholder="请选择发布商"
          clearable
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="publisher in publisherOptions"
            :key="publisher.id"
            :label="publisher.name"
            :value="publisher.id"
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
          <el-option label="启用" :value="1" />
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

    <el-table v-loading="loading" :data="siteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="站点名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="站点类型" align="center" prop="siteType" width="100">
        <template #default="scope">
          <span>{{ scope.row.siteType === 1 ? '网站' : 'App' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台" align="center" prop="platform" width="100">
        <template #default="scope">
          <span>{{ getPlatformLabel(scope.row.platform) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="发布商"
        align="center"
        prop="publisherId"
        width="120"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ getPublisherName(scope.row.publisherId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="域名/App ID"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ scope.row.siteType === 1 ? scope.row.domain : scope.row.appId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="App Bundle"
        align="center"
        prop="appBundle"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span v-if="scope.row.siteType === 2">{{ scope.row.appBundle }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
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

    <!-- 添加或修改站点对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="siteRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="发布商" prop="publisherId">
          <el-select
            v-model="form.publisherId"
            placeholder="请选择发布商"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="publisher in publisherOptions"
              :key="publisher.id"
              :label="publisher.name"
              :value="publisher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="站点类型" prop="siteType">
          <el-radio-group v-model="form.siteType" @change="handleSiteTypeChange">
            <el-radio :value="1">网站</el-radio>
            <el-radio :value="2">App</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-radio-group v-model="form.platform">
            <el-radio value="ios" :disabled="form.siteType === 1">iOS</el-radio>
            <el-radio value="android" :disabled="form.siteType === 1">Android</el-radio>
            <el-radio value="web">Web</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.siteType === 1"
          label="域名"
          prop="domain"
          :rules="form.siteType === 1 ? rules.domain : []"
        >
          <el-input v-model="form.domain" placeholder="请输入域名，如：example.com" />
        </el-form-item>
        <el-form-item
          v-if="form.siteType === 2"
          label="App ID"
          prop="appId"
          :rules="form.siteType === 2 ? rules.appId : []"
        >
          <el-input v-model="form.appId" placeholder="请输入 App ID" />
        </el-form-item>
        <el-form-item
          v-if="form.siteType === 2"
          label="App Bundle"
          prop="appBundle"
          :rules="form.siteType === 2 ? rules.appBundle : []"
        >
          <el-input v-model="form.appBundle" placeholder="请输入 App Bundle" />
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

<script setup name="Site">
import {
  listSite,
  getSite,
  delSite,
  addSite,
  updateSite,
  enableSite,
  disableSite,
} from '@/api/publisher/site';
import { listPublisher } from '@/api/publisher/publisher';

const { proxy } = getCurrentInstance();

const siteList = ref([]);
const publisherOptions = ref([]);
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
    name: undefined,
    type: undefined,
    status: undefined,
    publisherId: undefined,
    platform: undefined,
  },
  rules: {
    publisherId: [{ required: true, message: '发布商不能为空', trigger: 'change' }],
    name: [{ required: true, message: '站点名称不能为空', trigger: 'blur' }],
    siteType: [{ required: true, message: '站点类型不能为空', trigger: 'change' }],
    platform: [{ required: true, message: '平台不能为空', trigger: 'change' }],
    domain: [{ required: true, message: '域名不能为空', trigger: 'blur' }],
    appId: [{ required: true, message: 'App ID不能为空', trigger: 'blur' }],
    appBundle: [{ required: true, message: 'App Bundle不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询发布商列表 */
function getPublisherList() {
  listPublisher({ pageNo: 1, pageSize: 1000 }).then((response) => {
    if (response.records) {
      publisherOptions.value = response.records;
    } else if (response.rows) {
      publisherOptions.value = response.rows;
    } else if (response.data) {
      publisherOptions.value = response.data.records || response.data.rows || [];
    } else {
      publisherOptions.value = Array.isArray(response) ? response : [];
    }
  });
}

/** 获取发布商名称 */
function getPublisherName(publisherId) {
  const publisher = publisherOptions.value.find((p) => p.id === publisherId);
  return publisher ? publisher.name : '-';
}

/** 获取平台展示文本 */
function getPlatformLabel(platform) {
  if (!platform) return '-';
  const map = {
    ios: 'iOS',
    android: 'Android',
    web: 'Web',
  };
  return map[platform] || platform;
}

/** 查询站点列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listSite(params).then((response) => {
    // 后端返回 Page<Site>，需要适配前端格式
    if (response.records) {
      siteList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      siteList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      siteList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      siteList.value = Array.isArray(response) ? response : [];
      total.value = siteList.value.length;
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
    publisherId: undefined,
    name: undefined,
    siteType: 1,
    platform: 'web',
    domain: undefined,
    appId: undefined,
    appBundle: undefined,
    status: 1,
  };
  proxy.resetForm('siteRef');
}

/** 站点类型变化 */
function handleSiteTypeChange() {
  // 切换类型时清空相关字段
  if (form.value.siteType === 1) {
    // 网站默认使用 web 平台
    form.value.platform = 'web';
    form.value.appId = undefined;
    form.value.appBundle = undefined;
  } else {
    form.value.domain = undefined;
    // 切换为 App 时如果之前是 web 平台，清空平台字段，让用户重新选择
    if (form.value.platform === 'web') {
      form.value.platform = undefined;
    }
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
  title.value = '添加站点';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getSite(id).then((response) => {
    form.value = response.data || response;
    // 兼容老数据：如果没有平台字段，根据站点类型设置默认平台
    if (!form.value.platform) {
      if (form.value.siteType === 1) {
        form.value.platform = 'web';
      }
    }
    open.value = true;
    title.value = '修改站点';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['siteRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateSite(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addSite(form.value).then((response) => {
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
  const siteIds = row.id || ids.value;
  const siteId = Array.isArray(siteIds) ? siteIds[0] : siteIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + siteId + '"的数据项？')
    .then(function () {
      return delSite(siteId);
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
    .confirm('是否确认启用ID为"' + id + '"的站点？')
    .then(function () {
      return enableSite(id);
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
    .confirm('是否确认禁用ID为"' + id + '"的站点？')
    .then(function () {
      return disableSite(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

// 初始化
getPublisherList();
getList();
</script>

