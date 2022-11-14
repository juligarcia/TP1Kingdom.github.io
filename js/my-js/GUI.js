var LightingModeConfig = {
  All: { direct: true, point: true, spot: true },
  Direct: { direct: true, point: false, spot: false },
  Point: { direct: false, point: true, spot: false },
  "Point & Spot": { direct: false, point: true, spot: true },
  Spot: { direct: false, point: false, spot: true },
  None: { direct: false, point: false, spot: false }
};

var RenderingModeConfig = {
  Smooth: { lighting: true, normal: false, grid: false, smooth: true },
  Polygons: { lighting: false, normal: false, grid: true, smooth: false },
  "Normal Map": { lighting: false, normal: true, grid: false, smooth: true }
};

class GUI {
  constructor() {
    this.gui = new dat.GUI();

    this.gui.width = 450;

    this.values = {};

    this.colors = {};
  }

  addKeyboardListener(variable, options) {
    window.addEventListener("keydown", (e) => {
      const selectedOption = options.find(({ key }) => key === e.key);

      if (selectedOption) {
        this.values[variable] = selectedOption.value;
      }
    });
  }

  addRange(variable, from, upto, initial, step = 0.01) {
    this.values[variable] = initial;

    this.gui.add(this.values, variable, from, upto).step(step);
  }

  addSelect(variable, options, initial) {
    this.values[variable] = initial;

    this.gui.add(this.values, variable, options).listen();
  }

  addColorPicker(variable, initial) {
    this.colors[variable] = `rgb(${initial.join(", ")})`;

    this.gui.addColor(this.colors, variable);
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
