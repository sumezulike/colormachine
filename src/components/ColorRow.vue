<script setup>

const props = defineProps(["title"])
</script>

<template>
  <div class="headline">
    <h2>{{props.title}}</h2>
  </div>
  <div class="colors">
  <slot></slot>
  </div>
</template>

<style scoped>
.colors {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  overflow: scroll;
}
.headline {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>