<template>
  <el-drawer
    v-model="drawerVisible"
    size="320"
    :title="t('settings.project')"
    class="settings-drawer"
  >
    <div class="settings-content">
      <!-- 主题设置 -->
      <section class="config-section">
        <el-divider>{{ t("settings.theme") }}</el-divider>
        <div class="flex-center">
          <el-radio-group v-model="themeMode" class="theme-mode-group">
            <el-radio-button :value="ThemeMode.LIGHT">
              {{ t("login.light") }}
            </el-radio-button>
            <el-radio-button :value="ThemeMode.DARK">
              {{ t("login.dark") }}
            </el-radio-button>
            <el-radio-button :value="ThemeMode.AUTO">
              {{ t("login.auto") }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </section>

      <!-- 界面设置 -->
      <section class="config-section">
        <el-divider>{{ t("settings.interface") }}</el-divider>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.themeColor") }}</span>
          <el-color-picker
            v-model="selectedThemeColor"
            :predefine="colorPresets"
            popper-class="theme-picker-dropdown"
          />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("settings.showTagsView") }}</span>
          <el-switch v-model="settingsStore.showTagsView" />
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
const { t } = useI18n();
import { ThemeMode } from "@/enums";
import { useSettingsStore } from "@/stores";
import { themeColorPresets } from "@/settings";

const colorPresets = [...themeColorPresets];

const settingsStore = useSettingsStore();

const themeMode = computed({
  get: () => settingsStore.theme,
  set: (value: ThemeMode) => {
    settingsStore.theme = value;
  },
});

const selectedThemeColor = computed({
  get: () => settingsStore.themeColor,
  set: (value) => {
    settingsStore.themeColor = value;
  },
});

const drawerVisible = computed({
  get: () => settingsStore.settingsVisible,
  set: (value) => (settingsStore.settingsVisible = value),
});
</script>

<style lang="scss" scoped>
.settings-drawer {
  :deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    overflow: hidden;
  }
}

.settings-content {
  flex: 1 1 auto;
  padding: 20px;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 24px;

  .config-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }
}

.theme-mode-group {
  :deep(.el-radio-button__inner) {
    min-width: 64px;
    text-align: center;
  }
}
</style>
