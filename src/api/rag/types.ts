/**
 * RAG 知识文档类型定义
 */

import type { BaseQueryParams } from "@/api/common";

/** 知识文档分页查询参数 */
export interface DocumentQueryParams extends BaseQueryParams {
  /** 标题关键字 */
  keywords?: string;
}

/** 知识文档列表项 */
export interface DocumentItem {
  /** 文档ID */
  id: string;
  /** 文档标题 */
  title: string;
  /** 所属部门ID */
  departmentId: string;
  /** 可见性（company-公司 / department-部门） */
  visibility: "company" | "department";
  /** 当前版本号 */
  version: number;
  /** 当前版本 chunk 数 */
  chunkCount: number;
  /** 内容校验和 */
  checksum: string | null;
  /** 原始 markdown 存储路径 */
  sourcePath: string | null;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 上传 / 更新文档表单 */
export interface DocumentForm {
  /** 文档ID（上传新版本时存在） */
  id?: string;
  /** 文档标题 */
  title: string;
  /** 所属部门ID */
  departmentId: string;
  /** 可见性 */
  visibility: "company" | "department";
}

/** 文档版本历史 */
export interface DocumentVersion {
  documentId: string;
  title: string;
  version: number;
  departmentId: string;
  visibility: "company" | "department";
  checksum: string;
  sourcePath: string;
  chunkCount: number;
  updatedAt: number;
  isActive: boolean;
}

/** 问答引用来源 */
export interface ChatSource {
  chunkId: string;
  documentId: string;
  title: string;
  version: number;
  chunkIndex: number;
  sourcePath: string;
  content: string;
}

/** 知识问答结果 */
export interface ChatResult {
  status: string;
  answer: string;
  sources: ChatSource[];
}
