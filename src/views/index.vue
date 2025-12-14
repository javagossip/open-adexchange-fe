<template>
  <div class="app-container home">
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <el-avatar :size="60" :src="userStore.avatar" class="user-avatar" />
        <div class="welcome-text">
          <div class="greeting">
            {{ welcomeMessage }}，{{ userStore.nickName }}，祝你开心每一天！
          </div>
          <div class="date-time">当前时间：{{ date }}</div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :sm="12" :lg="6" v-for="(item, index) in stats" :key="index">
        <el-card shadow="hover" class="stat-card" :style="{ background: item.bg }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-details">
              <el-statistic :title="item.title" :value="item.value" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :lg="16" :sm="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><TrendCharts /></el-icon> 近七日交易趋势</span
              >
            </div>
          </template>
          <div ref="lineChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>

      <el-col :lg="8" :sm="24">
        <el-card shadow="hover" style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><Flag /></el-icon> 快捷操作</span
              >
            </div>
          </template>
          <div class="quick-access">
            <el-button type="primary" plain @click="goTarget('/system/user')">用户管理</el-button>
            <el-button type="success" plain @click="goTarget('/system/role')">角色管理</el-button>
            <el-button plain @click="goTarget('https://hexunion.com/')">访问官网</el-button>
          </div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><DataLine /></el-icon> 技术栈信息</span
              >
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="前端技术" name="1">
              <ul>
                <li v-for="item in feTech" :key="item.name">
                  <el-tag>{{ item.name }}</el-tag
                  >: {{ item.version }}
                </li>
              </ul>
            </el-collapse-item>
            <el-collapse-item title="主要依赖" name="2">
              <ul>
                <li v-for="item in dependencies" :key="item.name">
                  <el-tag type="success">{{ item.name }}</el-tag
                  >: {{ item.version }}
                </li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import useUserStore from '@/store/modules/user';
import {
  Coin,
  User,
  Tickets,
  ChatDotRound,
  TrendCharts,
  Flag,
  DataLine,
} from '@element-plus/icons-vue';
// 注意：这里不再需要 import packageJson

const userStore = useUserStore();
const router = useRouter();

// --- 动态数据 ---
const date = ref('');
let timer = null;
// 从 Vite 环境变量中获取版本号
const version = import.meta.env.VITE_APP_VERSION;

// --- 模拟数据 ---
// 后续请替换为真实API请求
const stats = ref([
  {
    title: '今日交易额',
    value: 126560,
    icon: Coin,
    bg: 'linear-gradient(to right, #4facfe, #00f2fe)',
  },
  {
    title: '总用户数',
    value: 88421,
    icon: User,
    bg: 'linear-gradient(to right, #43e97b, #38f9d7)',
  },
  {
    title: '待办事项',
    value: 35,
    icon: Tickets,
    bg: 'linear-gradient(to right, #fa709a, #fee140)',
  },
  {
    title: '系统消息',
    value: 12,
    icon: ChatDotRound,
    bg: 'linear-gradient(to right, #6a85b6, #bac8e0)',
  },
]);

// --- 图表 ---
const lineChartRef = ref(null);
let lineChart = null;

// --- 技术栈信息 ---
const feTech = ref([
  { name: 'Vue', version: '3.5.16' }, // 您可以根据需要硬编码或通过其他方式获取
  { name: 'Vite', version: '6.3.5' },
  { name: 'Pinia', version: '3.0.2' },
]);
const dependencies = ref([
  { name: 'Element Plus', version: '2.9.9' },
  { name: 'Axios', version: '1.9.0' },
  { name: 'ECharts', version: '5.6.0' },
]);

// --- Computed Properties ---
const welcomeMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// --- Methods ---
function goTarget(url) {
  if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

function updateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  date.value = `${year}-${month}-${day} ${week} ${hours}:${minutes}:${seconds}`;
}

function initLineChart() {
  lineChart = echarts.init(lineChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['交易额', '订单量'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '交易额',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000],
      },
      {
        name: '订单量',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
      },
    ],
  };
  lineChart.setOption(option);
}

function handleResize() {
  if (lineChart) {
    lineChart.resize();
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  initLineChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="scss">
.home {
  .welcome-card {
    background: linear-gradient(to right, #409eff, #79bbff);
    color: white;
    margin-bottom: 20px;

    .welcome-content {
      display: flex;
      align-items: center;
    }

    .user-avatar {
      margin-right: 20px;
      border: 2px solid #fff;
    }

    .welcome-text {
      .greeting {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .date-time {
        font-size: 14px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-details {
      text-align: right;
    }

    :deep(.el-statistic__head) {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
    }

    :deep(.el-statistic__content) {
      color: #fff;
      font-size: 28px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    .el-icon {
      margin-right: 8px;
    }
  }

  .quick-access {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .el-card {
    margin-bottom: 20px;
  }

  .el-collapse {
    border-top: none;
    ul {
      list-style: none;
      padding-left: 0;
      li {
        line-height: 2;
        display: flex;
        justify-content: space-between;
      }
    }
    .el-tag {
      margin-right: 10px;
    }
  }
}
</style>
