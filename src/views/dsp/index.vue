<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="DSP名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入DSP名称"
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

    <el-table v-loading="loading" :data="dspList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="Logo" align="center" prop="brandLogo" width="90">
        <template #default="scope">
          <el-image
            v-if="scope.row.brandLogo"
            :src="getLogoUrl(scope.row.brandLogo)"
            style="width: 40px; height: 40px"
            fit="contain"
            :preview-src-list="[getLogoUrl(scope.row.brandLogo)]"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="DSP名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="Bid端点"
        align="center"
        prop="bidEndpoint"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="Win通知端点"
        align="center"
        prop="winNoticeEndpoint"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="联系人"
        align="center"
        width="150"
      >
        <template #default="scope">
          <div>{{ scope.row.contactName || '-' }}</div>
          <div style="font-size: 12px; color: #909399;">
            {{ scope.row.contactPhone || scope.row.contactEmail || '' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="QPS限制"
        align="center"
        prop="qpsLimit"
        width="100"
      >
        <template #default="scope">
          <span>{{ scope.row.qpsLimit || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="超时时间"
        align="center"
        prop="timeoutMs"
        width="120"
      >
        <template #default="scope">
          <span v-if="scope.row.timeoutMs">{{ scope.row.timeoutMs }}ms</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
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
        width="320"
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
            type="info"
            icon="Setting"
            @click="handleSetting(scope.row)"
            >设置</el-button
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

    <!-- DSP设置对话框 -->
    <el-dialog title="DSP设置" v-model="settingOpen" width="800px" append-to-body>
      <el-form ref="settingRef" :model="settingForm" :rules="settingRules" label-width="140px">
        <el-divider content-position="left">广告位关联</el-divider>
        <el-form-item label="媒体广告位" prop="siteAdPlacementIds">
          <el-select
            v-model="settingForm.siteAdPlacementIds"
            placeholder="请选择媒体广告位"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in siteAdPlacementOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">性能配置</el-divider>
        <el-form-item label="QPS限制" prop="qpsLimit">
          <el-input-number
            v-model="settingForm.qpsLimit"
            :min="0"
            placeholder="QPS限制"
            style="width: 100%"
          />
        </el-form-item>
        <el-divider content-position="left">定向配置</el-divider>
        <el-form-item label="操作系统" prop="osList">
          <el-checkbox-group v-model="settingForm.targeting.osList">
            <el-checkbox label="ios">iOS</el-checkbox>
            <el-checkbox label="android">Android</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceTypes">
          <el-checkbox-group v-model="settingForm.targeting.deviceTypes">
            <el-checkbox label="phone">手机</el-checkbox>
            <el-checkbox label="pad">平板</el-checkbox>
            <el-checkbox label="pc">PC</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="国家/地区" prop="country">
          <el-select
            v-model="settingForm.targeting.country"
            placeholder="请选择或搜索国家/地区"
            filterable
            remote
            :remote-method="searchCountries"
            clearable
            :loading="countryLoading"
            @focus="handleCountryFocus"
            @visible-change="handleCountryVisibleChange"
            style="width: 100%"
          >
            <el-option
              v-for="country in countryOptions"
              :key="country.value"
              :label="country.label"
              :value="country.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地域" prop="regions">
          <el-tree-select
            v-model="settingForm.targeting.regions"
            :data="districtTreeData"
            :props="{ value: 'code', label: 'name', children: 'children' }"
            multiple
            check-strictly
            :lazy="true"
            :load="loadDistrictData"
            placeholder="请选择地域"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSettingForm">确 定</el-button>
          <el-button @click="cancelSetting">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改DSP对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="dspRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="DSP名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入DSP名称" />
        </el-form-item>
        <el-form-item label="品牌Logo" prop="brandLogo">
          <div style="display: flex; align-items: center; gap: 12px">
            <el-upload
              class="dsp-logo-uploader"
              action="#"
              :show-file-list="false"
              :http-request="handleLogoUpload"
              :before-upload="beforeLogoUpload"
              accept="image/*"
            >
              <img
                v-if="form.brandLogo"
                :src="getLogoUrl(form.brandLogo)"
                style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #dcdfe6; border-radius: 4px; padding: 6px"
              />
              <el-icon v-else style="width: 80px; height: 80px; border: 1px dashed #dcdfe6; border-radius: 4px">
                <Plus />
              </el-icon>
            </el-upload>
            <div style="display: flex; flex-direction: column; gap: 8px">
              <div style="color: #909399; font-size: 12px">建议上传PNG/JPG，大小不超过2MB</div>
              <el-button v-if="form.brandLogo" type="danger" link @click="form.brandLogo = undefined">移除</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Bid端点" prop="bidEndpoint">
          <el-input v-model="form.bidEndpoint" placeholder="请输入Bid端点URL，如：https://example.com/bid" />
        </el-form-item>
        <el-form-item label="Win通知端点" prop="winNoticeEndpoint">
          <el-input v-model="form.winNoticeEndpoint" placeholder="请输入Win通知端点URL，如：https://example.com/win" />
        </el-form-item>
        <el-form-item label="DSP Token" prop="token">
          <el-input v-model="form.token" type="textarea" :rows="2" placeholder="请输入DSP Token" />
        </el-form-item>
        <el-divider content-position="left">联系人信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系人邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" />
        </el-form-item>
        <el-divider content-position="left">账户信息</el-divider>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-divider content-position="left">性能配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="QPS限制" prop="qpsLimit">
              <el-input-number
                v-model="form.qpsLimit"
                :min="0"
                placeholder="QPS限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="超时时间(ms)" prop="timeoutMs">
              <el-input-number
                v-model="form.timeoutMs"
                :min="0"
                placeholder="超时时间(毫秒)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Dsp">
import { Plus } from '@element-plus/icons-vue';
import {
  listDsp,
  getDsp,
  delDsp,
  addDsp,
  updateDsp,
  enableDsp,
  disableDsp,
  dspSetting,
  getDspSetting,
} from '@/api/dsp/dsp';
import { uploadFile } from '@/api/file';
import { listSiteAdPlacement } from '@/api/publisher/siteadplacement';
import { getCountries, getDistricts } from '@/api/system/dict';

const { proxy } = getCurrentInstance();
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const dspList = ref([]);
const siteAdPlacementOptions = ref([]);
const countryOptions = ref([]);
const countryLoading = ref(false);
const districtTreeData = ref([]);
const open = ref(false);
const settingOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const currentDspId = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined,
  },
  rules: {
    name: [{ required: true, message: 'DSP名称不能为空', trigger: 'blur' }],
    bidEndpoint: [
      { required: true, message: 'Bid端点不能为空', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
    ],
    winNoticeEndpoint: [
      { required: true, message: 'Win通知端点不能为空', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
    ],
    token: [{ required: true, message: 'DSP Token不能为空', trigger: 'blur' }],
    contactEmail: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    ],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

const settingData = reactive({
  form: {
    siteAdPlacementIds: [],
    qpsLimit: undefined,
    targeting: {
      osList: [],
      deviceTypes: [],
      regions: [],
      country: '',
    },
  },
  rules: {},
});

const { form: settingForm, rules: settingRules } = toRefs(settingData);

function getLogoUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith(baseUrl)) return url;
  return baseUrl + (url.startsWith('/') ? url : '/' + url);
}

function beforeLogoUpload(file) {
  const isImage = file.type && file.type.startsWith('image/');
  if (!isImage) {
    proxy.$modal.msgError('请上传图片格式文件');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    proxy.$modal.msgError('图片大小不能超过 2MB');
    return false;
  }
  return true;
}

async function handleLogoUpload(options) {
  try {
    proxy.$modal.loading('正在上传Logo，请稍候...');
    const res = await uploadFile(options.file);
    // 后端返回 ApiResponse<String>，图片地址在 data 字段
    form.value.brandLogo = res.data;
    proxy.$modal.msgSuccess('上传成功');
  } catch (e) {
    proxy.$modal.msgError('上传失败');
  } finally {
    proxy.$modal.closeLoading();
  }
}

/** 查询媒体广告位列表 */
function getSiteAdPlacementList() {
  listSiteAdPlacement({ pageNo: 1, pageSize: 1000 }).then((response) => {
    if (response.records) {
      siteAdPlacementOptions.value = response.records;
    } else if (response.rows) {
      siteAdPlacementOptions.value = response.rows;
    } else if (response.data) {
      siteAdPlacementOptions.value = response.data.records || response.data.rows || [];
    } else {
      siteAdPlacementOptions.value = Array.isArray(response) ? response : [];
    }
  });
}

/** 加载国家/地区列表 */
function loadCountries(query = '') {
  countryLoading.value = true;
  getCountries(query || undefined)
    .then((response) => {
      const data = response.data || response;
      countryOptions.value = Array.isArray(data) ? data : [];
    })
    .finally(() => {
      countryLoading.value = false;
    });
}

/** 搜索国家/地区（用于远程搜索） */
function searchCountries(query) {
  loadCountries(query);
}

/** 国家/地区下拉框获取焦点 */
function handleCountryFocus() {
  if (countryOptions.value.length === 0) {
    // 首次打开下拉框时，加载所有国家
    loadCountries();
  }
}

/** 国家/地区下拉框可见性变化 */
function handleCountryVisibleChange(visible) {
  if (visible && countryOptions.value.length === 0) {
    // 打开下拉框时，如果没有数据则加载所有国家
    loadCountries();
  }
}

/** 加载地域数据（用于树形选择器的懒加载） */
function loadDistrictData(node, resolve) {
  const parentId = node ? node.data.id : 0;
  getDistricts(parentId).then((response) => {
    const data = response.data || response;
    const districts = Array.isArray(data) ? data : [];
    // 将数据转换为树形结构，标记是否有子节点
    const nodes = districts.map((district) => ({
      ...district,
      leaf: false, // 假设都有子节点，实际可以根据业务逻辑判断
    }));
    resolve(nodes);
  });
}

/** 初始化地域树数据（加载根节点） */
function initDistrictTree() {
  getDistricts(0).then((response) => {
    const data = response.data || response;
    districtTreeData.value = Array.isArray(data) ? data : [];
  });
}

/** 查询DSP列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listDsp(params).then((response) => {
    // 后端返回 Page<Dsp>，需要适配前端格式
    if (response.records) {
      dspList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      dspList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      dspList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      dspList.value = Array.isArray(response) ? response : [];
      total.value = dspList.value.length;
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
    brandLogo: undefined,
    bidEndpoint: undefined,
    winNoticeEndpoint: undefined,
    token: undefined,
    contactName: undefined,
    contactPhone: undefined,
    contactEmail: undefined,
    password: undefined,
    status: 1,
    qpsLimit: undefined,
    timeoutMs: undefined,
  };
  proxy.resetForm('dspRef');
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
  title.value = '添加DSP';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getDsp(id).then((response) => {
    form.value = response.data || response;
    open.value = true;
    title.value = '修改DSP';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['dspRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateDsp(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addDsp(form.value).then((response) => {
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
  const dspIds = row.id || ids.value;
  const dspId = Array.isArray(dspIds) ? dspIds[0] : dspIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + dspId + '"的数据项？')
    .then(function () {
      return delDsp(dspId);
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
    .confirm('是否确认启用ID为"' + id + '"的DSP？')
    .then(function () {
      return enableDsp(id);
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
    .confirm('是否确认禁用ID为"' + id + '"的DSP？')
    .then(function () {
      return disableDsp(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

/** 设置按钮操作 */
function handleSetting(row) {
  currentDspId.value = row.id;
  resetSettingForm();
  // 初始化地域树和国家列表
  initDistrictTree();
  loadCountries();
  getDspSetting(row.id).then((response) => {
    const data = response.data || response;
    if (data) {
      settingForm.value.siteAdPlacementIds = data.siteAdPlacementIds || [];
      settingForm.value.qpsLimit = data.qpsLimit;
      if (data.targeting) {
        settingForm.value.targeting = {
          osList: data.targeting.osList || [],
          deviceTypes: data.targeting.deviceTypes || [],
          regions: data.targeting.regions || [],
          country: data.targeting.country || '',
        };
      }
    }
    settingOpen.value = true;
  });
}

/** 取消设置按钮 */
function cancelSetting() {
  settingOpen.value = false;
  resetSettingForm();
}

/** 重置设置表单 */
function resetSettingForm() {
  settingForm.value = {
    siteAdPlacementIds: [],
    qpsLimit: undefined,
    targeting: {
      osList: [],
      deviceTypes: [],
      regions: [],
      country: '',
    },
  };
  if (proxy.$refs['settingRef']) {
    proxy.resetForm('settingRef');
  }
}

/** 提交设置表单 */
function submitSettingForm() {
  if (!currentDspId.value) {
    return;
  }
  const submitData = {
    siteAdPlacementIds: settingForm.value.siteAdPlacementIds || [],
    qpsLimit: settingForm.value.qpsLimit,
    targeting: {
      osList: settingForm.value.targeting.osList || [],
      deviceTypes: settingForm.value.targeting.deviceTypes || [],
      regions: settingForm.value.targeting.regions || [],
      country: settingForm.value.targeting.country || '',
    },
  };
  dspSetting(currentDspId.value, submitData).then((response) => {
    proxy.$modal.msgSuccess('设置成功');
    settingOpen.value = false;
    resetSettingForm();
  });
}

// 初始化
getSiteAdPlacementList();
getList();
</script>

