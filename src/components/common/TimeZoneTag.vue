<template>
  <div class="tag">
    <div class="utc">
      <i class="ico-earth zk-monitor zk-monitor-icon-shiqu"></i>
      <span>{{ utc }}</span>
    </div>
    <div v-if="offset" class="offset">{{ offset }}</div>
  </div>
</template>
<script lang="ts" setup>
interface Props {
  utc?: string
  offset?: string
}
withDefaults(defineProps<Props>(), {
  utc: 'UTC+8',
  offset: ''
})
</script>
<style scoped lang="scss">
.tag {
  display: flex;
  align-items: center;
  color: var(--text-color-secondary);
  font-size: var(--font-size-xs);
  height: 20px;
  line-height: 20px;
  padding: 0 $spacing-8;
  background-color: var(--bgc-page);
  border-radius: var(--radius-s);
  user-select: none;
  overflow: hidden;
}
.utc {
  display: flex;
  align-items: center;
  .ico-earth {
    font-size: var(--font-size-base);
    margin-right: $spacing-4;
  }
}
.offset {
  padding-left: $spacing-8;
  margin-left: $spacing-8;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: $spacing-4;
    bottom: $spacing-4;
    width: 1px;
    background-color: var(--border-color);
  }
}
</style>
