<template>
  <div class="dash">
    <!-- Header: greeting -->
    <section class="dash-header">
      <div class="card dash-header__card">
        <div class="dash-header__start">
          <div class="dash-avatar">
            <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" alt="" />
            <el-icon v-else :size="22"><User /></el-icon>
          </div>
          <div class="dash-header__text">
            <h1 class="dash-header__greeting">{{ greetings }}</h1>
            <p class="dash-header__date">{{ currentDateStr }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="dash-stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <el-icon :size="18"><User /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ onlineUserCount }}</span>
          <span class="stat-card__label">在线用户</span>
        </div>
        <span
          :class="[
            'stat-card__badge',
            isConnected ? 'stat-card__badge--on' : 'stat-card__badge--off',
          ]"
        >
          {{ isConnected ? "实时" : "离线" }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <el-icon :size="18"><Avatar /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionUvCount }}</span>
          <span class="stat-card__label">今日访客</span>
        </div>
        <span v-if="uvGrowthText !== '--'" class="stat-card__trend">
          <el-icon :size="12">
            <ArrowUp v-if="uvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ uvGrowthText }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">
          <el-icon :size="18"><Monitor /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionPvCount }}</span>
          <span class="stat-card__label">今日浏览量</span>
        </div>
        <span v-if="pvGrowthText !== '--'" class="stat-card__trend">
          <el-icon :size="12">
            <ArrowUp v-if="pvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ pvGrowthText }}
        </span>
      </div>
    </section>

    <!-- Chart -->
    <section class="dash-chart">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">访问趋势</h3>
          <el-radio-group v-model="visitTrendDateRange" size="small">
            <el-radio-button label="近7天" :value="7" />
            <el-radio-button label="近30天" :value="30" />
          </el-radio-group>
        </div>
        <div class="card__body">
          <ECharts :options="visitTrendChartOptions" height="310px" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { dayjs } from "element-plus";
import { ref } from "vue";
import LogAPI from "@/api/system/log";
import type { VisitOverviewDetail, VisitTrendDetail } from "@/api/system/log";
import { useUserStore } from "@/stores/user";
import { formatGrowthRate } from "@/utils";
import { useTransition } from "@vueuse/core";
import { User, Avatar, Monitor, ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import { useOnlineCount } from "@/composables";

const userStore = useUserStore();
const { onlineUserCount, isConnected } = useOnlineCount();

const hours = new Date().getHours();
const greetings = computed(() => {
  const n = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) return `早安，${n}`;
  if (hours >= 8 && hours < 12) return `上午好，${n}`;
  if (hours >= 12 && hours < 18) return `下午好，${n}`;
  if (hours >= 18 && hours < 24) return `晚上好，${n}`;
  return `夜深了，${n}`;
});

const currentDateStr = computed(() => {
  const d = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`;
});

const visitOverviewData = ref<VisitOverviewDetail>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const uvGrowthText = computed(() => {
  const r = visitOverviewData.value.uvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const pvGrowthText = computed(() => {
  const r = visitOverviewData.value.pvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const uvIsUp = computed(() => (visitOverviewData.value.uvGrowthRate || 0) > 0);
const pvIsUp = computed(() => (visitOverviewData.value.pvGrowthRate || 0) > 0);

const tUv = useTransition(
  computed(() => visitOverviewData.value.todayUvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const tPv = useTransition(
  computed(() => visitOverviewData.value.todayPvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const displayTransitionUvCount = computed(() => Math.round(Number((tUv as any)?.value ?? tUv)));
const displayTransitionPvCount = computed(() => Math.round(Number((tPv as any)?.value ?? tPv)));

const visitTrendDateRange = ref(7);
const visitTrendChartOptions = ref({});

function fetchVisitOverviewData() {
  LogAPI.getVisitOverview().then((d) => {
    visitOverviewData.value = d;
  });
}

function fetchVisitTrendData() {
  const s = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  LogAPI.getVisitTrend({
    startDate: dayjs(s).format("YYYY-MM-DD"),
    endDate: dayjs(new Date()).format("YYYY-MM-DD"),
  }).then((d) => {
    updateVisitTrendChartOptions(d);
  });
}

function updateVisitTrendChartOptions(d: VisitTrendDetail) {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      padding: [8, 12],
      extraCssText: "box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px;",
    },
    legend: {
      data: ["浏览量", "访客量"],
      bottom: 0,
      textStyle: { fontSize: 12 },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 24,
    },
    grid: { left: "0%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
    xAxis: {
      type: "category",
      data: d.dates,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed" } },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: "浏览量",
        type: "line",
        data: d.pvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: "#409EFF", width: 2.5 },
        itemStyle: { color: "#409EFF" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.12)" },
              { offset: 1, color: "rgba(64,158,255,0.0)" },
            ],
          },
        },
      },
      {
        name: "访客量",
        type: "line",
        data: d.uvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: "#67C23A", width: 2.5 },
        itemStyle: { color: "#67C23A" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(103,194,58,0.12)" },
              { offset: 1, color: "rgba(103,194,58,0.0)" },
            ],
          },
        },
      },
    ],
  };
}

watch(
  () => visitTrendDateRange.value,
  () => fetchVisitTrendData(),
  { immediate: true }
);
onMounted(() => {
  fetchVisitOverviewData();
});
</script>

<style lang="scss" scoped>
// ============================================================
// Tokens
// ============================================================
$gap: 16px;
$pad: 16px;
$radius: 10px;

%card {
  overflow: hidden;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius;
}

// ============================================================
// Page
// ============================================================

.dash {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $pad;
}

// ============================================================
// Header
// ============================================================

.dash-header {
  &__card {
    display: flex;
    align-items: center;
    padding: 16px 20px;
  }

  &__start {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__greeting {
    margin: 0;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    letter-spacing: -0.01em;
  }

  &__date {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.dash-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// ============================================================
// Stat cards
// ============================================================

.dash-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $gap;
}

.stat-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px;
  @extend %card;

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;

    &--blue {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
    &--green {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
    &--orange {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  &__num {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    letter-spacing: -0.02em;
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__badge {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;

    &--on {
      color: var(--el-color-success);
    }
    &--off {
      color: var(--el-color-danger);
    }
  }

  &__trend {
    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);

    &--up {
      color: var(--el-color-danger);
    }
  }
}

// ============================================================
// Generic card
// ============================================================

.card {
  @extend %card;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__body {
    padding: 0 20px 20px;
  }
}

// ============================================================
// Responsive
// ============================================================

@media (max-width: 992px) {
  .dash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dash {
    gap: 14px;
    padding: 14px;
  }

  .dash-stats {
    grid-template-columns: 1fr;
  }
}
</style>
