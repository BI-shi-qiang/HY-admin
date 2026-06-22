/**
 * 应用设置相关类型定义
 */

import type { ThemeMode } from "@/enums";

export interface AppSettings {
  title: string;
  version: string;
  showSettings: boolean;
  showTagsView: boolean;
  layout: "left";
  themeColor: string;
  theme: ThemeMode;
  size: string;
  language: string;
}
