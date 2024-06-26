import { computed, isProxy, reactive, ref, toRaw, unref } from "vue";
import { chroma } from "@/color.js";

export const getStateHandler = (store) => {
  function getStateObject(storeState, exclude) {
    if (exclude !== undefined) {
      return JSON.parse(
        JSON.stringify(
          Object.fromEntries(
            Object.entries(storeState)
              .filter(([key]) => !exclude.includes(key))
              .map(([k, v]) => [k, toRaw(v)]),
          ),
        ),
      );
    }
    return storeState;
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
      state = stateV1toV2(state);
    }
    if (state.baseColor !== undefined) {
      state.baseColor = chroma(state.baseColor);
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

  const state = reactive({
    getStateStr: () => {
      const stateObj = getStateObject(store.state);
      return JSON.stringify(stateObj);
    },
    saveToStorage: (name = "_STATE_") => {
      localStorage.setItem(name, state.getStateStr());
    },
    loadFromBase64: (b64Buf) => {
      try {
        const stateStr = atob(b64Buf);

        if (stateStr !== null && stateStr !== undefined) {
          state.load(JSON.parse(stateStr));
        }
      } catch (e) {
        console.error("Failed to load state!");
        console.error(e);
      }
    },
    load: (stateObj) => {
      try {
        store.$patch(fixState(stateObj));
      } catch (e) {
        console.error("Failed to load state!");
        console.error(e);
      }
    },
    loadFromStorage: (name = "_STATE_") => {
      try {
        const stateStr = localStorage.getItem(name);

        if (stateStr !== null && stateStr !== undefined) {
          state.load(JSON.parse(stateStr));
        }
      } catch (e) {
        console.error("Failed to load state!");
        console.error(e);
      }
    },
    base64: computed(() => {
      return btoa(state.getStateStr());
    }),
    export: computed(() => {
      return JSON.stringify(getRepr(getStateObject(store.state)));
    }),
  });
  const presets = reactive({
    newPresetName: ref(""),
    selectedPresetName: ref("default"),
    save: () => {
      presets.saveAs(presets.newPresetName);
      presets.selectedPresetName = presets.newPresetName;
      presets.newPresetName = "";
    },
    saveAs: (name) => {
      if (name !== undefined && name !== null && name.length > 0) {
        const presetStr = JSON.stringify(
          getStateObject(store.state, ["baseColor"]),
        );
        localStorage.setItem(`PRESET_${name}`, presetStr);
        presets.refreshNames();
      }
    },
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
    allNames: ref(["default"]),
    refreshNames: () => {
      const names = Object.keys(localStorage)
        .filter((k) => k.startsWith("PRESET_"))
        .map((k) => k.slice(7));
      presets.allNames = names;
      return names;
    },
  });

  return { state, presets };
};
