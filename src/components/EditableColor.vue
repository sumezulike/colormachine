<script setup>

import Color from "@/components/Color.vue";
import chroma from "chroma-js";
import {computed, ref} from "vue";
const color = defineModel("color")

function colorInput(e) {
  const c = e.target.value;
  color.value = chroma.valid(c) && c.length > 4 && (c.length > 5 || chroma(c).alpha() === 1.0) ? chroma(c) : color.value
}
const props = defineProps(['show', "hidePencil"])

const showInputs = ref(props.show !== false);
const id = "" + chroma.random().num() + chroma.random().num() + chroma.random().num();
const textColor = computed(() => chroma.contrast(color.value, 'black') > 4.5 ? 'black' : 'white')
</script>

<template>
  <div class="editable-container">
  <div class="color-container">
    <Color :color="color" />
    <slot></slot>
    <div v-show="!props.hidePencil">
    <label class="pencil" :for="'cb' + id">
      <svg :fill="textColor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/></svg></label>
    <input class="hidden" :id="'cb' + id" type="checkbox" v-model="showInputs">
    </div>
  </div>
  <div v-show="showInputs" class="color-inputs">
    <input id="color-picker" type="color" :value="color" @input="colorInput">
    <input type="text" :value="color" @input="colorInput">
    <slot name="extra-input"></slot>
  </div>
  </div>
</template>

<style scoped>
.editable-container {
  display: flex;
  flex-direction: row;

}
.color-container {
  position: relative;
}
.pencil {
  color: v-bind(textColor);
  cursor: pointer;
  position: absolute;
  top: 1em;
  left: 1em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  background: none;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: .3s;
  }
}

.pencil:hover svg{
  transform: translate(-50%, -50%) rotate(-15deg);
  transition: .3s;
}
.hidden {
  visibility: hidden;
}
.color-inputs {
  margin-top: 3em;
  display: flex;
  flex-direction: column;
  width: 12em;
}
.color-inputs input {
  width: auto;
  text-transform: uppercase;
  margin: 0.25em;
  font-size: 2em;
  text-align: center;
}
</style>