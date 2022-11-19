var LightingModeConfig = {
  All: { direct: true, point: true, spot: true },
  Direct: { direct: true, point: false, spot: false },
  Point: { direct: false, point: true, spot: false },
  "Point & Spot": { direct: false, point: true, spot: true },
  Spot: { direct: false, point: false, spot: true },
  None: { direct: false, point: false, spot: false }
};

var RenderingModeConfig = {
  Smooth: {
    lighting: true,
    normal: false,
    grid: false,
    smooth: true,
    normalTextures: false,
    textures: false
  },
  Textured: {
    lighting: true,
    normal: false,
    grid: false,
    smooth: true,
    normalTextures: true,
    textures: true
  },
  "Textured Normal Map": {
    lighting: false,
    normal: true,
    grid: false,
    smooth: true,
    normalTextures: true,
    textures: false
  },
  Polygons: {
    lighting: false,
    normal: false,
    grid: true,
    smooth: false,
    normalTextures: false
  },
  "Normal Map": {
    lighting: false,
    normal: true,
    grid: false,
    smooth: true,
    normalTextures: false,
    textures: false
  }
};

class GUI {
  constructor() {
    this.gui = new dat.GUI();

    this.gui.width = 450;

    this.values = {};

    this.colors = {};

    this.folders = {};

    this.controllers = {};
  }

  addFolders(folders) {
    folders.forEach((folder) => {
      this.folders[folder] = this.gui.addFolder(folder);
      this.folders[folder].open();
    });
  }

  bindChangeListener(variables, callback) {
    if (Array.isArray(variables)) {
      variables.forEach((variable) =>
        this.controllers[variable].onFinishChange(callback)
      );
    } else this.controllers[variables].onFinishChange(callback);
  }

  addKeyboardListener(variable, options) {
    window.addEventListener(
      "keydown",
      (e) => {
        const selectedOption = options.find(({ key }) => key === e.key);

        if (selectedOption)
          this.controllers[variable].setValue(selectedOption.value);
      },
      { passive: true }
    );
  }

  addRange(variable, from, upto, initial, step = 0.01, folder) {
    this.values[variable] = initial;

    if (folder)
      this.controllers[variable] = this.folders[folder]
        .add(this.values, variable, from, upto)
        .step(step);
    else
      this.controllers[variable] = this.gui
        .add(this.values, variable, from, upto)
        .step(step);
  }

  addSelect(variable, options, initial, folder) {
    this.values[variable] = initial;

    if (folder)
      this.controllers[variable] = this.folders[folder]
        .add(this.values, variable, options)
        .listen();
    else
      this.controllers[variable] = this.gui
        .add(this.values, variable, options)
        .listen();
  }

  addColorPicker(variable, initial, folder) {
    this.colors[variable] = `rgb(${initial.join(", ")})`;

    if (folder)
      this.controllers[variable] = this.folders[folder].addColor(
        this.colors,
        variable
      );
    else this.controllers[variable] = this.gui.addColor(this.colors, variable);
  }

  get(variable) {
    return this.values[variable];
  }

  getColor(variable) {
    const value = this.colors[variable];

    if (value) {
      const color = new THREE.Color(value);

      return [color.r, color.g, color.b];
    }
  }
}
