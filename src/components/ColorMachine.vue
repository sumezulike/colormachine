<script setup>
import {ref, computed, watch, onMounted} from "vue"
import chroma from "chroma-js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/Color.vue";
import EditableColor from "@/components/EditableColor.vue";
import {clamp, isFloat} from "@/utils.js";
import { argbFromHex, hexFromArgb, TonalPalette } from '@material/material-color-utilities';
import AddButton from "@/components/AddButton.vue";

// Constant
const colorSpaces = ["rgb", "hsl", "lab", "lch", "lrgb"]
const defaultPalette = [800, 500, 400, 200, 50]
const defaultShades = [10, 30, 50, 70, 90]
const defaultTints = [10, 30, 50, 70, 90]
const defaultGrays = [
  {color: chroma("#262626"), ratioFactor: 1.0},
  {color: chroma("#777777"), ratioFactor: 1.0},
  {color: chroma("#b5b5b5"), ratioFactor: 0.95},
  {color: chroma("#e3e3e3"), ratioFactor: 0.8},
  {color: chroma("#f6f6f6"), ratioFactor: 0.3}
]
const defaultActiveColorSpaces = {
  tones: "hsl",
  shades: "hsl",
  tints: "hsl",
}
const defaultGrayRatio = 0.9

// Editable
const baseColor = ref(chroma.random())
const grays = ref(defaultGrays)
const palette = ref(defaultPalette)
const shades = ref(defaultShades)
const tints = ref(defaultTints)
const activeColorSpaces = ref(defaultActiveColorSpaces);
const grayRatio = ref(defaultGrayRatio)
const showGrays = ref(false);
const showShades = ref(false);
const showTones = ref(true)
const showTints = ref(false);
const showLumAdjusted = ref(false);
const showPalette = ref(false);
const newPresetName = ref("")
const selectedPresetName = ref("default")

// Computed
const lumAdjusted = computed(() => grays.value.map((g) => baseColor.value.luminance(g.color.luminance())))
const tonesColors = computed(() => grays.value.map((g, i) => chroma.mix(lumAdjusted.value[i], g.color, grayRatio.value * g.ratioFactor, activeColorSpaces.value.tones)));
const colorPalette = computed(() => palette.value.map((t) => getToneFromColor(baseColor.value, 100-t/10)));
const shadesColors = computed(() => shades.value.map((w) => chroma.mix(baseColor.value, "black", w/100, activeColorSpaces.value.shades)))
const tintsColors = computed(() => tints.value.map((w) => chroma.mix(baseColor.value, "white", w/100, activeColorSpaces.value.tints)))

function getToneFromColor(color, tone) {
  const newCol = TonalPalette.fromInt(argbFromHex(color.hex())).tone(tone);
  return chroma(hexFromArgb(newCol))
}

function addGray() {
  grays.value.push({color: chroma("white"), ratioFactor: 1.0})
}

function deleteValue(array, i) {
  array.splice(i, 1)
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
    // [x][ ]
    // [ ][ ]
    ctx.fillStyle = baseColor.value.hex();
    ctx.fillRect(0, 0, 16, 16);

    // [ ][x]
    // [ ][ ]
    ctx.fillStyle = tonesColors.value[Math.ceil(tonesColors.value.length/2)].hex();
    ctx.fillRect(16, 0, 16, 16);

    // [ ][ ]
    // [x][ ]
    ctx.fillStyle = grays.value[Math.floor(grays.value.length/2)].color.hex();
    ctx.fillRect(0, 16, 16, 16);

    // [ ][ ]
    // [ ][x]
    ctx.fillStyle = tonesColors.value[1].hex();
    ctx.fillRect(16, 16, 16, 16);


    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

function create_preset() {
  return createState(["baseColor"])
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
    load(preset)

  } else {
    grays.value = defaultGrays
    palette.value = defaultPalette
    activeColorSpaces.value = defaultActiveColorSpaces
    grayRatio.value = defaultGrayRatio
  }
}

function createState(exclude) {
  let state =
      {
        baseColor: baseColor.value.hex(),
        grays: grays.value.map((g) => Object.assign({color: g.color.hex(), ratioFactor: g.ratioFactor})),
        palette: palette.value,
        shades: shades.value,
        tints: tints.value,
        activeColorSpaces: activeColorSpaces.value,
        grayRatio: grayRatio.value,
        showGrays: showGrays.value,
        showLumAdjusted: showLumAdjusted.value,
        showShades: showShades.value,
        showTints: showTints.value,
        showPalette: showPalette.value,
        showTones: showTones.value,
      }
  if (exclude !== undefined) {
    state = Object.fromEntries(Object.entries(state).filter(([key]) => !exclude.includes(key)));
  }

  return JSON.stringify(state)
}

function saveState() {
  const stateStr = createState()
  localStorage.setItem(`_STATE_`, stateStr)
}

function loadState() {
  const stateStr = localStorage.getItem("_STATE_")

  if (stateStr !== null && stateStr !== undefined) {
    const state = JSON.parse(stateStr)
    load(state)
  }
}

function load(state) {
  baseColor.value = chroma(state.baseColor || baseColor.value)
  palette.value = state.palette || palette.value
  grays.value = state.grays === undefined ? grays.value : state.grays.map((g) => Object.assign({color: chroma(g.color), ratioFactor: g.ratioFactor}))
  shades.value = state.shades || shades.value
  tints.value = state.tints || tints.value
  activeColorSpaces.value = state.activeColorSpaces || activeColorSpaces.value
  grayRatio.value = state.grayRatio|| grayRatio.value
  showGrays.value = state.showGrays === undefined ? showGrays.value : state.showGrays
  showLumAdjusted.value = state.showLumAdjusted === undefined ? showLumAdjusted.value : state.showLumAdjusted
  showShades.value = state.showShades === undefined ? showShades.value : state.showShades
  showTints.value = state.showTints === undefined ? showTints.value : state.showTints
  showPalette.value = state.showPalette === undefined ? showPalette.value : state.showPalette
  showTones.value = state.showTones === undefined ? showTones.value : state.showTones
}

load_preset()
save_preset("default")
loadState()
updateFavicon()
watch(tonesColors, updateFavicon)
watch(tonesColors, saveState)
watch(activeColorSpaces, saveState)
watch(shades, saveState)
watch(tints, saveState)
watch(palette, saveState)

watch(showPalette, saveState)
watch(showShades, saveState)
watch(showTints, saveState)
watch(showGrays, saveState)
watch(showLumAdjusted, saveState)
watch(showTones, saveState)

</script>

<template>
  <h1>ColorMachine</h1>
  <ColorRow title="Base color">
    <EditableColor v-model:color="baseColor" :hidePencil="true" :hide-delete="true"/>
    <div class="configs">
      <div>
        <label for="show-palette" class="show-hide-label">Show material palette</label>
        <input id="show-palette" type="checkbox" class="show-hide-checkbox" v-model="showPalette">
      </div>
      <div>
        <label for="show-shades" class="show-hide-label">Show shades</label>
        <input id="show-shades" type="checkbox" class="show-hide-checkbox" v-model="showShades">
      </div>
      <div>
        <label for="show-tints" class="show-hide-label">Show tints</label>
        <input id="show-tints" type="checkbox" class="show-hide-checkbox" v-model="showTints">
      </div>
      <div>
        <label for="show-grays" class="show-hide-label">Show grays</label>
        <input id="show-grays" type="checkbox" class="show-hide-checkbox" v-model="showGrays">
      </div>
      <div>
        <label for="show-lum-adj" class="show-hide-label">Show gray-adjusted luminance</label>
        <input id="show-lum-adj" type="checkbox" class="show-hide-checkbox" v-model="showLumAdjusted">
      </div>
      <div>
        <label for="show-tones" class="show-hide-label">Show gray tones</label>
        <input id="show-tones" type="checkbox" class="show-hide-checkbox" v-model="showTones">
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
  <div v-show="showPalette">
    <ColorRow title="Material Palette" :has-settings="false">
      <EditableColor
          class="deletable"
          v-for="([k, v], i) in Object.entries(colorPalette)"
          :show="false"
          :color="colorPalette[k]"
          :delete-func="() => deleteValue(palette, i)"
          :id="'palette-'+i"
      >
        <template #inputs>
        <div class="color-value">
          <label :for="'palette-val-'+i">Value</label>
          <input class="palette-val" type="number" min="0" max="1000" step="50" :id="'palette-val-'+i" v-model="palette[i]">
        </div>
        </template>
        <template #color-slot>
          <div>Primary-{{palette[i]}}</div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => palette.push(0)"/>
    </ColorRow>
  </div>
  <div v-show="showShades">
    <ColorRow :title="`Shades (${activeColorSpaces.shades.toUpperCase()})`" :has-settings="true">
      <template #settings>
        <div>
          <label for="colorspace">Colormode:</label>
          <select id="colorspace" v-model="activeColorSpaces.shades">
            <option v-for="(cs, index) in colorSpaces" :key="index" :value="cs">{{ cs.toUpperCase() }}</option>
          </select>
        </div>
      </template>
      <EditableColor
          v-for="(c, i) in shadesColors"
          :color="shadesColors[i]"
          :show="false"
          :id="'shades-'+i"
          :delete-func="() => deleteValue(shades, i)"
      >
        <template #inputs>
          <div class="color-value">
            <label :for="'shades-val-'+i">Value</label>
            <input type="number" min="0" max="100" step="5" :id="'shades-val-'+i" v-model="shades[i]">
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => shades.push(0)"/>
    </ColorRow>
  </div>
  <div v-show="showTints">
    <ColorRow :title="`Tints (${activeColorSpaces.tints.toUpperCase()})`" :has-settings="true">
      <template #settings>
        <label for="colorspace">Colormode:</label>
        <select id="colorspace" v-model="activeColorSpaces.tints">
          <option v-for="(cs, index) in colorSpaces" :key="index" :value="cs">{{ cs.toUpperCase() }}</option>
        </select>
      </template>
      <EditableColor
          v-for="(c, i) in tintsColors"
          :color="tintsColors[i]"
          :show="false"
          :id="'tints-'+i"
          :delete-func="() => deleteValue(tints, i)"
      >
        <template #inputs>
          <div class="color-value">
            <label :for="'tints-val-'+i">Value</label>
            <input type="number" min="0" max="100" step="5" :id="'tints-val-'+i" v-model="tints[i]">
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="() => tints.push(0)"/>
    </ColorRow>
  </div>
  <div v-show="showGrays">
    <ColorRow title="Grays">
      <EditableColor
          :show="false"
          v-for="(c, i) in grays"
          v-model:color="grays[i].color"
          :id="'grays-'+i"
          :delete-func="() => deleteValue(grays, i)"
      >
        <template #extra-input>
          <div>
            <label :for="'grayratio-factor-'+i">Gray ratio factor</label>
            <input class="ratio-factor" type="number" step="0.1" min="0" max="1" :id="'grayratio-factor-'+i"
                   @input="(e) => setGrayRatioFactor(e, i)" :value="grays[i].ratioFactor">
          </div>
        </template>
      </EditableColor>
      <AddButton :add-func="addGray"/>
    </ColorRow>
  </div>
  <div v-show="showLumAdjusted">
    <ColorRow title="Gray-Adjusted Luminance" :info="'Base color with luminance value set to corresponding Gray'">
      <Color v-for="(c, i) in lumAdjusted" :color="lumAdjusted[i]"/>
    </ColorRow>
  </div>
  <div v-show="showTones">
    <ColorRow
        :title="`Gray Tones (${activeColorSpaces.tones.toUpperCase()})`"
        :has-settings="true"
        :info="'Computed by interpolating Gray-Adjusted Luminance and Grays'"
    >
      <template #settings>
        <div>
          <label for="grayratio-slider">Gray ratio:</label>
          <input id="grayratio-slider" type="range" min="0" max="1" step="0.01" v-model="grayRatio" class="slider">
          <input id="grayratio-text" type="text" v-model="grayRatio" style="width: 50px;">
        </div>
        <div>
          <label for="colorspace">Colormode:</label>
          <select id="colorspace" v-model="activeColorSpaces.tones">
            <option v-for="(cs, index) in colorSpaces" :key="index" :value="cs">{{ cs.toUpperCase() }}</option>
          </select>
        </div>
      </template>
      <Color v-for="(mc, i) in tonesColors" :color="tonesColors[i]"/>
    </ColorRow>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.color-value {
  margin: 1em;
  display: flex;
  flex-direction: column;

  input {
    margin: 0.25em;
    width: 5em;
  }
}

.configs {
  display: flex;
  flex-direction: column;
  margin: 2em;
}

.show-hide-checkbox {
  height: fit-content;
  margin: 0.5em 0.5em 0;
}

.presets {
  input, select, button {
    margin: 0.25em;
  }
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

</style>
