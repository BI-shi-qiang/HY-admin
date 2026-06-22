/**
 * 设置相关枚举
 *
 * @description
 * 包含主题、布局、语言、设备等应用设置的枚举定义
 */

/**
 * 主题模式枚举
 */
export const enum ThemeMode {
  /**
   * 明亮主题
   */
  LIGHT = "light",
  /**
   * 暗黑主题
   */
  DARK = "dark",

  /**
   * 系统自动
   */
  AUTO = "auto",
}

/**
 * 菜单布局枚举
 */
export const enum LayoutMode {
  /**
   * 左侧菜单布局
   */
  LEFT = "left",
}

/**
 * 侧边栏状态枚举
 */
export const enum SidebarStatus {
  /**
   * 展开
   */
  OPENED = "opened",

  /**
   * 关闭
   */
  CLOSED = "closed",
}

/**
 * 语言枚举
 */
export const enum LanguageEnum {
  /**
   * 中文
   */
  ZH_CN = "zh-cn",

  /**
   * 英文
   */
  EN = "en",
}

/**
 * 设备枚举
 */
export const enum DeviceEnum {
  /**
   * 宽屏设备
   */
  DESKTOP = "desktop",

  /**
   * 窄屏设备
   */
  MOBILE = "mobile",
}
