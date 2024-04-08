<script setup>
import {ref, computed, watch} from "vue"
import chroma from "chroma-js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/Color.vue";
import EditableColor from "@/components/EditableColor.vue";
import {clamp, isFloat} from "@/utils.js";

// Constant
const colorSpaces = ["rgb", "hsl", "lab", "lch", "lrgb"]
const defaultGrays = [
  {color: chroma("#262626"), ratioFactor: 1.0},
  {color: chroma("#777777"), ratioFactor: 1.0},
  {color: chroma("#b5b5b5"), ratioFactor: 0.95},
  {color: chroma("#e3e3e3"), ratioFactor: 0.8},
  {color: chroma("#f6f6f6"), ratioFactor: 0.3}
]
const defaultActiveColorSpace = "hsl"
const defaultGrayRatio = 0.9

// Editable
const baseColor = ref(chroma.random())
const grays = ref(defaultGrays)
const activeColorSpace = ref(defaultActiveColorSpace);
const grayRatio = ref(defaultGrayRatio)
const showGrays = ref(false);
const showShades = ref(false);
const newPresetName = ref("")
const selectedPresetName = ref("default")

// Computed
const baseShades = computed(() => grays.value.map((g) => baseColor.value.luminance(g.color.luminance())))
const mixedColors = computed(() => grays.value.map((g, i) => chroma.mix(baseShades.value[i], g.color, grayRatio.value * g.ratioFactor, activeColorSpace.value)));

function addGray() {
  grays.value.push({color: chroma("white"), ratioFactor: 1.0})
}

function deleteGray(i) {
  grays.value.splice(i, 1)
}

function setGrayRatioFactor(e, i) {
  const newFactor = e.target.value
  if (isFloat(newFactor)) {
    const f = parseFloat(newFactor);
    grays.value[i].ratioFactor = clamp(0, f, 1)
  }
}

function updateFavicon() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = '/colormachine/favicon.ico';
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = grays.value[2].color.hex();
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = baseColor.value.hex();
    ctx.fillRect(16, 16, 16, 16);

    ctx.fillStyle = mixedColors.value[1].hex();
    ctx.fillRect(16, 0, 16, 16);

    ctx.fillStyle = mixedColors.value[3].hex();
    ctx.fillRect(0, 16, 16, 16);

    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

function create_preset() {
  return JSON.stringify(
      {
        grays: grays.value.map((g) => Object.assign({color: g.color.hex(), ratioFactor: g.ratioFactor})),
        activeColorSpace: activeColorSpace.value,
        grayRatio: grayRatio.value
      }
  )
}

function save_preset(name) {
  if (name !== undefined && name !== null && name.length > 0) {
    const presetStr = create_preset()
    localStorage.setItem(`PRESET_${name}`, presetStr)
    newPresetName.value = ""
  }
}

function getAllPresetNames() {
  return Object.keys(localStorage).filter((k) => k.startsWith("PRESET_")).map((k) => k.slice(7))
}

function load_preset(name) {
  let presetStr;
  if (name !== null && name !== undefined) {
    presetStr = localStorage.getItem(`PRESET_${name}`)
  }
  if (presetStr !== null && presetStr !== undefined) {
    const preset = JSON.parse(presetStr)

    grays.value = preset.grays.map((g) => Object.assign({color: chroma(g.color), ratioFactor: g.ratioFactor}))
    activeColorSpace.value = preset.activeColorSpace
    grayRatio.value = preset.grayRatio
  } else {
    grays.value = defaultGrays
    activeColorSpace.value = defaultActiveColorSpace
    grayRatio.value = defaultGrayRatio
  }
}

function saveState() {
  const stateStr = JSON.stringify(
      {
        baseColor: baseColor.value.hex(),
        grays: grays.value.map((g) => Object.assign({color: g.color.hex(), ratioFactor: g.ratioFactor})),
        activeColorSpace: activeColorSpace.value,
        grayRatio: grayRatio.value,
        showGrays: showGrays.value,
        showShades: showShades.value
      }
  )
  localStorage.setItem(`_STATE_`, stateStr)
}

function loadState() {
  const stateStr = localStorage.getItem("_STATE_")

  if (stateStr !== null && stateStr !== undefined) {
    const state = JSON.parse(stateStr)

    baseColor.value = chroma(state.baseColor)
    grays.value = state.grays.map((g) => Object.assign({color: chroma(g.color), ratioFactor: g.ratioFactor}))
    activeColorSpace.value = state.activeColorSpace
    grayRatio.value = state.grayRatio
    showGrays.value = state.showGrays
    showShades.value = state.showShades
  }
}

load_preset()
save_preset("default")
loadState()
updateFavicon()
watch(mixedColors, updateFavicon)
watch(mixedColors, saveState)
watch(showGrays, saveState)
watch(showShades, saveState)

</script>

<template>
  <h1>ColorMachine</h1>
  <ColorRow title="Base color">
    <EditableColor v-model:color="baseColor" :hidePencil="true"/>
    <div class="configs">
      <div>
        <label for="grayratio-slider">Gray ratio:</label>
        <input id="grayratio-slider" type="range" min="0" max="1" step="0.01" v-model="grayRatio" class="slider">
        <input id="grayratio-text" type="text" v-model="grayRatio" style="width: 50px;">
      </div>
      <div>
        <label for="colorspace">Colormode:</label>
        <select id="colorspace" v-model="activeColorSpace">
          <option v-for="(cs, index) in colorSpaces" :key="index" :value="cs">{{ cs.toUpperCase() }}</option>
        </select>
      </div>
      <div>
        <label for="show-grays" class="show-grays">Show grays</label>
        <input id="show-grays" type="checkbox" class="show-grays" v-model="showGrays">
      </div>
      <div>
        <label for="show-shades" class="show-shades">Show shades</label>
        <input id="show-shades" type="checkbox" class="show-shades" v-model="showShades">
      </div>
    </div>
    <div class="configs presets">
      <div>
        <input type="text" id="preset-name" v-model="newPresetName">
        <button :disabled="!newPresetName" @click="() => save_preset(newPresetName)">Save preset</button>
      </div>
      <div class="select-preset-container">
        <select id="load-preset" v-model="selectedPresetName">
          <option v-for="(p, index) in getAllPresetNames()" :key="index" :value="p">{{ p }}</option>
        </select>
        <button @click="() => load_preset(selectedPresetName)">Load preset</button>
      </div>
    </div>
  </ColorRow>
  <div v-show="showGrays">
    <ColorRow title="Grays">
      <EditableColor :show="false" v-for="(c, i) in grays" v-model:color="grays[i].color">
        <div class="delete-button">
          <button @click="() => deleteGray(i)">
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
        <template #extra-input>
          <div>
            <label :for="'grayratio-factor-'+i">Gray ratio factor</label>
            <input class="ratio-factor" type="number" step="0.1" min="0" max="1" :id="'grayratio-factor-'+i"
                   @input="(e) => setGrayRatioFactor(e, i)" :value="grays[i].ratioFactor">
          </div>
        </template>
      </EditableColor>
        <div class="add-button">
        <button @click="addGray">
          <svg height="4em" width="4em" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
               viewBox="0 0 490 490" xml:space="preserve">
		<g>
			<path d="M227.8,174.1v53.7h-53.7c-9.5,0-17.2,7.7-17.2,17.2s7.7,17.2,17.2,17.2h53.7v53.7c0,9.5,7.7,17.2,17.2,17.2
				s17.1-7.7,17.1-17.2v-53.7h53.7c9.5,0,17.2-7.7,17.2-17.2s-7.7-17.2-17.2-17.2h-53.7v-53.7c0-9.5-7.7-17.2-17.1-17.2
				S227.8,164.6,227.8,174.1z"/>
      <path d="M71.7,71.7C25.5,118,0,179.5,0,245s25.5,127,71.8,173.3C118,464.5,179.6,490,245,490s127-25.5,173.3-71.8
				C464.5,372,490,310.4,490,245s-25.5-127-71.8-173.3C372,25.5,310.5,0,245,0C179.6,0,118,25.5,71.7,71.7z M455.7,245
				c0,56.3-21.9,109.2-61.7,149s-92.7,61.7-149,61.7S135.8,433.8,96,394s-61.7-92.7-61.7-149S56.2,135.8,96,96s92.7-61.7,149-61.7
				S354.2,56.2,394,96S455.7,188.7,455.7,245z"/>
		</g>
</svg>
        </button>
        </div>
    </ColorRow>
  </div>
  <div v-show="showShades">
    <ColorRow title="Shades">
      <Color v-for="(c, i) in baseShades" :color="baseShades[i]"/>
    </ColorRow>
  </div>
  <ColorRow :title="`Interpolation(${activeColorSpace.toUpperCase()})`">
    <Color v-for="(mc, i) in mixedColors" :color="mixedColors[i]"/>
  </ColorRow>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

input, select, button {
  height: fit-content;
  margin: 0.5em 0.5em 0;
}

.configs {
  display: flex;
  flex-direction: column;
  margin: 2em;
}

.presets {
  select {
    flex-grow: 1;
    height: 2em;
  }

  button {
    width: fit-content;
    height: 2em;
  }
}

.select-preset-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.ratio-factor {
  width: 6em;
}

.delete-button {
  position: absolute;
  top: 1em;
  right: 1em;
  button {
    position: relative;
    width: 2em;
    height: 2em;
    border-style: hidden;
    border-radius: 1em;
    background: none;
    cursor: pointer;
    overflow: hidden;
    transition: .3s;
  }

  svg {
    color: rgb(231, 50, 50);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: .3s;
    fill: none;
  }

  button:hover svg{
    transform: translate(-50%, -50%) rotate(-15deg);
    transition: .3s;
  }
}

.add-button {
  margin-top: 5em;

  button {
    position: relative;
    width: 4em;
    height: 4em;
    border-style: hidden;
    cursor: pointer;
    transition: .3s;
    background-color: white;
    fill: #888888;
  }

  svg {
    color: #333333;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 1;
    transition: .3s;
  }

  button:hover svg {
    fill: black;
    transition: .3s;
  }
}
</style>
