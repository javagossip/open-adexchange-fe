<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="广告主名称" prop="advertiserName" style="white-space: nowrap;">
        <el-input
          v-model="queryParams.advertiserName"
          placeholder="请输入广告主名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公司类型" prop="companyType">
        <el-select
          v-model="queryParams.companyType"
          placeholder="公司类型"
          clearable
          style="width: 240px"
        >
          <el-option label="个人" value="individual" />
          <el-option label="公司" value="company" />
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

    <el-table v-loading="loading" :data="advertiserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="广告主名称"
        align="center"
        prop="advertiserName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="公司全称"
        align="center"
        prop="companyName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="公司类型" align="center" prop="companyType" width="100">
        <template #default="scope">
          <span>{{ getCompanyTypeLabel(scope.row.companyType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="所在国家"
        align="center"
        prop="country"
        width="100"
      />
      <el-table-column
        label="联系人姓名"
        align="center"
        prop="contactName"
        :show-overflow-tooltip="true"
        width="120"
      />
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
        width="130"
      />
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.auditStatus === 'APPROVED'
                ? 'success'
                : scope.row.auditStatus === 'REJECTED'
                  ? 'danger'
                  : 'warning'
            "
          >
            {{
              scope.row.auditStatus === 'APPROVED'
                ? '审核通过'
                : scope.row.auditStatus === 'REJECTED'
                  ? '审核拒绝'
                  : scope.row.auditStatus === 'PENDING'
                    ? '审核中'
                    : '未审核'
            }}
          </el-tag>
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
        width="410"
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
            icon="Document"
            @click="handleQualification(scope.row)"
            >资质管理</el-button
          >
          <el-button
            link
            type="warning"
            icon="EditPen"
            @click="handleAudit(scope.row)"
            >审核</el-button
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

    <!-- 添加或修改广告主对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="advertiserRef" :model="form" :rules="rules" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="广告主名称" prop="advertiserName">
          <el-input v-model="form.advertiserName" placeholder="请输入广告主显示名称" />
        </el-form-item>
        <el-form-item label="公司全称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司全称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司类型" prop="companyType">
              <el-select v-model="form.companyType" placeholder="请选择公司类型" style="width: 100%">
                <el-option label="个人" value="individual" />
                <el-option label="公司" value="company" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在国家" prop="country">
              <el-select
                v-model="form.country"
                placeholder="请选择或搜索国家"
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
          </el-col>
        </el-row>
        <el-form-item label="统一社会信用代码" prop="businessLicenseNo">
          <el-input v-model="form.businessLicenseNo" placeholder="请输入统一社会信用代码" />
        </el-form-item>
        <el-form-item label="法人姓名" prop="legalPersonName">
          <el-input v-model="form.legalPersonName" placeholder="请输入法人姓名" />
        </el-form-item>
        <el-form-item label="注册地址" prop="registeredAddress">
          <el-input
            v-model="form.registeredAddress"
            type="textarea"
            :rows="2"
            placeholder="请输入注册地址"
          />
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

        <el-divider content-position="left">资质信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业执照" prop="businessLicenseUrl">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <el-upload
                  class="image-uploader"
                  action="#"
                  :show-file-list="false"
                  :http-request="(options) => handleFileUpload(options, 'businessLicenseUrl')"
                  :before-upload="beforeImageUpload"
                  accept="image/*"
                >
                  <el-image
                    v-if="form.businessLicenseUrl"
                    :src="getFileUrl(form.businessLicenseUrl)"
                    fit="contain"
                    style="width: 148px; height: 148px; border: 1px dashed #d9d9d9; border-radius: 6px;"
                    :preview-src-list="[getFileUrl(form.businessLicenseUrl)]"
                    preview-teleported
                  />
                  <div v-else class="upload-placeholder">
                    <el-icon><Plus /></el-icon>
                    <span>上传营业执照</span>
                  </div>
                </el-upload>
                <el-button
                  v-if="form.businessLicenseUrl"
                  type="danger"
                  link
                  size="small"
                  @click="form.businessLicenseUrl = undefined"
                >
                  移除
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人身份证" prop="legalPersonIdUrl">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <el-upload
                  class="image-uploader"
                  action="#"
                  :show-file-list="false"
                  :http-request="(options) => handleFileUpload(options, 'legalPersonIdUrl')"
                  :before-upload="beforeImageUpload"
                  accept="image/*"
                >
                  <el-image
                    v-if="form.legalPersonIdUrl"
                    :src="getFileUrl(form.legalPersonIdUrl)"
                    fit="contain"
                    style="width: 148px; height: 148px; border: 1px dashed #d9d9d9; border-radius: 6px;"
                    :preview-src-list="[getFileUrl(form.legalPersonIdUrl)]"
                    preview-teleported
                  />
                  <div v-else class="upload-placeholder">
                    <el-icon><Plus /></el-icon>
                    <span>上传法人身份证</span>
                  </div>
                </el-upload>
                <el-button
                  v-if="form.legalPersonIdUrl"
                  type="danger"
                  link
                  size="small"
                  @click="form.legalPersonIdUrl = undefined"
                >
                  移除
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">状态设置</el-divider>
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

    <!-- 资质管理对话框 -->
    <el-dialog title="资质管理" v-model="qualificationOpen" width="900px" append-to-body>
      <div style="margin-bottom: 16px">
        <el-button type="primary" icon="Plus" @click="handleAddLicense">新增资质</el-button>
      </div>
      <el-table :data="licenseList" border>
        <el-table-column label="行业编码" prop="industryCode" width="150" />
        <el-table-column label="资质名称" prop="licenseName" />
        <el-table-column label="资质文件" prop="licenseUrl" width="200">
          <template #default="scope">
            <el-link
              v-if="scope.row.licenseUrl"
              :href="getFileUrl(scope.row.licenseUrl)"
              target="_blank"
              type="primary"
            >
              查看文件
            </el-link>
            <span v-else style="color: #909399">未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleEditLicense(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" icon="Delete" @click="handleDeleteLicense(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑资质对话框 -->
      <el-dialog
        :title="licenseDialogTitle"
        v-model="licenseDialogOpen"
        width="600px"
        append-to-body
      >
        <el-form ref="licenseFormRef" :model="licenseForm" :rules="licenseRules" label-width="100px">
          <el-form-item label="行业编码" prop="industryCode">
            <el-input
              v-model="licenseForm.industryCode"
              placeholder="请输入行业编码，如 medical, finance"
            />
          </el-form-item>
          <el-form-item label="资质名称" prop="licenseName">
            <el-input v-model="licenseForm.licenseName" placeholder="请输入资质名称" />
          </el-form-item>
          <el-form-item label="资质文件" prop="licenseUrl">
            <div style="display: flex; align-items: center; gap: 12px">
              <el-upload
                class="file-uploader"
                action="#"
                :show-file-list="false"
                :http-request="handleLicenseFileUpload"
                :before-upload="beforeFileUpload"
                accept="image/*,.pdf"
              >
                <el-button type="primary" size="small">上传文件</el-button>
              </el-upload>
              <div
                v-if="licenseForm.licenseUrl"
                style="display: flex; align-items: center; gap: 8px"
              >
                <el-link :href="getFileUrl(licenseForm.licenseUrl)" target="_blank" type="primary">
                  查看文件
                </el-link>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="licenseForm.licenseUrl = undefined"
                >
                  移除
                </el-button>
              </div>
              <span v-else style="color: #909399; font-size: 12px">未上传</span>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitLicenseForm">确 定</el-button>
            <el-button @click="cancelLicenseForm">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="广告主审核" v-model="auditOpen" width="1200px" append-to-body>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-divider content-position="left">广告主基本信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="广告主名称">
              {{ auditDetail.advertiser?.advertiserName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="公司全称">
              {{ auditDetail.advertiser?.companyName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="公司类型">
              {{ getCompanyTypeLabel(auditDetail.advertiser?.companyType) }}
            </el-descriptions-item>
            <el-descriptions-item label="所在国家">
              {{ auditDetail.advertiser?.country || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="统一社会信用代码">
              {{ auditDetail.advertiser?.businessLicenseNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="法人姓名">
              {{ auditDetail.advertiser?.legalPersonName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="注册地址" :span="2">
              {{ auditDetail.advertiser?.registeredAddress || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系人姓名">
              {{ auditDetail.advertiser?.contactName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系人电话">
              {{ auditDetail.advertiser?.contactPhone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系人邮箱" :span="2">
              {{ auditDetail.advertiser?.contactEmail || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="营业执照" :span="2">
              <el-link
                v-if="auditDetail.advertiser?.businessLicenseUrl"
                :href="getFileUrl(auditDetail.advertiser.businessLicenseUrl)"
                target="_blank"
                type="primary"
              >
                查看文件
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="法人身份证" :span="2">
              <el-link
                v-if="auditDetail.advertiser?.legalPersonIdUrl"
                :href="getFileUrl(auditDetail.advertiser.legalPersonIdUrl)"
                target="_blank"
                type="primary"
              >
                查看文件
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="auditDetail.advertiser?.status === 1 ? 'success' : 'danger'">
                {{ auditDetail.advertiser?.status === 1 ? '使用中' : '停用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">行业资质信息</el-divider>
          <el-table :data="auditDetail.industryLicenses" border style="width: 100%">
            <el-table-column label="行业编码" prop="industryCode" width="150" />
            <el-table-column label="资质名称" prop="licenseName" />
            <el-table-column label="资质文件" width="150">
              <template #default="scope">
                <el-link
                  v-if="scope.row.licenseUrl"
                  :href="getFileUrl(scope.row.licenseUrl)"
                  target="_blank"
                  type="primary"
                >
                  查看文件
                </el-link>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!auditDetail.industryLicenses || auditDetail.industryLicenses.length === 0" description="暂无资质信息" />
        </el-col>

        <el-col :span="10">
          <el-divider content-position="left">审核操作</el-divider>
          <el-form ref="auditRef" :model="auditForm" :rules="auditRules" label-width="100px">
            <el-form-item label="当前审核状态">
              <el-tag
                :type="
                  auditDetail.advertiserAudit?.auditStatus === 'APPROVED'
                    ? 'success'
                    : auditDetail.advertiserAudit?.auditStatus === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                "
              >
                {{
                  auditDetail.advertiserAudit?.auditStatus === 'APPROVED'
                    ? '审核通过'
                    : auditDetail.advertiserAudit?.auditStatus === 'REJECTED'
                      ? '审核拒绝'
                      : auditDetail.advertiserAudit?.auditStatus === 'PENDING'
                        ? '审核中'
                        : '未审核'
                }}
              </el-tag>
            </el-form-item>
            <el-form-item v-if="auditDetail.advertiserAudit?.auditTime" label="审核时间">
              {{ parseTime(auditDetail.advertiserAudit.auditTime) }}
            </el-form-item>
            <el-form-item v-if="auditDetail.advertiserAudit?.auditReason" label="历史驳回原因">
              <div style="color: #f56c6c">{{ auditDetail.advertiserAudit.auditReason }}</div>
            </el-form-item>
            <el-divider />
            <el-form-item label="审核结果" prop="auditStatus">
              <el-radio-group v-model="auditForm.auditStatus">
                <el-radio value="APPROVED">审核通过</el-radio>
                <el-radio value="REJECTED">审核拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="auditForm.auditStatus === 'REJECTED'"
              label="驳回原因"
              prop="auditReason"
            >
              <el-input
                v-model="auditForm.auditReason"
                type="textarea"
                :rows="6"
                placeholder="请输入驳回原因"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAuditForm">确 定</el-button>
          <el-button @click="cancelAudit">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Advertiser">
import { Plus } from '@element-plus/icons-vue';
import {
  listAdvertiser,
  getAdvertiser,
  getAdvertiserDetail,
  delAdvertiser,
  addAdvertiser,
  updateAdvertiser,
  enableAdvertiser,
  disableAdvertiser,
  getAdvertiserLicenses,
  addAdvertiserLicense,
  updateAdvertiserLicense,
  deleteAdvertiserLicense,
} from '@/api/dsp/advertiser';
import { uploadFile } from '@/api/file';
import { getCountries } from '@/api/system/dict';

const { proxy } = getCurrentInstance();
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const advertiserList = ref([]);
const countryOptions = ref([]);
const countryLoading = ref(false);
const open = ref(false);
const qualificationOpen = ref(false);
const licenseDialogOpen = ref(false);
const auditOpen = ref(false);
const licenseList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const licenseDialogTitle = ref('');
const currentAdvertiserId = ref(null);
const currentLicenseId = ref(null);
const currentAuditAdvertiserId = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    advertiserName: undefined,
    companyType: undefined,
    status: undefined,
  },
  rules: {
    advertiserName: [{ required: true, message: '广告主名称不能为空', trigger: 'blur' }],
    companyName: [{ required: true, message: '公司全称不能为空', trigger: 'blur' }],
    companyType: [{ required: true, message: '公司类型不能为空', trigger: 'change' }],
    country: [{ required: true, message: '所在国家不能为空', trigger: 'change' }],
    businessLicenseNo: [{ required: true, message: '统一社会信用代码不能为空', trigger: 'blur' }],
    legalPersonName: [{ required: true, message: '法人姓名不能为空', trigger: 'blur' }],
    registeredAddress: [],
    contactName: [],
    contactEmail: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
    contactPhone: [],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  },
});

const { queryParams, form, rules } = toRefs(data);

const licenseFormData = reactive({
  form: {
    industryCode: undefined,
    licenseName: undefined,
    licenseUrl: undefined,
  },
  rules: {
    industryCode: [{ required: true, message: '行业编码不能为空', trigger: 'blur' }],
    licenseName: [{ required: true, message: '资质名称不能为空', trigger: 'blur' }],
    licenseUrl: [{ required: true, message: '资质文件不能为空', trigger: 'change' }],
  },
});

const { form: licenseForm, rules: licenseRules } = toRefs(licenseFormData);

const auditDetail = ref({
  advertiser: null,
  industryLicenses: [],
  advertiserAudit: null,
});

const auditFormData = reactive({
  form: {
    auditStatus: undefined,
    auditReason: undefined,
  },
  rules: {
    auditStatus: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
    auditReason: [
      {
        validator: (rule, value, callback) => {
          if (auditFormData.form.auditStatus === 'REJECTED' && !value) {
            callback(new Error('驳回原因不能为空'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  },
});

const { form: auditForm, rules: auditRules } = toRefs(auditFormData);

/** 获取公司类型标签 */
function getCompanyTypeLabel(type) {
  if (!type) return '-';
  const typeMap = {
    individual: '个人',
    company: '公司',
  };
  return typeMap[type] || type;
}

/** 获取文件URL */
function getFileUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))
    return url;
  if (url.startsWith(baseUrl)) return url;
  return baseUrl + (url.startsWith('/') ? url : '/' + url);
}

/** 文件上传前验证 */
function beforeFileUpload(file) {
  const isImage = file.type && file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  if (!isImage && !isPdf) {
    proxy.$modal.msgError('请上传图片或PDF格式文件');
    return false;
  }
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    proxy.$modal.msgError('文件大小不能超过 10MB');
    return false;
  }
  return true;
}

/** 图片上传前验证 */
function beforeImageUpload(file) {
  const isImage = file.type && file.type.startsWith('image/');
  if (!isImage) {
    proxy.$modal.msgError('请上传图片格式文件');
    return false;
  }
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    proxy.$modal.msgError('图片大小不能超过 10MB');
    return false;
  }
  return true;
}

/** 处理文件上传 */
async function handleFileUpload(options, fieldName) {
  try {
    proxy.$modal.loading('正在上传文件，请稍候...');
    const res = await uploadFile(options.file);
    // 后端返回 ApiResponse<String>，文件地址在 data 字段
    form.value[fieldName] = res.data;
    proxy.$modal.msgSuccess('上传成功');
  } catch (e) {
    proxy.$modal.msgError('上传失败');
  } finally {
    proxy.$modal.closeLoading();
  }
}

/** 处理资质文件上传 */
async function handleLicenseFileUpload(options) {
  try {
    proxy.$modal.loading('正在上传文件，请稍候...');
    const res = await uploadFile(options.file);
    // 后端返回 ApiResponse<String>，文件地址在 data 字段
    licenseForm.value.licenseUrl = res.data;
    proxy.$modal.msgSuccess('上传成功');
  } catch (e) {
    proxy.$modal.msgError('上传失败');
  } finally {
    proxy.$modal.closeLoading();
  }
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

/** 查询广告主列表 */
function getList() {
  loading.value = true;
  // 后端使用 pageNo，前端使用 pageNum，需要转换
  const params = {
    ...queryParams.value,
    pageNo: queryParams.value.pageNum,
  };
  delete params.pageNum;
  listAdvertiser(params).then((response) => {
    // 后端返回 Page<Advertiser>，需要适配前端格式
    // 如果后端返回的是 { records: [], total: number } 格式
    if (response.records) {
      advertiserList.value = response.records;
      total.value = response.total;
    } else if (response.rows) {
      // 如果后端已经适配为 { rows: [], total: number } 格式
      advertiserList.value = response.rows;
      total.value = response.total;
    } else if (response.data) {
      // 如果返回在 data 字段中
      advertiserList.value = response.data.records || response.data.rows || [];
      total.value = response.data.total || 0;
    } else {
      // 直接返回数组的情况
      advertiserList.value = Array.isArray(response) ? response : [];
      total.value = advertiserList.value.length;
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
    agencyId: undefined,
    advertiserName: undefined,
    companyName: undefined,
    companyType: undefined,
    country: undefined,
    businessLicenseNo: undefined,
    legalPersonName: undefined,
    registeredAddress: undefined,
    contactName: undefined,
    contactEmail: undefined,
    contactPhone: undefined,
    businessLicenseUrl: undefined,
    legalPersonIdUrl: undefined,
    status: 1,
  };
  proxy.resetForm('advertiserRef');
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
  title.value = '添加广告主';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getAdvertiser(id).then((response) => {
    form.value = response.data || response;
    open.value = true;
    title.value = '修改广告主';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['advertiserRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateAdvertiser(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addAdvertiser(form.value).then((response) => {
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
  const advertiserIds = row.id || ids.value;
  const advertiserId = Array.isArray(advertiserIds) ? advertiserIds[0] : advertiserIds;
  proxy.$modal
    .confirm('是否确认删除ID为"' + advertiserId + '"的数据项？')
    .then(function () {
      return delAdvertiser(advertiserId);
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
    .confirm('是否确认启用ID为"' + id + '"的广告主？')
    .then(function () {
      return enableAdvertiser(id);
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
    .confirm('是否确认禁用ID为"' + id + '"的广告主？')
    .then(function () {
      return disableAdvertiser(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('禁用成功');
    })
    .catch(() => {});
}

/** 审核按钮操作 */
function handleAudit(row) {
  currentAuditAdvertiserId.value = row.id;
  resetAuditForm();
  // 获取广告主聚合详细信息
  getAdvertiserDetail(row.id).then((response) => {
    const data = response.data || response;
    if (data) {
      auditDetail.value = {
        advertiser: data.advertiser || {},
        industryLicenses: data.industryLicenses || [],
        advertiserAudit: data.advertiserAudit || {},
      };
      // 设置默认审核状态
      auditForm.value.auditStatus = data.advertiser?.auditStatus || 'PENDING';
      auditForm.value.auditReason = '';
    }
    auditOpen.value = true;
  });
}

/** 取消审核 */
function cancelAudit() {
  auditOpen.value = false;
  resetAuditForm();
  auditDetail.value = {
    advertiser: null,
    industryLicenses: [],
    advertiserAudit: null,
  };
}

/** 重置审核表单 */
function resetAuditForm() {
  auditForm.value = {
    auditStatus: undefined,
    auditReason: undefined,
  };
  if (proxy.$refs['auditRef']) {
    proxy.resetForm('auditRef');
  }
}

/** 提交审核表单 */
function submitAuditForm() {
  proxy.$refs['auditRef'].validate((valid) => {
    if (valid) {
      if (!currentAuditAdvertiserId.value) {
        return;
      }
      // 通过更新广告主信息来更新审核状态
      const updateData = {
        id: currentAuditAdvertiserId.value,
        auditStatus: auditForm.value.auditStatus,
        auditReason: auditForm.value.auditReason || undefined,
      };
      updateAdvertiser(updateData).then((response) => {
        proxy.$modal.msgSuccess('审核成功');
        auditOpen.value = false;
        resetAuditForm();
        getList();
      });
    }
  });
}

/** 资质管理按钮操作 */
function handleQualification(row) {
  currentAdvertiserId.value = row.id;
  loadLicenseList();
  qualificationOpen.value = true;
}

/** 加载资质列表 */
function loadLicenseList() {
  if (!currentAdvertiserId.value) return;
  getAdvertiserLicenses(currentAdvertiserId.value).then((response) => {
    const data = response.data || response;
    licenseList.value = Array.isArray(data) ? data : [];
  });
}

/** 新增资质 */
function handleAddLicense() {
  resetLicenseForm();
  currentLicenseId.value = null;
  licenseDialogTitle.value = '新增资质';
  licenseDialogOpen.value = true;
}

/** 编辑资质 */
function handleEditLicense(row) {
  resetLicenseForm();
  currentLicenseId.value = row.id;
  licenseForm.value = {
    industryCode: row.industryCode,
    licenseName: row.licenseName,
    licenseUrl: row.licenseUrl,
  };
  licenseDialogTitle.value = '编辑资质';
  licenseDialogOpen.value = true;
}

/** 删除资质 */
function handleDeleteLicense(row) {
  proxy.$modal
    .confirm('是否确认删除该资质？')
    .then(function () {
      return deleteAdvertiserLicense(row.id);
    })
    .then(() => {
      proxy.$modal.msgSuccess('删除成功');
      loadLicenseList();
    })
    .catch(() => {});
}

/** 取消资质管理 */
function cancelQualification() {
  qualificationOpen.value = false;
  licenseList.value = [];
}

/** 重置资质表单 */
function resetLicenseForm() {
  licenseForm.value = {
    industryCode: undefined,
    licenseName: undefined,
    licenseUrl: undefined,
  };
  if (proxy.$refs['licenseFormRef']) {
    proxy.resetForm('licenseFormRef');
  }
}

/** 取消资质表单 */
function cancelLicenseForm() {
  licenseDialogOpen.value = false;
  resetLicenseForm();
}

/** 提交资质表单 */
function submitLicenseForm() {
  proxy.$refs['licenseFormRef'].validate((valid) => {
    if (valid) {
      if (currentLicenseId.value) {
        // 更新
        updateAdvertiserLicense(currentLicenseId.value, licenseForm.value).then((response) => {
          proxy.$modal.msgSuccess('更新成功');
          licenseDialogOpen.value = false;
          resetLicenseForm();
          loadLicenseList();
        });
      } else {
        // 新增
        addAdvertiserLicense(currentAdvertiserId.value, licenseForm.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          licenseDialogOpen.value = false;
          resetLicenseForm();
          loadLicenseList();
        });
      }
    }
  });
}

getList();
</script>

<style scoped>
.upload-placeholder {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  cursor: pointer;
  transition: border-color 0.3s;
}
.upload-placeholder:hover {
  border-color: #409eff;
}
.upload-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.upload-placeholder span {
  font-size: 12px;
}
</style>
