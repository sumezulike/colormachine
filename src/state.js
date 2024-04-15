import { isProxy, toRaw, unref } from "vue";
import { chroma } from "@/color.js";

export const getStateHandler = (store) => {
  function getStateObject(exclude) {
    if (exclude !== undefined) {
      return JSON.parse(
        JSON.stringify(
          Object.fromEntries(
            Object.entries(store.state)
              .filter(([key]) => !exclude.includes(key))
              .map(([k, v]) => [k, toRaw(v)]),
          ),
        ),
      );
    }
    return store.state;
  }

  function stateV1toV2(state) {
    return {
      baseColor:
        state.baseColor !== undefined ? state.baseColor : store.baseColor,
      graysValues: state.grays !== undefined ? state.grays : store.graysValues,
      paletteValues:
        state.palette !== undefined ? state.palette : store.paletteValues,
      shadesValues:
        state.shades !== undefined ? state.shades : store.shadesValues,
      tintsValues: state.tints !== undefined ? state.tints : store.tintsValues,
      activeColorSpaces:
        state.activeColorSpaces !== undefined
          ? state.activeColorSpaces
          : store.activeColorSpaces,
      grayRatio:
        state.grayRatio !== undefined ? state.grayRatio : store.grayRatio,
      visibility: {
        grays:
          state.showGrays !== undefined
            ? state.showGrays
            : store.visibility.grays,
        shades:
          state.showShades !== undefined
            ? state.showShades
            : store.visibility.shades,
        tints:
          state.showTints !== undefined
            ? state.showTints
            : store.visibility.tints,
        lumAdjusted:
          state.showLumAdjusted !== undefined
            ? state.showLumAdjusted
            : store.visibility.lumAdjusted,
        palette:
          state.showPalette !== undefined
            ? state.showPalette
            : store.visibility.palette,
        tones:
          state.showTones !== undefined
            ? state.showTones
            : store.visibility.tones,
      },
    };
  }

  function fixState(state) {
    if (state.version === undefined) {
      return stateV1toV2(state);
    }
    return state;
  }

  function getRepr(obj) {
    obj = unref(obj);
    if (isProxy(obj)) {
      obj = toRaw(obj);
    }
    if (obj.constructor === Object) {
      if (obj.repr !== undefined) {
        return obj.repr();
      }
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, getRepr(v)]),
      );
    } else if (obj.constructor === Array) {
      if (obj.repr !== undefined) {
        return obj.repr();
      }
      return obj.map((v) => getRepr(v));
    }
    if (obj.repr !== undefined) {
      return obj.repr();
    }
    return obj;
  }

  const state = {
    saveToStorage: (name = "_STATE_") => {
      const stateObj = getStateObject();
      const stateStr = JSON.stringify(stateObj);
      localStorage.setItem(name, stateStr);
    },
    loadFromStorage: (name = "_STATE_") => {
      try {
        const stateStr = localStorage.getItem(name);

        if (stateStr !== null && stateStr !== undefined) {
          const newState = fixState(JSON.parse(stateStr));
          newState.baseColor = chroma(newState.baseColor);
          store.$patch(newState);
        }
      } catch (e) {
        console.log("Failed to log state!");
        console.log(e);
      }
    },
    export: () => {
      return getRepr(getStateObject());
    },
  };
  const presets = {
    saveAs: (name) => {
      if (name !== undefined && name !== null && name.length > 0) {
        const presetStr = JSON.stringify(getStateObject(["baseColor"]));
        localStorage.setItem(`PRESET_${name}`, presetStr);
      }
    },
    loadDefault: () => {},
    load: (name) => {
      let presetStr;
      if (name !== null && name !== undefined) {
        presetStr = localStorage.getItem(`PRESET_${name}`);
      }
      if (presetStr !== null && presetStr !== undefined) {
        const preset = fixState(JSON.parse(presetStr));
        store.$patch(preset);
      }
    },
    allNames: () => {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith("PRESET_"))
        .map((k) => k.slice(7));
    },
  };
  /*
  function loadOld(state) {
    store.baseColor = chroma(state.baseColor || store.baseColor);
    store.paletteValues = state.palette || store.paletteValues;
    store.graysValues =
      state.grays === undefined
        ? store.graysValues
        : state.grays.map((g) =>
            Object.assign({
              color: chroma(g.color),
              ratioFactor: g.ratioFactor,
            }),
          );
    store.shadesValues = state.shades || store.shadesValues;
    store.tintsValues = state.tints || store.tintsValues;
    store.activeColorSpaces =
      state.activeColorSpaces || store.activeColorSpaces;
    store.grayRatio = state.grayRatio || store.grayRatio;
    store.showGrays =
      state.showGrays === undefined ? store.showGrays : state.showGrays;
    store.showLumAdjusted =
      state.showLumAdjusted === undefined
        ? store.showLumAdjusted
        : state.showLumAdjusted;
    store.showShades =
      state.showShades === undefined ? store.showShades : state.showShades;
    store.showTints =
      state.showTints === undefined ? store.showTints : state.showTints;
    store.showPalette =
      state.showPalette === undefined ? store.showPalette : state.showPalette;
    store.showTones =
      state.showTones === undefined ? store.showTones : state.showTones;
  }
*/
  return { state, presets };
};
