<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="媒体广告位" prop="siteAdPlacementId">
        <el-select
          v-model="queryParams.siteAdPlacementId"
          placeholder="请选择媒体广告位"
          clearable
          filterable
          remote
          :remote-method="searchSiteAdPlacements"
          :loading="siteAdPlacementLoading"
          style="width: 240px"
        >
          <el-option
            v-for="item in siteAdPlacementOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="行业" prop="industryId">
        <el-cascader
          v-model="queryParams.industryIds"
          :options="industryOptions"
          :props="{ checkStrictly: true, value: 'id', label: 'name', children: 'children', emitPath: false }"
          placeholder="请选择行业"
          clearable
          filterable
          style="width: 240px"
          @change="handleIndustryChange"
        />
      </el-form-item>
      <el-form-item label="地域等级" prop="regionLevelId">
        <el-select
          v-model="queryParams.regionLevelId"
          placeholder="请选择地域等级"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in regionLevelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
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

    <el-table v-loading="loading" :data="floorPriceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="媒体广告位"
        align="center"
        prop="siteAdPlacementName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="行业"
        align="center"
        prop="industryName"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.industryName" type="info">{{ scope.row.industryName }}</el-tag>
          <span v-else>通用</span>
        </template>
      </el-table-column>
      <el-table-column
        label="地域等级"
        align="center"
        prop="regionLevelName"
        width="120"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.regionLevelName" type="warning">{{ scope.row.regionLevelName }}</el-tag>
          <span v-else>通用</span>
        </template>
      </el-table-column>
      <el-table-column
        label="底价(CNY)"
        align="center"
        prop="floorPrice"
        width="120"
      >
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">{{ scope.row.floorPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
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

    <!-- 添加或修改底价对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="floorPriceRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="媒体广告位" prop="siteAdPlacementId">
          <el-select
            v-model="form.siteAdPlacementId"
            placeholder="请选择媒体广告位"
            filterable
            remote
            :remote-method="searchSiteAdPlacements"
            :loading="siteAdPlacementLoading"
            style="width: 100%"
            @change="handleSiteAdPlacementChange"
          >
            <el-option
              v-for="item in siteAdPlacementOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行业" prop="industryId">
          <el-cascader
            v-model="form.industryIds"
            :options="industryOptions"
            :props="{ checkStrictly: true, value: 'id', label: 'name', children: 'children', emitPath: false }"
            placeholder="请选择行业（不选则为通用底价）"
            clearable
            filterable
            style="width: 100%"
            @change="handleFormIndustryChange"
          />
        </el-form-item>
        <el-form-item label="地域等级" prop="regionLevelId">
          <el-select
            v-model="form.regionLevelId"
            placeholder="请选择地域等级（不选则为通用底价）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in regionLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="底价(CNY)" prop="floorPrice">
          <el-input-number
            v-model="form.floorPrice"
            :min="0"
            :precision="2"
            :step="0.01"
            placeholder="请输入底价"
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

<script setup name="FloorPrice">
import {
  listFloorPrice,
  getFloorPrice,
  delFloorPrice,
  addFloorPrice,
  updateFloorPrice,
} from '@/api/publisher/floorprice';
import { searchSiteAdPlacement } from '@/api/publisher/siteadplacement';
import { listIndustry } from '@/api/publisher/industry';
import { getRegionLevels } from '@/api/system/dict';

const { proxy } = getCurrentInstance();

const floorPriceList = ref([]);
const siteAdPlacementOptions = ref([]);
const industryOptions = ref([]);
const regionLevelOptions = ref([]);
const siteAdPlacementLoading = ref(false);
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
    siteAdPlacementId: undefined,
    industryId: undefined,
    industryIds: undefined,
    regionLevelId: undefined,
  },
  rules: {
    siteAdPlacementId: [{ required: true, message: '媒体广告位不能为空', trigger: 'change' }],
    floorPrice: [{ required: true, message: '底价不能为空', trigger: 'blur' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 远程搜索媒体广告位 */
async function searchSiteAdPlacements(searchKey) {
  if (!searchKey && siteAdPlacementOptions.value.length > 0) {
    return;
  }
  siteAdPlacementLoading.value = true;
  try {
    const response = await searchSiteAdPlacement(searchKey || '', 50);
    if (response.data) {
      siteAdPlacementOptions.value = Array.isArray(response.data) ? response.data : [];
    } else {
      siteAdPlacementOptions.value = Array.isArray(response) ? response : [];
    }
  } catch (e) {
    siteAdPlacementOptions.value = [];
  } finally {
    siteAdPlacementLoading.value = false;
  }
}

/** 查询行业列表（树形结构） */
async function getIndustryTree() {
  try {
    const response = await listIndustry({ pageNo: 1, pageSize: 1000 });
    let industries = [];
    if (response.records) {
      industries = response.records;
    } else if (response.rows) {
      industries = response.rows;
    } else if (response.data) {
      industries = response.data.records || response.data.rows || [];
    } else {
      industries = Array.isArray(response) ? response : [];
    }
    // 构建树形结构
    industryOptions.value = buildIndustryTree(industries);
  } catch (e) {
    industryOptions.value = [];
  }
}

/** 构建行业树形结构 */
function buildIndustryTree(industries) {
  const map = {};
  const tree = [];
  
  // 先创建映射
  industries.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  
  // 构建树
  industries.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      tree.push(map[item.id]);
    }
  });
  
  // 移除空的 children 数组
  function removeEmptyChildren(nodes) {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        removeEmptyChildren(node.children);
      }
    });
  }
  removeEmptyChildren(tree);
  
  return tree;
}

/** 查询地域等级列表 */
async function getRegionLevelList() {
  try {
    const response = await getRegionLevels();
    let options = [];
    if (response.data && Array.isArray(response.data)) {
      options = response.data;
    } else if (Array.isArray(response)) {
      options = response;
    }
    // OptionDto 结构: { value: xxx, label: xxx }
    regionLevelOptions.value = options.map(item => ({
      value: item.value !== undefined ? Number(item.value) : item.id,
      label: item.label || item.name,
    }));
  } catch (e) {
    regionLevelOptions.value = [];
  }
}

/** 处理查询表单行业变化 */
function handleIndustryChange(value) {
  queryParams.value.industryId = value;
}

/** 处理表单行业变化 */
function handleFormIndustryChange(value) {
  form.value.industryId = value;
}

/** 处理媒体广告位变化 */
function handleSiteAdPlacementChange(value) {
  const selected = siteAdPlacementOptions.value.find(item => item.id === value);
  if (selected) {
    form.value.siteAdPlacementName = selected.name;
  }
}

/** 查询底价列表 */
function getList() {
  loading.value = true;
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  delete params.industryIds;
  
  listFloorPrice(params).then((response) => {
    if (response.records) {
      floorPriceList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      floorPriceList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      floorPriceList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      floorPriceList.value = Array.isArray(response) ? response : [];
      total.value = floorPriceList.value.length;
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
    siteAdPlacementId: undefined,
    siteAdPlacementName: undefined,
    industryId: undefined,
    industryIds: undefined,
    regionLevelId: undefined,
    floorPrice: undefined,
  };
  proxy.resetForm('floorPriceRef');
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  queryParams.value.industryIds = undefined;
  queryParams.value.industryId = undefined;
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
  title.value = '添加底价配置';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getFloorPrice(id).then((response) => {
    const data = response.data || response;
    form.value = {
      ...data,
      industryIds: data.industryId,
    };
    // 确保当前选中的媒体广告位在下拉列表中
    if (data.siteAdPlacementId && data.siteAdPlacementName) {
      const exists = siteAdPlacementOptions.value.some(item => item.id === data.siteAdPlacementId);
      if (!exists) {
        siteAdPlacementOptions.value.push({
          id: data.siteAdPlacementId,
          name: data.siteAdPlacementName,
        });
      }
    }
    open.value = true;
    title.value = '修改底价配置';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['floorPriceRef'].validate((valid) => {
    if (valid) {
      const submitData = { ...form.value };
      delete submitData.industryIds;
      
      if (submitData.id != undefined) {
        updateFloorPrice(submitData).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addFloorPrice(submitData).then((response) => {
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
  const floorPriceIds = row.id || ids.value;
  const floorPriceId = Array.isArray(floorPriceIds) ? floorPriceIds[0] : floorPriceIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + floorPriceId + '"的底价配置？')
    .then(function () {
      return delFloorPrice(floorPriceId);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

// 初始化
searchSiteAdPlacements('');
getIndustryTree();
getRegionLevelList();
getList();
</script>

