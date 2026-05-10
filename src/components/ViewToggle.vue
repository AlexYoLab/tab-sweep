<template>
  <div class="view-toggle" ref="toggleRef">
    <div class="toggle-indicator" :style="indicatorStyle"></div>
    <button
      :class="{ active: modelValue === 'all' }"
      @click="$emit('update:modelValue', 'all')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="1" width="12" height="12" rx="2"/>
        <line x1="1" y1="5" x2="13" y2="5"/>
        <line x1="1" y1="9" x2="13" y2="9"/>
      </svg>
      标签视图
    </button>
    <button
      :class="{ active: modelValue === 'window' }"
      @click="$emit('update:modelValue', 'window')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="1" width="12" height="10" rx="1"/>
        <line x1="1" y1="4" x2="13" y2="4"/>
        <rect x="3" y="12" width="8" height="1" rx="0.5"/>
      </svg>
      窗口视图
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])

const toggleRef = ref(null)
const indicatorStyle = ref({})

async function updateIndicator() {
  await nextTick()
  if (!toggleRef.value) return
  
  const buttons = toggleRef.value.querySelectorAll('button')
  const activeIndex = props.modelValue === 'all' ? 0 : 1
  
  if (buttons[activeIndex]) {
    const btn = buttons[activeIndex]
    indicatorStyle.value = {
      transform: `translateX(${btn.offsetLeft}px)`,
      width: `${btn.offsetWidth}px`
    }
  }
}

watch(() => props.modelValue, updateIndicator, { immediate: true })
</script>

<style scoped>
.view-toggle {
  display: flex;
  gap: 0;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
  position: relative;
}

.toggle-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

button.active {
  color: #1a1a1a;
  font-weight: 600;
}

button:hover:not(.active) {
  color: #333;
}

button:active:not(.active) {
  color: #1a1a1a;
}
</style>
