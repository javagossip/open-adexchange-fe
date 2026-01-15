<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="地域包名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入地域包名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择类型"
          clearable
          style="width: 240px"
        >
          <el-option label="地域分级专用" :value="1" />
          <el-option label="通用" :value="2" />
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

    <el-table v-loading="loading" :data="regionPkgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="地域包名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="类型" align="center" prop="type" width="140">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'warning' : 'success'">
            {{ scope.row.type === 1 ? '地域分级专用' : '通用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="已选地域数量"
        align="center"
        width="140"
      >
        <template #default="scope">
          <span>{{ (scope.row.districtCodes && scope.row.districtCodes.length) || '-' }}</span>
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

    <!-- 添加或修改地域包对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="regionPkgRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="地域包名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地域包名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">地域分级专用</el-radio>
            <el-radio :value="2">通用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地域" prop="districtCodes">
          <el-tree-select
            v-if="districtTreeVisible"
            v-model="form.districtCodes"
            :props="districtTreeProps"
            lazy
            :load="loadDistrictData"
            :cache-data="districtCacheData"
            multiple
            check-strictly
            node-key="code"
            placeholder="请选择地域"
            style="width: 100%"
          />
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

<script setup name="RegionPkg">
import { getCurrentInstance, reactive, ref, toRefs, onMounted, nextTick } from 'vue';
import { listRegionPkg, getRegionPkg, addRegionPkg, updateRegionPkg, delRegionPkg } from '@/api/regionPkg';
import { getDistricts, getDistrictsByCodes } from '@/api/system/dict';

const { proxy } = getCurrentInstance();

const regionPkgList = ref([]);
const districtTreeVisible = ref(false);
const districtCacheData = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

/** 树形选择器配置 */
const districtTreeProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  isLeaf: (data) => data.leaf === true,
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    type: undefined,
  },
  rules: {
    name: [{ required: true, message: '地域包名称不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
    districtCodes: [{ required: true, message: '请选择地域', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 加载地域数据（纯懒加载模式） */
function loadDistrictData(node, resolve) {
  // 根节点时 node.level === 0，此时 node.data 为空
  const parentId = node.level === 0 ? 0 : node.data.id;
  getDistricts(parentId)
    .then((response) => {
      const data = response.data || response;
      const districts = Array.isArray(data) ? data : [];
      const nodes = districts.map((district) => ({
        ...district,
        // 默认都不是叶子节点，让用户可以展开查看
        leaf: false,
      }));
      resolve(nodes);
    })
    .catch((error) => {
      console.error('加载地域数据失败:', error);
      resolve([]);
    });
}

/** 查询地域包列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listRegionPkg(params).then((response) => {
    if (response.records) {
      regionPkgList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      regionPkgList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      regionPkgList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      regionPkgList.value = Array.isArray(response) ? response : [];
      total.value = regionPkgList.value.length;
    }
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  districtTreeVisible.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
    type: 2,
    districtCodes: [],
  };
  proxy.resetForm('regionPkgRef');
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
  // 清空缓存数据
  districtCacheData.value = [];
  // 重置树组件，确保每次打开都是全新的组件实例
  districtTreeVisible.value = false;
  nextTick(() => {
    districtTreeVisible.value = true;
    open.value = true;
    title.value = '添加地域包';
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  try {
    const response = await getRegionPkg(id);
    const data = response.data || response;
    const districtCodes = data.districtCodes || [];

    form.value = {
      id: data.id,
      name: data.name,
      type: data.type,
      districtCodes: districtCodes,
    };

    // 加载已选中地区的完整信息，用于 cache-data 显示名称
    if (districtCodes.length > 0) {
      const cacheResponse = await getDistrictsByCodes(districtCodes);
      const cacheData = cacheResponse.data || cacheResponse;
      districtCacheData.value = Array.isArray(cacheData) ? cacheData : [];
    } else {
      districtCacheData.value = [];
    }

    // 重置树组件，确保每次打开都是全新的组件实例
    districtTreeVisible.value = false;
    nextTick(() => {
      districtTreeVisible.value = true;
      open.value = true;
      title.value = '修改地域包';
    });
  } catch (error) {
    console.error('加载地域包详情失败:', error);
    proxy.$modal.msgError('加载地域包详情失败');
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['regionPkgRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateRegionPkg(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          districtTreeVisible.value = false;
          getList();
        });
      } else {
        addRegionPkg(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          districtTreeVisible.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const regionPkgIds = row.id || ids.value;
  const regionPkgId = Array.isArray(regionPkgIds) ? regionPkgIds[0] : regionPkgIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + regionPkgId + '"的数据项？')
    .then(function () {
      return delRegionPkg(regionPkgId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

onMounted(() => {
  getList();
});
</script>


