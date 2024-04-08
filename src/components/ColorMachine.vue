<script setup>
import {ref, computed, watch} from "vue"
import chroma from "chroma-js";
import ColorRow from "@/components/ColorRow.vue";
import Color from "@/components/Color.vue";
import EditableColor from "@/components/EditableColor.vue";
const baseColor = ref(chroma.random())
const grays = ref(null)
const baseShades = computed(() => grays.value.map((g) => baseColor.value.luminance(g.color.luminance())))
const colorSpaces = ["rgb", "hsl", "lab", "lch", "lrgb"]
const grayRatio = ref(0.9)

function resetGray() {
  grays.value = [
    {color: chroma("#1c1c1c"), ratioFactor: 1.0},
    {color: chroma("#777777"), ratioFactor: 1.0},
    {color: chroma("#b5b5b5"), ratioFactor: 0.95},
    {color: chroma("#e3e3e3"), ratioFactor: 0.8},
    {color: chroma("#f6f6f6"), ratioFactor: 0.3}
  ]
}
resetGray()

function isFloat(val) {
  const floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val))
    return false;

  val = parseFloat(val);
  return !isNaN(val);

}

function clamp(a, x, b) {
  return Math.max(a, Math.min(x, b))
}

function setGrayRatioFactor(e, i) {
  const newFactor = e.target.value
  if(isFloat(newFactor)) {
    const f = parseFloat(newFactor);
    grays.value[i].ratioFactor = clamp(0, f, 1)
    console.log(grays.value[i])
  }
}

const colorSpace = ref("hsl");
const mixedColors = computed(() => grays.value.map((g, i) => chroma.mix(baseShades.value[i], g.color, grayRatio.value * g.ratioFactor, colorSpace.value)));
const showGrays = ref(false);
const showShades = ref(false);

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
updateFavicon()

watch(mixedColors, updateFavicon)

</script>

<template>
  <h1>ColorMachine</h1>
  <ColorRow title="Base color">
    <EditableColor v-model:color="baseColor"/>
    <div class="configs">
      <div>
        <label for="grayratio-slider">Gray ratio:</label>
        <input id="grayratio-slider" type="range" min="0" max="1" step="0.01" v-model="grayRatio" class="slider">
        <input id="grayratio-text" type="text" v-model="grayRatio" style="width: 50px;">
      </div>
      <div>
        <label for="colorspace">Colormode:</label>
        <select id="colorspace" v-model="colorSpace">
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
  </ColorRow>
  <div v-show="showGrays">
    <ColorRow  title="Grays">
      <EditableColor :show="false" v-for="(c, i) in grays" v-model:color="grays[i].color">
        <template #extra-input>
          <div>
            <label :for="'grayratio-factor-'+i">Gray ratio factor</label>
            <input class="ratio-factor" type="number" step="0.1"  min="0" max="1"  :id="'grayratio-factor-'+i" @input="(e) => setGrayRatioFactor(e, i)" :value="grays[i].ratioFactor">
          </div>
        </template>
      </EditableColor>
      <input type="button" @click="resetGray" value="&#8634;">
    </ColorRow>
  </div>
  <div v-show="showShades">
    <ColorRow title="Shades">
      <Color v-for="(c, i) in baseShades" :color="baseShades[i]"/>
    </ColorRow>
  </div>
  <ColorRow :title="`Interpolation(${colorSpace.toUpperCase()})`">
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
input {
  height: fit-content;
  margin: 0.5em 0.5em 0;
}
.configs {
  display: flex;
  flex-direction: column;
  margin: 2em;
}
.ratio-factor {
  width: 6em;
}
</style>
