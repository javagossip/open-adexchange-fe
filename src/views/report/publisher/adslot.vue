<template>
  <div class="app-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb-nav">
      <el-breadcrumb-item>
        <el-link type="primary" @click="goBack">媒体报表</el-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ publisherName }} - 广告位报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-divider />

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="统计日期">
        <div class="date-select-area">
          <el-button-group class="date-quick-btns">
            <el-button
              :type="activeDateTab === 'today' ? 'primary' : ''"
              @click="selectDateRange('today')"
              >今天</el-button
            >
            <el-button
              :type="activeDateTab === 'yesterday' ? 'primary' : ''"
              @click="selectDateRange('yesterday')"
              >昨天</el-button
            >
            <el-button
              :type="activeDateTab === 'this_week' ? 'primary' : ''"
              @click="selectDateRange('this_week')"
              >本周</el-button
            >
            <el-button
              :type="activeDateTab === 'last_week' ? 'primary' : ''"
              @click="selectDateRange('last_week')"
              >上周</el-button
            >
            <el-button
              :type="activeDateTab === 'this_month' ? 'primary' : ''"
              @click="selectDateRange('this_month')"
              >当月</el-button
            >
            <el-button
              :type="activeDateTab === 'last_month' ? 'primary' : ''"
              @click="selectDateRange('last_month')"
              >上个月</el-button
            >
          </el-button-group>

          <el-date-picker
            v-model="dateRange"
            value-format="YYYYMMDD"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleCustomDateChange"
            style="margin-left: 10px; width: 300px"
          ></el-date-picker>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button icon="Back" @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" border stripe>
      <el-table-column label="广告位编码" align="center" prop="adSlotId" min-width="150" sortable />
      <el-table-column label="广告位名称" align="center" prop="adSlotName" min-width="150" sortable />
      <el-table-column label="站点/APP" align="center" prop="siteName" min-width="120" sortable />
      <el-table-column label="曝光量" align="center" prop="impCount" min-width="120" sortable>
        <template #default="scope">
          {{ formatNumber(scope.row.impCount) }}
        </template>
      </el-table-column>
      <el-table-column label="点击量" align="center" prop="clickCount" min-width="120" sortable>
        <template #default="scope">
          {{ formatNumber(scope.row.clickCount) }}
        </template>
      </el-table-column>
      <el-table-column label="点击率" align="center" prop="clickRate" min-width="100" sortable>
        <template #default="scope">
          {{ scope.row.clickRate }}%
        </template>
      </el-table-column>
      <el-table-column label="收入(元)" align="center" prop="revenue" min-width="120" sortable>
        <template #default="scope">
          {{ formatMoney(scope.row.revenue) }}
        </template>
      </el-table-column>
      <el-table-column label="ADX平台收益(元)" align="center" prop="adxRevenue" min-width="140" sortable>
        <template #default="scope">
          {{ formatMoney(scope.row.adxRevenue) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="AdSlotReport">
import dayjs from 'dayjs';
import { listAdSlotReport } from '@/api/report/publisherReport';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

const reportList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

// 从路由参数获取媒体信息
const publisherId = ref(null);
const publisherName = ref('');

// 当前激活的日期tab
const activeDateTab = ref('');
const dateRange = ref([]);

const data = reactive({
  queryParams: {
    pageNo: 1,
    pageSize: 20,
    publisherId: undefined,
    siteId: undefined,
    startDate: undefined,
    endDate: undefined,
  },
});

const { queryParams } = toRefs(data);

/** 格式化数字 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 格式化金额 */
function formatMoney(num) {
  if (num === null || num === undefined) return '0.00';
  return Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 辅助函数：计算快捷按钮的日期范围 */
function selectDateRange(tabName) {
  activeDateTab.value = tabName;
  let start = '';
  let end = '';

  switch (tabName) {
    case 'today':
      start = dayjs().format('YYYYMMDD');
      end = dayjs().format('YYYYMMDD');
      break;
    case 'yesterday':
      start = dayjs().subtract(1, 'day').format('YYYYMMDD');
      end = dayjs().subtract(1, 'day').format('YYYYMMDD');
      break;
    case 'this_week':
      start = dayjs().startOf('week').add(1, 'day').format('YYYYMMDD');
      end = dayjs().format('YYYYMMDD');
      break;
    case 'last_week':
      start = dayjs().subtract(1, 'week').startOf('week').add(1, 'day').format('YYYYMMDD');
      end = dayjs().subtract(1, 'week').endOf('week').add(1, 'day').format('YYYYMMDD');
      break;
    case 'this_month':
      start = dayjs().startOf('month').format('YYYYMMDD');
      end = dayjs().format('YYYYMMDD');
      break;
    case 'last_month':
      start = dayjs().subtract(1, 'month').startOf('month').format('YYYYMMDD');
      end = dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD');
      break;
    default:
      start = '';
      end = '';
  }

  dateRange.value = [start, end];
  handleQuery();
}

/** 处理自定义日期选择器变化时，取消快捷按钮选中状态 */
function handleCustomDateChange(value) {
  if (value && value.length === 2) {
    activeDateTab.value = '';
  } else {
    activeDateTab.value = '';
    dateRange.value = [];
  }
  handleQuery();
}

/** 查询列表 */
function getList() {
  if (!dateRange.value || dateRange.value.length !== 2 || !dateRange.value[0] || !dateRange.value[1]) {
    proxy.$modal.msgWarning('请选择统计日期范围！');
    loading.value = false;
    return;
  }

  loading.value = true;

  // 设置日期参数
  queryParams.value.startDate = parseInt(dateRange.value[0]);
  queryParams.value.endDate = parseInt(dateRange.value[1]);
  queryParams.value.publisherId = publisherId.value;

  listAdSlotReport(queryParams.value)
    .then((response) => {
      const data = response.data || response;
      reportList.value = data.records || [];
      total.value = data.totalRow || 0;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNo = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  activeDateTab.value = 'today';
  selectDateRange('today');
}

/** 返回媒体报表列表 */
function goBack() {
  router.push('/report/publisher');
}

/** 初始化页面 */
function initPage() {
  // 从路由参数获取数据
  publisherId.value = route.query.publisherId ? parseInt(route.query.publisherId) : null;
  publisherName.value = route.query.publisherName || '未知媒体';

  // 如果有传递日期参数，使用传递的日期
  if (route.query.startDate && route.query.endDate) {
    dateRange.value = [route.query.startDate, route.query.endDate];
    activeDateTab.value = '';
    getList();
  } else {
    // 默认查询今天
    selectDateRange('today');
  }
}

onMounted(() => {
  initPage();
});
</script>

<style scoped>
.breadcrumb-nav {
  margin-bottom: 15px;
}
.date-select-area {
  display: flex;
  align-items: center;
}
.date-quick-btns .el-button {
  margin-right: 0px !important;
}
.date-quick-btns .el-button:not(:first-child):not(:last-child) {
  border-left-width: 0;
  border-right-width: 0;
}
</style>
