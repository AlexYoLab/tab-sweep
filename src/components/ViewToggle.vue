<template>
  <div class="view-toggle">
    <button 
      :class="{ active: modelValue === 'all' }"
      @click="$emit('update:modelValue', 'all')"
    >
      All Tabs
    </button>
    <button 
      :class="{ active: modelValue === 'window' }"
      @click="$emit('update:modelValue', 'window')"
    >
      By Window
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.view-toggle {
  display: flex;
  gap: 0;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

button.active {
  background: white;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

button:hover:not(.active) {
  color: #333;
}
</style>
