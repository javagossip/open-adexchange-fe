<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="分类体系" prop="system">
        <el-select
          v-model="queryParams.system"
          placeholder="分类体系"
          clearable
          style="width: 240px"
        >
          <el-option label="IAB_V1" value="IAB_V1" />
          <el-option label="IAB_V2" value="IAB_V2" />
          <el-option label="INTERNAL" value="INTERNAL" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入分类编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
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

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="分类体系" align="center" prop="system" width="120">
        <template #default="scope">
          <el-tag>{{ scope.row.system || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="分类编码"
        align="center"
        prop="code"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="分类名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="父级编码"
        align="center"
        prop="parentCode"
        width="120"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span>{{ scope.row.parentCode || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="层级" align="center" prop="level" width="80">
        <template #default="scope">
          <span>{{ scope.row.level || '-' }}</span>
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
        label="分类说明"
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

    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="分类体系" prop="system">
          <el-select v-model="form.system" placeholder="请选择分类体系" style="width: 100%" @change="handleSystemChange">
            <el-option label="IAB_V1" value="IAB_V1" />
            <el-option label="IAB_V2" value="IAB_V2" />
            <el-option label="INTERNAL" value="INTERNAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类编码，如：IAB1, IAB1-2" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类编码" prop="parentCode">
          <el-tree-select
            v-model="form.parentCode"
            :data="categoryTreeData"
            :props="{ label: 'name', value: 'code', children: 'children' }"
            value-key="code"
            placeholder="请先选择分类体系"
            check-strictly
            :lazy="true"
            :load="loadCategoryNode"
            :disabled="!form.system"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类层级" prop="level">
          <el-input-number
            v-model="form.level"
            :min="1"
            :max="10"
            placeholder="分类层级"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类说明（可选）"
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

<script setup name="Category">
import {
  listCategory,
  getCategory,
  delCategory,
  addCategory,
  updateCategory,
  listCategoriesByParentCode,
} from '@/api/category';

const { proxy } = getCurrentInstance();

const categoryList = ref([]);
const categoryTreeData = ref([]);
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
    system: undefined,
    code: undefined,
    name: undefined,
    status: undefined,
  },
  rules: {
    system: [{ required: true, message: '分类体系不能为空', trigger: 'change' }],
    code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 加载分类树根节点 */
async function loadCategoryTree() {
  if (!form.value.system) {
    categoryTreeData.value = [];
    return;
  }
  try {
    const response = await listCategoriesByParentCode(null, form.value.system);
    const categories = response.data || response || [];
    categoryTreeData.value = categories.map(cat => ({
      ...cat,
      leaf: false, // 标记为非叶子节点，表示可能有子节点
    }));
  } catch (error) {
    console.error('加载分类树失败:', error);
  }
}

/** 懒加载分类树节点 */
async function loadCategoryNode(node, resolve) {
  if (!form.value.system) {
    resolve([]);
    return;
  }
  try {
    const parentCode = node.data ? node.data.code : null;
    const response = await listCategoriesByParentCode(parentCode, form.value.system);
    const categories = response.data || response || [];
    const children = categories.map(cat => ({
      ...cat,
      leaf: false, // 标记为非叶子节点，表示可能有子节点
    }));
    resolve(children);
  } catch (error) {
    console.error('加载分类子节点失败:', error);
    resolve([]);
  }
}

/** 分类体系变更处理 */
function handleSystemChange() {
  form.value.parentCode = undefined;
  loadCategoryTree();
}

/** 查询分类列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listCategory(params).then((response) => {
    if (response.records) {
      categoryList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      categoryList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      categoryList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      categoryList.value = Array.isArray(response) ? response : [];
      total.value = categoryList.value.length;
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
    system: undefined,
    code: undefined,
    name: undefined,
    parentCode: undefined,
    level: undefined,
    description: undefined,
    status: 1,
  };
  proxy.resetForm('categoryRef');
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
  categoryTreeData.value = [];
  open.value = true;
  title.value = '添加分类';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getCategory(id).then((response) => {
    const data = response.data || response;
    form.value = {
      ...data,
    };
    // 加载当前分类体系下的树根节点
    loadCategoryTree();
    open.value = true;
    title.value = '修改分类';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['categoryRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then((response) => {
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
  const categoryIds = row.id || ids.value;
  const categoryId = Array.isArray(categoryIds) ? categoryIds[0] : categoryIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + categoryId + '"的数据项？')
    .then(function () {
      return delCategory(categoryId);
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

