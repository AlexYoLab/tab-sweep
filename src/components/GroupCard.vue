<template>
  <div class="group-card" :class="cardClass">
    <!-- 卡片头部：分组名称 + 标签数 + 操作 -->
    <div class="card-header">
      <div class="card-title-row">
        <span class="group-name">{{ group.name }}</span>
        <span class="tab-count-badge">{{ group.tabs.length }}</span>
        <span v-if="hasDuplicate" class="dupe-indicator" title="Has duplicate tabs">⚠ {{ duplicateCount }}</span>
      </div>
      <div class="card-actions">
        <button class="card-action close-all" @click="$emit('close-all')" title="Close all tabs in this group">
          Close all
        </button>
        <button v-if="hasDuplicate" class="card-action fix-dupes" @click="$emit('fix-dupes')" title="Close duplicate tabs">
          Fix dupes
        </button>
      </div>
    </div>

    <!-- Tab列表 -->
    <div class="tab-rows">
      <TabRow
        v-for="(tab, idx) in visibleTabs"
        :key="tab.id"
        :tab="tab"
        @switch="(e) => $emit('switch-to-tab', tab)"
        @close="() => $emit('close-tab', tab.id)"
        @save-later="() => $emit('save-later', tab)"
        @close-duplicates="(url) => $emit('close-dupes-by-url', url)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TabRow from './TabRow.vue'

const props = defineProps({
  group: { type: Object, required: true }
})

defineEmits([
  'switch-to-tab',
  'close-tab',
  'save-later',
  'close-all',
  'fix-dupes',
  'close-dupes-by-url'
])

const visibleTabs = computed(() => props.group.tabs)

const hasDuplicate = computed(() =>
  Array.isArray(props.group.tabs) && props.group.tabs.some(t => t.isDuplicate)
)

const duplicateCount = computed(() =>
  Array.isArray(props.group.tabs) ? props.group.tabs.filter(t => t.isDuplicate).length : 0
)

const cardClass = computed(() => {
  const classes = []
  if (props.group.order === 0) classes.push('has-amber-bar')
  if (hasDuplicate.value) classes.push('has-dupes')
  return classes.join(' ')
})
</script>

<style scoped>
.group-card {
  background: #fffdf9;
  border: 1px solid #e8e2da;
  border-radius: 8px;
  padding: 14px 16px;
  break-inside: avoid;
  margin-bottom: 12px;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  position: relative;
  overflow: hidden;
  cursor: default;
}

/* 顶部彩色条 */
.group-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: #e8e2da;
}

.group-card.has-amber-bar::before {
  background: #c8713a;
}

.group-card:hover {
  box-shadow: 0 4px 20px rgba(26, 22, 19, 0.06);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.group-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1613;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-count-badge {
  font-size: 10px;
  font-weight: 600;
  color: #c8713a;
  background: rgba(200, 113, 58, 0.08);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.dupe-indicator {
  font-size: 10px;
  font-weight: 600;
  color: #FF9800;
  background: rgba(255, 152, 0, 0.08);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.card-action {
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid #e8e2da;
  background: #fffdf9;
  color: #9a918a;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.card-action:hover {
  border-color: #1a1613;
  color: #1a1613;
}

.card-action.close-all:hover {
  border-color: rgba(179, 90, 90, 0.3);
  color: #b35a5a;
  background: rgba(179, 90, 90, 0.04);
}

.card-action.fix-dupes:hover {
  border-color: rgba(200, 113, 58, 0.3);
  color: #c8713a;
  background: rgba(200, 113, 58, 0.04);
}

.tab-rows {
  display: flex;
  flex-direction: column;
}
</style>
