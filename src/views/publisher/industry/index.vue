<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="行业编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入行业编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="行业名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入行业名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="风险等级" prop="riskLevel">
        <el-select
          v-model="queryParams.riskLevel"
          placeholder="风险等级"
          clearable
          style="width: 240px"
        >
          <el-option label="普通" :value="0" />
          <el-option label="敏感" :value="1" />
          <el-option label="高风险" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否需要资质" prop="needLicense">
        <el-select
          v-model="queryParams.needLicense"
          placeholder="是否需要资质"
          clearable
          style="width: 240px"
        >
          <el-option label="否" :value="0" />
          <el-option label="是" :value="1" />
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

    <el-table v-loading="loading" :data="industryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="行业编码"
        align="center"
        prop="code"
        width="150"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="行业名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="父行业ID" align="center" prop="parentId" width="120">
        <template #default="scope">
          <span>{{ scope.row.parentId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="层级" align="center" prop="level" width="80">
        <template #default="scope">
          <span>{{ scope.row.level || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="风险等级" align="center" prop="riskLevel" width="100">
        <template #default="scope">
          <el-tag :type="getRiskLevelTagType(scope.row.riskLevel)">
            {{ getRiskLevelLabel(scope.row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否需要资质" align="center" prop="needLicense" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.needLicense === 1 ? 'warning' : 'info'">
            {{ scope.row.needLicense === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="行业说明"
        align="center"
        prop="description"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ scope.row.description || '-' }}</span>
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
        width="200"
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

    <!-- 添加或修改行业对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="industryRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="行业编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入行业编码，如：FINANCE, GAME, EDUCATION" />
        </el-form-item>
        <el-form-item label="行业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="父行业ID" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="industryTreeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            value-key="id"
            placeholder="请选择父行业（可选）"
            check-strictly
            :lazy="true"
            :load="loadIndustryNode"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="行业层级" prop="level">
          <el-input-number
            v-model="form.level"
            :min="1"
            :max="10"
            placeholder="行业层级，从1开始"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="风险等级" prop="riskLevel">
          <el-radio-group v-model="form.riskLevel">
            <el-radio :value="0">普通</el-radio>
            <el-radio :value="1">敏感</el-radio>
            <el-radio :value="2">高风险</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否需要资质" prop="needLicense">
          <el-radio-group v-model="form.needLicense">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="行业说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入行业说明（可选）"
          />
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

<script setup name="Industry">
import {
  listIndustry,
  getIndustry,
  delIndustry,
  addIndustry,
  updateIndustry,
  listIndustriesByParentId,
} from '@/api/publisher/industry';

const { proxy } = getCurrentInstance();

const industryList = ref([]);
const industryTreeData = ref([]);
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
    code: undefined,
    name: undefined,
    riskLevel: undefined,
    needLicense: undefined,
    status: undefined,
  },
  rules: {
    code: [{ required: true, message: '行业编码不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '行业名称不能为空', trigger: 'blur' }],
    riskLevel: [{ required: true, message: '风险等级不能为空', trigger: 'change' }],
    needLicense: [{ required: true, message: '是否需要资质不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 加载行业树根节点 */
async function loadIndustryTree() {
  try {
    const response = await listIndustriesByParentId(null);
    const industries = response.data || response || [];
    industryTreeData.value = industries.map(ind => ({
      ...ind,
      leaf: false, // 标记为非叶子节点，表示可能有子节点
    }));
  } catch (error) {
    console.error('加载行业树失败:', error);
  }
}

/** 懒加载行业树节点 */
async function loadIndustryNode(node, resolve) {
  try {
    const parentId = node.data ? node.data.id : null;
    const response = await listIndustriesByParentId(parentId);
    const industries = response.data || response || [];
    const children = industries.map(ind => ({
      ...ind,
      leaf: false, // 标记为非叶子节点，表示可能有子节点
    }));
    resolve(children);
  } catch (error) {
    console.error('加载行业子节点失败:', error);
    resolve([]);
  }
}

/** 获取风险等级标签 */
function getRiskLevelLabel(riskLevel) {
  const map = {
    0: '普通',
    1: '敏感',
    2: '高风险',
  };
  return map[riskLevel] || '-';
}

/** 获取风险等级标签颜色 */
function getRiskLevelTagType(riskLevel) {
  const map = {
    0: '',
    1: 'warning',
    2: 'danger',
  };
  return map[riskLevel] || '';
}

/** 查询行业列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listIndustry(params).then((response) => {
    if (response.records) {
      industryList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      industryList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      industryList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      industryList.value = Array.isArray(response) ? response : [];
      total.value = industryList.value.length;
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
    code: undefined,
    name: undefined,
    parentId: undefined,
    level: undefined,
    riskLevel: 0,
    needLicense: 0,
    description: undefined,
    status: 1,
  };
  proxy.resetForm('industryRef');
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
  // 重新加载行业树根节点
  loadIndustryTree();
  open.value = true;
  title.value = '添加行业';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  // 重新加载行业树根节点
  loadIndustryTree();
  getIndustry(id).then((response) => {
    const data = response.data || response;
    form.value = {
      ...data,
    };
    open.value = true;
    title.value = '修改行业';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['industryRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateIndustry(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addIndustry(form.value).then((response) => {
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
  const industryIds = row.id || ids.value;
  const industryId = Array.isArray(industryIds) ? industryIds[0] : industryIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + industryId + '"的数据项？')
    .then(function () {
      return delIndustry(industryId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

// 初始化加载行业树根节点
loadIndustryTree();
getList();
</script>

