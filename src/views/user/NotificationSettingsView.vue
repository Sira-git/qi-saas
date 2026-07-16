<template>
  <div class="settings-page bg-light">
    <div class="page-header">
      <div class="page-container header-inner">
        <button class="back-btn" @click="$router.back()">返回</button>
        <h1>消息通知设置</h1>
      </div>
    </div>
    <div class="page-container content-area">
      <div class="glass-card settings-card">
        <!-- 报告生成提醒 -->
        <div class="setting-section">
          <div class="section-header">
            <div class="section-icon">📋</div>
            <div class="section-info">
              <div class="section-title">报告生成提醒</div>
              <div class="section-desc">报告（日报/周报/月报）自动生成完成后，同步推送提醒</div>
            </div>
          </div>
          <div class="setting-controls">
            <a-switch v-model:checked="settings.reportReminder" />
          </div>
        </div>

        <div class="setting-divider"></div>

        <!-- 系统通知 -->
        <div class="setting-section">
          <div class="section-header">
            <div class="section-icon">🔔</div>
            <div class="section-info">
              <div class="section-title">系统通知</div>
              <div class="section-desc">账号安全提醒、功能更新通知、服务到期提醒等</div>
            </div>
          </div>
          <div class="setting-controls">
            <a-switch v-model:checked="settings.systemNotification" />
          </div>
        </div>

        <div class="setting-divider"></div>

        <!-- 免打扰时段 -->
        <div class="setting-section">
          <div class="section-header">
            <div class="section-icon">🌙</div>
            <div class="section-info">
              <div class="section-title">免打扰时段</div>
              <div class="section-desc">在设置的时间段内不推送非紧急消息</div>
            </div>
          </div>
          <div class="setting-controls">
            <a-switch v-model:checked="settings.quietMode" @change="toggleQuietMode" />
          </div>
        </div>

        <div v-if="settings.quietMode" class="quiet-time-config">
          <div class="time-row">
            <div class="time-label">
              <span class="label-icon">⏰</span>
              <span>开始时间</span>
            </div>
            <a-time-picker 
              v-model:value="quietStart" 
              format="HH:mm" 
              size="middle"
            />
          </div>
          <div class="time-row">
            <div class="time-label">
              <span class="label-icon">⏰</span>
              <span>结束时间</span>
            </div>
            <a-time-picker 
              v-model:value="quietEnd" 
              format="HH:mm" 
              size="middle"
            />
          </div>
          <div class="quiet-hint">
            💡 免打扰时段内，仅紧急消息会推送通知
          </div>
        </div>

        <div class="save-actions">
          <button class="btn-reset" @click="resetSettings">重置</button>
          <button class="btn-save" @click="saveSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const settings = reactive({
  reportReminder: true,
  systemNotification: true,
  quietMode: false,
})

const originalSettings = reactive({
  reportReminder: true,
  systemNotification: true,
  quietMode: false,
})

const quietStart = ref(dayjs('09:00', 'HH:mm'))
const quietEnd = ref(dayjs('18:00', 'HH:mm'))

const toggleQuietMode = () => {
  if (settings.quietMode) {
    if (!quietStart.value) {
      quietStart.value = dayjs('09:00', 'HH:mm')
    }
    if (!quietEnd.value) {
      quietEnd.value = dayjs('18:00', 'HH:mm')
    }
  }
  // 不自动保存，只展开/收起时间选择器
}

const saveSettings = () => {
  console.log('保存设置:', {
    ...settings,
    quietStart: quietStart.value?.format('HH:mm'),
    quietEnd: quietEnd.value?.format('HH:mm')
  })
  
  // 更新原始设置
  Object.assign(originalSettings, settings)
  
  message.success('设置已保存')
}

const resetSettings = () => {
  // 恢复到上次保存的设置
  Object.assign(settings, originalSettings)
  message.info('已重置为上次保存的设置')
}
</script>

<style scoped>
.page-header { 
  background: #ffffff; 
  backdrop-filter: blur(12px); 
  border-bottom: 1px solid var(--border-subtle); 
  position: sticky; 
  top: 0; 
  z-index: 50; 
}
.header-inner { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  height: 64px; 
}
.header-inner h1 { 
  font-size: 18px; 
  font-weight: 600; 
  flex: 1; 
  text-align: center; 
}
.back-btn { 
  background: none; 
  border: none; 
  color: #64748b; 
  cursor: pointer; 
  font-size: 15px; 
}
.content-area { 
  padding: 24px 0; 
  max-width: 640px; 
  margin: 0 auto; 
}

.settings-card { 
  padding: 8px 0; 
  color: #1a202c; 
}

.setting-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.section-icon {
  font-size: 24px;
  line-height: 1;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title { 
  font-size: 15px; 
  font-weight: 600; 
  color: #1a202c;
}

.section-desc { 
  font-size: 13px; 
  color: #64748b; 
  line-height: 1.5;
}

.setting-controls {
  display: flex;
  align-items: center;
}

.setting-divider { 
  height: 1px; 
  background: rgba(0,0,0,0.06); 
  margin: 0 24px; 
}

.quiet-time-config {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  margin: 0 24px;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1a202c;
  font-weight: 500;
}

.label-icon {
  font-size: 16px;
}

.quiet-hint {
  font-size: 12px;
  color: #64748b;
  padding: 8px 0 0 36px;
  line-height: 1.5;
}

:deep(.ant-switch) { 
  background: rgba(0,0,0,0.15); 
  width: 44px;
  height: 22px;
}

:deep(.ant-switch-checked) { 
  background: #1677ff; 
}

:deep(.ant-time-picker) {
  width: 140px;
}

:deep(.ant-picker) { 
  background: #ffffff !important; 
  border-color: rgba(0,0,0,0.12) !important; 
}

:deep(.ant-picker-input > input) { 
  color: #1a202c !important; 
  font-size: 13px;
}

.save-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: #ffffff;
}

.btn-reset {
  padding: 10px 24px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  border-color: #9ca3af;
  color: #1a202c;
}

.btn-save {
  padding: 10px 32px;
  background: #1677ff;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #1677ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}

@media (max-width: 768px) {
  .setting-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-controls {
    align-self: flex-end;
  }
  
  .quiet-time-config {
    margin: 0 12px;
    padding: 12px;
  }
  
  .time-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  :deep(.ant-time-picker) {
    width: 100%;
  }
}
</style>
