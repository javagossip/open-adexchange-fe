<template>
  <div class="app-container">
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
            v-model="dateRange.transactionTime"
            value-format="YYYY-MM-DD"
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
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['account:transaction:export']"
          >导出</el-button
        >
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="transactionList">
      <el-table-column label="公司名称" align="center" prop="companyName" min-width="120" />
      <el-table-column label="充值金额($)" align="center" prop="recharge" />
      <el-table-column label="充值加收费($)" align="center" prop="addFee" />
      <el-table-column label="开卡数" align="center" prop="cardNum" />
      <el-table-column label="开卡加收费($)" align="center" prop="createCardAddFee" />
      <el-table-column label="卡消费净金额($)" align="center" prop="transactionAmount" />
      <el-table-column label="卡消费加收费($)" align="center" prop="consumptionAddFee" />
      <el-table-column label="卡消费金额($)" align="center" prop="consumption" />
      <el-table-column label="卡退款&冲正金额($)" align="center" prop="creditAmount" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="Transaction">
import dayjs from 'dayjs'; // 引入 dayjs 库
import { list, exportList } from '@/api/statistics/accountStatistics';
import { downloadBlob } from '@/utils/ruoyi';
const { proxy } = getCurrentInstance();

const transactionList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

// 新增：当前激活的日期tab
const activeDateTab = ref('today');

const dateRange = ref({
  transactionTime: [],
  createTime: [],
  updateTime: [],
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
});

const { queryParams } = toRefs(data);

/** 辅助函数：计算快捷按钮的日期范围 */
function selectDateRange(tabName) {
  activeDateTab.value = tabName;
  let start = '';
  let end = '';

  switch (tabName) {
    case 'today':
      start = dayjs().format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    case 'yesterday':
      start = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      end = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      break;
    case 'this_week':
      // 本周（周一到今天）。注意：dayjs默认周日是startOf('week')，这里+1天，调整为周一
      start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    case 'last_week':
      // 上周（周一到周日）
      start = dayjs().subtract(1, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD');
      end = dayjs().subtract(1, 'week').endOf('week').add(1, 'day').format('YYYY-MM-DD');
      break;
    case 'this_month':
      // 当月（1号到今天）
      start = dayjs().startOf('month').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    case 'last_month':
      // 上个月（1号到月底）
      start = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;
    default:
      start = '';
      end = '';
  }

  // 更新 dateRange.transactionTime 并触发查询
  dateRange.value.transactionTime = [start, end];
  handleQuery();
}

/** 处理自定义日期选择器变化时，取消快捷按钮选中状态 */
function handleCustomDateChange(value) {
  if (value && value.length === 2) {
    // 当用户选择了自定义日期，将快捷按钮状态设为空
    activeDateTab.value = '';
  } else {
    // 用户清空了自定义日期
    activeDateTab.value = '';
    dateRange.value.transactionTime = [];
  }
  // 自动触发查询
  handleQuery();
}

/** 查询列表 */
function getList() {
  // === 优化点：日期非空判断 ===
  if (
    !dateRange.value.transactionTime ||
    dateRange.value.transactionTime.length !== 2 ||
    !dateRange.value.transactionTime[0] ||
    !dateRange.value.transactionTime[1]
  ) {
    proxy.$modal.msgWarning('请选择统计日期范围！');
    return; // 阻止查询
  }
  // ==========================

  loading.value = true;

  // 交易时间
  queryParams.value.startDate = dateRange.value.transactionTime[0];
  queryParams.value.endDate = dateRange.value.transactionTime[1];

  // 直接传递 queryParams.value
  list(queryParams.value)
    .then((response) => {
      transactionList.value = response.data.list;
      // 注意：根据您的 PageHelper 逻辑，这里应该是 total 而不是 pages
      total.value = response.data.total;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false; // 确保失败时也关闭加载状态
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 导出按钮操作 */
function handleExport() {
  // === 优化点：日期非空判断 ===
  if (
    !dateRange.value.transactionTime ||
    dateRange.value.transactionTime.length !== 2 ||
    !dateRange.value.transactionTime[0] ||
    !dateRange.value.transactionTime[1]
  ) {
    proxy.$modal.msgWarning('请选择统计日期范围！');
    return; // 阻止导出
  }
  // ==========================

  const exportParams = { ...queryParams.value };

  // 处理日期参数
  exportParams.startDate = dateRange.value.transactionTime[0];
  exportParams.endDate = dateRange.value.transactionTime[1];

  proxy.$modal
    .confirm('是否确认导出统计报表数据?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      // 调用 exportTransaction 发起请求
      return exportList(exportParams);
    })
    .then((response) => {
      console.log('导出响应：', response);

      // 从响应头中获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let fileName = '';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-8''|utf-8'')?([^"']+)/i
        );
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        }
      }
      // 从响应头中获取文件 MIME 类型
      const mimeType =
        response.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // 调用 downloadBlob 函数
      downloadBlob(response.data, fileName, mimeType);
    })
    .catch((error) => {
      console.error('导出失败:', error);
      // 错误处理逻辑保持不变
      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const errorJson = JSON.parse(reader.result);
            proxy.$modal.msgError(errorJson.msg || '导出失败，请联系管理员！');
          } catch (e) {
            proxy.$modal.msgError('导出失败：' + (error.message || '未知错误，请联系管理员！'));
          }
        };
        reader.readAsText(error.response.data);
      } else if (error.response && error.response.data && typeof error.response.data === 'object') {
        proxy.$modal.msgError(error.response.data.msg || '导出失败，请检查网络或联系管理员！');
      } else {
        proxy.$modal.msgError('导出失败！' + (error.message || ''));
      }
    });
}

onMounted(() => {
  // 默认选中并查询“今天”的数据，并触发查询
  selectDateRange('today');
});
</script>

<style>
/* 推荐添加以下样式，使日期控件排版美观 */
.date-select-area {
  display: flex;
  align-items: center;
}
.date-quick-btns .el-button {
  /* 调整按钮的边距，使其更紧凑 */
  margin-right: 0px !important;
}
.date-quick-btns .el-button:not(:first-child):not(:last-child) {
  /* 消除中间按钮的左右边框，使其连贯 */
  border-left-width: 0;
  border-right-width: 0;
}
</style>
