<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores";

const appStore = useAppStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size);
</script>
