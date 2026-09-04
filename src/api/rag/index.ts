import request from "@/utils/request";
import type { PageResult } from "@/api/common";
import type {
  DocumentQueryParams,
  DocumentItem,
  DocumentVersion,
  DocumentForm,
  ChatResult,
} from "./types";

const RAG_DOCUMENT_BASE_URL = "/api/v1/rag/documents";
const RAG_CHAT_BASE_URL = "/api/v1/rag/knowledge";

const RagDocumentAPI = {
  /** 获取知识文档分页数据 */
  getPage(queryParams?: DocumentQueryParams) {
    return request<unknown, PageResult<DocumentItem>>({
      url: RAG_DOCUMENT_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },

  /** 上传创建知识文档 */
  create(data: DocumentForm & { file: File }) {
    return request({
      url: RAG_DOCUMENT_BASE_URL,
      method: "post",
      data: buildFormData(data),
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 上传新版本 */
  update(id: string, data: DocumentForm & { file: File }) {
    return request({
      url: `${RAG_DOCUMENT_BASE_URL}/${id}`,
      method: "put",
      data: buildFormData(data),
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 删除知识文档 */
  deleteById(id: string) {
    return request({ url: `${RAG_DOCUMENT_BASE_URL}/${id}`, method: "delete" });
  },

  /** 获取文档版本历史 */
  getVersions(id: string) {
    return request<unknown, DocumentVersion[]>({
      url: `${RAG_DOCUMENT_BASE_URL}/${id}/versions`,
      method: "get",
    });
  },
};

/** 组装上传表单数据（multipart/form-data） */
function buildFormData(data: DocumentForm & { file: File }): FormData {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("title", data.title);
  formData.append("departmentId", data.departmentId);
  formData.append("visibility", data.visibility);
  return formData;
}

/** 知识问答 API */
const RagChatAPI = {
  /** 知识库问答 */
  query(question: string) {
    return request<unknown, ChatResult>({
      url: `${RAG_CHAT_BASE_URL}/query`,
      method: "post",
      data: { question },
    });
  },
};

export default RagDocumentAPI;
export { RagChatAPI };

// 重导出类型
export * from "./types";
