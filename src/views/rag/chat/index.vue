<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div ref="messagesRef" class="chat-messages">
      <el-empty v-if="messages.length === 0" description="向知识库提问吧" />

      <div v-for="(msg, index) in messages" :key="index" class="chat-message" :class="msg.role">
        <div class="chat-avatar">{{ msg.role === "user" ? "我" : "AI" }}</div>
        <div class="chat-body">
          <div class="chat-bubble">{{ msg.content }}</div>
          <div v-if="msg.sources && msg.sources.length" class="chat-sources">
            <span class="chat-sources-label">引用来源：</span>
            <el-tag
              v-for="source in msg.sources"
              :key="source.chunkId"
              class="chat-source-tag"
              type="info"
              size="small"
            >
              {{ source.title }} · v{{ source.version }}
            </el-tag>
          </div>
        </div>
      </div>

      <div v-if="loading" class="chat-message assistant">
        <div class="chat-avatar">AI</div>
        <div class="chat-body">
          <div class="chat-bubble">正在思考…</div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input">
      <el-input
        v-model="question"
        type="textarea"
        :rows="3"
        resize="none"
        placeholder="请输入问题，Enter 发送，Shift+Enter 换行"
        @keydown.enter.exact.prevent="handleSend"
      />
      <el-button type="primary" :loading="loading" :disabled="!question.trim()" @click="handleSend">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatSource } from "@/api/rag";
import { RagChatAPI } from "@/api/rag";

defineOptions({
  name: "RagChat",
  inheritAttrs: false,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

const messages = ref<ChatMessage[]>([
  { role: "assistant", content: '你好，我是阿毕小助手，可以问关于"我"与"荷源"的一切问题～' },
]);
const question = ref("");
const loading = ref(false);
const messagesRef = ref<HTMLElement>();

/** 发送问题 */
async function handleSend(): Promise<void> {
  const text = question.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: "user", content: text });
  question.value = "";
  loading.value = true;
  scrollToBottom();

  try {
    const result = await RagChatAPI.query(text);
    messages.value.push({
      role: "assistant",
      content: result.answer ?? "（未获取到回答）",
      sources: result.sources ?? [],
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

/** 滚动到底部 */
function scrollToBottom(): void {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}
</script>

<style scoped lang="scss">
.chat-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;

  .chat-messages {
    flex: 1;
    padding: 8px;
    overflow-y: auto;

    .chat-message {
      display: flex;
      margin-bottom: 16px;

      &.user {
        flex-direction: row-reverse;

        .chat-bubble {
          color: #fff;
          background: var(--el-color-primary);
        }
      }

      .chat-avatar {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        font-size: 13px;
        color: #fff;
        background: var(--el-color-primary);
        border-radius: 50%;
      }

      &.user .chat-avatar {
        background: var(--el-color-info);
      }

      .chat-body {
        max-width: 70%;
        margin: 0 12px;

        .chat-bubble {
          padding: 10px 14px;
          line-height: 1.6;
          color: var(--el-text-color-primary);
          overflow-wrap: break-word;
          white-space: pre-wrap;
          background: var(--el-fill-color-light);
          border-radius: 8px;
        }

        .chat-sources {
          margin-top: 6px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .chat-source-tag {
            margin: 2px 4px 2px 0;
          }
        }
      }
    }
  }

  .chat-input {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);

    .el-textarea {
      flex: 1;
    }

    .el-button {
      flex-shrink: 0;
      height: 56px;
    }
  }
}
</style>
