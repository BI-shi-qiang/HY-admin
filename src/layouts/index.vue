<template>
  <div class="layout-wrapper">
    <LeftLayout />
    <Settings v-if="showSettings" />
  </div>
</template>

<script setup lang="ts">
import LeftLayout from "./LeftLayout.vue";
import Settings from "./components/LayoutSettings.vue";
import { useLayout } from "./useLayout";

const { showSettings } = useLayout();
</script>

<style lang="scss" scoped>
.layout-wrapper {
  width: 100%;
  height: 100%;
}
</style>
