<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="媒体名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入媒体名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="媒体类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="媒体类型"
          clearable
          style="width: 240px"
        >
          <el-option label="个人" :value="1" />
          <el-option label="公司" :value="2" />
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
          <el-option label="停用" :value="0" />
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

    <el-table v-loading="loading" :data="publisherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="媒体名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="媒体类型" align="center" prop="type" width="100">
        <template #default="scope">
          <span>{{ scope.row.type === 1 ? '个人' : '公司' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="联系人邮箱"
        align="center"
        prop="contactEmail"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="联系人电话"
        align="center"
        prop="contactPhone"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '使用中' : '停用' }}
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

    <!-- 添加或修改发布商对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="publisherRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="媒体名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入媒体名称" />
        </el-form-item>
        <el-form-item label="媒体类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">个人</el-radio>
            <el-radio :value="2">公司</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系人邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">使用中</el-radio>
            <el-radio :value="0">停用</el-radio>
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

<script setup name="Publisher">
import {
  listPublisher,
  getPublisher,
  delPublisher,
  addPublisher,
  updatePublisher,
  enablePublisher,
  disablePublisher,
} from '@/api/publisher/publisher';

const { proxy } = getCurrentInstance();

const publisherList = ref([]);
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
  },
  rules: {
    name: [{ required: true, message: '媒体名称不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '媒体类型不能为空', trigger: 'change' }],
    contactEmail: [
      { required: true, message: '联系人邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    ],
    contactPhone: [{ required: true, message: '联系人电话不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询发布商列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listPublisher(params).then((response) => {
    // 后端返回 Page<Publisher>，需要适配前端格式
    // 如果后端返回的是 { records: [], total: number } 格式
    if (response.records) {
      publisherList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      // 如果后端已经适配为 { rows: [], total: number } 格式
      publisherList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      // 如果返回在 data 字段中
      publisherList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      // 直接返回数组的情况
      publisherList.value = Array.isArray(response) ? response : [];
      total.value = publisherList.value.length;
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
    type: 1,
    contactEmail: undefined,
    contactPhone: undefined,
    status: 1,
  };
  proxy.resetForm('publisherRef');
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
  title.value = '添加发布商';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getPublisher(id).then((response) => {
    form.value = response.data || response;
    open.value = true;
    title.value = '修改发布商';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['publisherRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updatePublisher(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addPublisher(form.value).then((response) => {
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
  const publisherIds = row.id || ids.value;
  const publisherId = Array.isArray(publisherIds) ? publisherIds[0] : publisherIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + publisherId + '"的数据项？')
    .then(function () {
      return delPublisher(publisherId);
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
    .confirm('是否确认启用ID为"' + id + '"的发布商？')
    .then(function () {
      return enablePublisher(id);
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
    .confirm('是否确认禁用ID为"' + id + '"的发布商？')
    .then(function () {
      return disablePublisher(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

getList();
</script>

