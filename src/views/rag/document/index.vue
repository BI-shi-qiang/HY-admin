<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="tableData.params" :inline="true" label-suffix=":">
        <el-form-item label="标题" prop="keywords">
          <el-input
            v-model="tableData.params.keywords"
            placeholder="文档标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__left">
          <el-button
            v-hasPerm="['rag:document:create']"
            type="success"
            icon="plus"
            @click="openDialog()"
          >
            新增文档
          </el-button>
        </div>
      </div>

      <el-table ref="dataTableRef" v-loading="loading" :data="tableData.list" highlight-current-row>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="文档标题" prop="title" min-width="200" show-overflow-tooltip />
        <el-table-column label="所属部门" align="center" min-width="120">
          <template #default="scope">
            {{ deptNameMap.get(scope.row.departmentId) || scope.row.departmentId || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="可见性" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.visibility === 'company'" type="success">公司</el-tag>
            <el-tag v-else type="info">部门</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前版本" align="center" width="90" prop="version">
          <template #default="scope">v{{ scope.row.version }}</template>
        </el-table-column>
        <el-table-column label="Chunk数" align="center" width="90" prop="chunkCount" />
        <el-table-column label="更新时间" align="center" width="180">
          <template #default="scope">{{ scope.row.updateTime || "-" }}</template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              v-hasPerm="['rag:document:update']"
              type="primary"
              size="small"
              link
              icon="upload"
              @click="openDialog(scope.row)"
            >
              上传新版本
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              icon="clock"
              @click="openVersionDialog(scope.row)"
            >
              版本历史
            </el-button>
            <el-button
              v-hasPerm="['rag:document:delete']"
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="tableData.total > 0"
        v-model:total="tableData.total"
        v-model:page="tableData.params.pageNum"
        v-model:limit="tableData.params.pageSize"
        @pagination="fetchList()"
      />
    </el-card>

    <!-- 上传文档弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="文档标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入文档标题" clearable />
        </el-form-item>

        <el-form-item label="所属部门" prop="departmentId">
          <el-tree-select
            v-model="formData.departmentId"
            :data="deptOptions"
            check-strictly
            :render-after-expand="false"
            placeholder="请选择部门"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="可见性" prop="visibility">
          <el-radio-group v-model="formData.visibility">
            <el-radio value="department">仅本部门可见</el-radio>
            <el-radio value="company">全公司可见</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="文档文件" required>
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".md,.markdown,text/markdown"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button type="primary" icon="upload">选择 .md 文件</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 .md 格式的 markdown 文件，大小不超过 2MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="closeDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 版本历史弹窗 -->
    <el-dialog
      v-model="versionDialog.visible"
      :title="versionDialog.title"
      width="700px"
      @close="closeVersionDialog"
    >
      <el-table v-loading="versionLoading" :data="versionList" border>
        <el-table-column label="版本" align="center" width="90">
          <template #default="scope">v{{ scope.row.version }}</template>
        </el-table-column>
        <el-table-column label="Chunk数" align="center" width="90" prop="chunkCount" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isActive" type="success">生效中</el-tag>
            <el-tag v-else type="info">历史版本</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" min-width="180">
          <template #default="scope">{{ formatTimestamp(scope.row.updatedAt) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, UploadFile, UploadUserFile } from "element-plus";
import type { OptionItem, PageResult } from "@/api/common";

import RagDocumentAPI from "@/api/rag";
import type { DocumentItem, DocumentForm, DocumentVersion, DocumentQueryParams } from "@/api/rag";
import DeptAPI from "@/api/system/dept";

defineOptions({
  name: "RagDocument",
  inheritAttrs: false,
});

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

const loading = ref(false);
const versionLoading = ref(false);

const deptOptions = ref<OptionItem[]>([]);
const fileList = ref<UploadUserFile[]>([]);
const selectedFile = ref<File | undefined>();

type DocumentTableData = PageResult<DocumentItem> & {
  params: DocumentQueryParams;
};

const tableData = reactive<DocumentTableData>({
  list: [],
  total: 0,
  params: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
});

// 上传弹窗状态
const dialogState = reactive({
  title: "",
  visible: false,
});

// 表单数据
const formData = reactive<DocumentForm>({
  title: "",
  departmentId: "",
  visibility: "department",
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入文档标题", trigger: "blur" }],
  departmentId: [{ required: true, message: "请选择所属部门", trigger: "change" }],
  visibility: [{ required: true, message: "请选择可见性", trigger: "change" }],
};

// 版本历史弹窗
const versionDialog = reactive({
  title: "",
  visible: false,
});
const versionList = ref<DocumentVersion[]>([]);

// 部门 id -> 名称 映射
const deptNameMap = computed(() => {
  const map = new Map<string | number, string>();
  flattenDeptOptions(deptOptions.value).forEach((item) => map.set(item.value, item.label));
  return map;
});

/** 将树形部门选项拍平 */
function flattenDeptOptions(nodes: OptionItem[], result: OptionItem[] = []): OptionItem[] {
  nodes.forEach((node) => {
    result.push(node);
    if (node.children?.length) {
      flattenDeptOptions(node.children, result);
    }
  });
  return result;
}

/** 加载部门下拉选项（用于列表部门名称映射 + 表单选择） */
async function loadDeptOptions(): Promise<void> {
  if (deptOptions.value.length === 0) {
    deptOptions.value = await DeptAPI.getOptions();
  }
}

/**
 * 加载文档列表
 */
async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await RagDocumentAPI.getPage(tableData.params);
    tableData.list = data.list ?? [];
    tableData.total = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

/** 查询（重置页码后获取数据） */
function handleQuery(): void {
  tableData.params.pageNum = 1;
  fetchList();
}

/** 重置搜索条件 */
function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  tableData.params.keywords = "";
  handleQuery();
}

/**
 * 打开上传弹窗
 * @param row 传入则为「上传新版本」，否则为「新增」
 */
async function openDialog(row?: DocumentItem): Promise<void> {
  await loadDeptOptions();

  if (row) {
    dialogState.title = `上传新版本 - ${row.title}`;
    formData.id = row.id;
    formData.title = row.title;
    formData.departmentId = row.departmentId;
    formData.visibility = row.visibility;
  } else {
    dialogState.title = "新增知识文档";
    formData.id = undefined;
    formData.title = "";
    formData.departmentId = "";
    formData.visibility = "department";
  }

  selectedFile.value = undefined;
  fileList.value = [];
  dialogState.visible = true;
}

/** 关闭上传弹窗 */
function closeDialog(): void {
  dialogState.visible = false;
  dataFormRef.value?.resetFields();
  dataFormRef.value?.clearValidate();
  selectedFile.value = undefined;
  fileList.value = [];
}

/** 选择文件 */
function handleFileChange(uploadFile: UploadFile): void {
  const raw = uploadFile.raw as File | undefined;
  if (!raw) return;

  if (!raw.name.toLowerCase().endsWith(".md")) {
    ElMessage.warning("仅支持 .md 格式的 markdown 文件");
    fileList.value = [];
    return;
  }
  if (raw.size > 2 * 1024 * 1024) {
    ElMessage.warning("文件大小不能超过 2MB");
    fileList.value = [];
    return;
  }

  selectedFile.value = raw;
}

/** 移除文件 */
function handleFileRemove(): void {
  selectedFile.value = undefined;
}

/** 提交上传 */
async function handleSubmit(): Promise<void> {
  if (!selectedFile.value) {
    ElMessage.warning("请选择要上传的 .md 文件");
    return;
  }

  const valid = await dataFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const payload = {
      title: formData.title,
      departmentId: formData.departmentId,
      visibility: formData.visibility,
      file: selectedFile.value,
    };

    if (formData.id) {
      await RagDocumentAPI.update(formData.id, payload);
      ElMessage.success("上传新版本成功");
    } else {
      await RagDocumentAPI.create(payload);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/** 删除文档 */
function handleDelete(row: DocumentItem): void {
  ElMessageBox.confirm(`确认删除文档「${row.title}」吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      RagDocumentAPI.deleteById(row.id)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

/** 打开版本历史弹窗 */
async function openVersionDialog(row: DocumentItem): Promise<void> {
  versionDialog.title = `版本历史 - ${row.title}`;
  versionDialog.visible = true;
  versionLoading.value = true;
  try {
    versionList.value = await RagDocumentAPI.getVersions(row.id);
  } finally {
    versionLoading.value = false;
  }
}

/** 关闭版本历史弹窗 */
function closeVersionDialog(): void {
  versionDialog.visible = false;
  versionList.value = [];
}

/** 格式化时间戳 */
function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
}

onMounted(() => {
  handleQuery();
  loadDeptOptions();
});
</script>
