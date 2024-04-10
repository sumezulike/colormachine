<script setup>

import {ref} from "vue";

const props = defineProps(["title", "hasSettings", "info"])
const showSettings = ref(false)
</script>

<template>
  <div class="headline">
    <h2>{{props.title}}</h2>
    <div v-show="props.hasSettings" class="settings-button">
      <button @click="() => showSettings = !showSettings">
        <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             width="2.2em" height="2.2em" viewBox="0 0 45.973 45.973"
             xml:space="preserve">
		<path d="M43.454,18.443h-2.437c-0.453-1.766-1.16-3.42-2.082-4.933l1.752-1.756c0.473-0.473,0.733-1.104,0.733-1.774
			c0-0.669-0.262-1.301-0.733-1.773l-2.92-2.917c-0.947-0.948-2.602-0.947-3.545-0.001l-1.826,1.815
			C30.9,6.232,29.296,5.56,27.529,5.128V2.52c0-1.383-1.105-2.52-2.488-2.52h-4.128c-1.383,0-2.471,1.137-2.471,2.52v2.607
			c-1.766,0.431-3.38,1.104-4.878,1.977l-1.825-1.815c-0.946-0.948-2.602-0.947-3.551-0.001L5.27,8.205
			C4.802,8.672,4.535,9.318,4.535,9.978c0,0.669,0.259,1.299,0.733,1.772l1.752,1.76c-0.921,1.513-1.629,3.167-2.081,4.933H2.501
			C1.117,18.443,0,19.555,0,20.935v4.125c0,1.384,1.117,2.471,2.501,2.471h2.438c0.452,1.766,1.159,3.43,2.079,4.943l-1.752,1.763
			c-0.474,0.473-0.734,1.106-0.734,1.776s0.261,1.303,0.734,1.776l2.92,2.919c0.474,0.473,1.103,0.733,1.772,0.733
			s1.299-0.261,1.773-0.733l1.833-1.816c1.498,0.873,3.112,1.545,4.878,1.978v2.604c0,1.383,1.088,2.498,2.471,2.498h4.128
			c1.383,0,2.488-1.115,2.488-2.498v-2.605c1.767-0.432,3.371-1.104,4.869-1.977l1.817,1.812c0.474,0.475,1.104,0.735,1.775,0.735
			c0.67,0,1.301-0.261,1.774-0.733l2.92-2.917c0.473-0.472,0.732-1.103,0.734-1.772c0-0.67-0.262-1.299-0.734-1.773l-1.75-1.77
			c0.92-1.514,1.627-3.179,2.08-4.943h2.438c1.383,0,2.52-1.087,2.52-2.471v-4.125C45.973,19.555,44.837,18.443,43.454,18.443z
			 M22.976,30.85c-4.378,0-7.928-3.517-7.928-7.852c0-4.338,3.55-7.85,7.928-7.85c4.379,0,7.931,3.512,7.931,7.85
			C30.906,27.334,27.355,30.85,22.976,30.85z"/>
</svg>
      </button>
    </div>
    <div v-show="!!(props.info)" class="info-button">
      <div class="info-container">
      <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
           width="2.2em" height="2.2em" viewBox="0 0 416.979 416.979"
           xml:space="preserve">
<g>
	<path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
		c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
		c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
		c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
		c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
</g>
</svg>
      <span class="info"><span>{{props.info}}</span></span>
      </div>
    </div>
  </div>
  <div ref="settingsSlot" v-show="showSettings" class="settings">
  <slot name="settings"></slot>
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

.settings >>> * {
    margin: 0.25em;
}

.info {
  border: #333333 1px solid;
  border-radius: 1em;
  height: 2em;
  padding: 1em 1em 1em 3em;
  display: flex;
  position: relative;
  left: -2em;
  align-items: center;
  transform-origin: 1em 50%;
  transform: scaleX(0);
  transition: 0.3s;
}
.info-container:hover {
  .info {
    transform: scaleX(1);
    transition: 0.3s;
  }
}

.settings-button {
  button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 1em;
    svg {
      transition: .3s;
    }
  }
  button:hover svg {
    transform: rotate(-15deg);
    transition: .3s;
  }
}

.info-container {
  display: flex;
}

.info-button {
  border: none;
  background: white;
  padding: 1em 0 1em 1em;
}
</style>