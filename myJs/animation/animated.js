class Animated {
  constructor(initialValues, finalValues, easing, duration, variable) {
    this.initialValues = initialValues;
    this.finalValues = finalValues;
    this.values = initialValues;
    this.playing = false;
    this.start = null;
    this.easing = easing;
    this.variable = variable;
    this.duration = duration;
  }

  stop() {
    this.playing = false;
  }

  play() {
    window.requestAnimationFrame(() => {
      const values = this.values;
      const finalValues = this.finalValues;
      const initialValues = this.initialValues;
      this;

      if (this.playing) {
        this.playing = false;
        return;
      }

      if (!this.start) this.start = new Date();

      const finished = Object.keys(values).every((key) => {
        const error = Math.abs(
          (finalValues[key] - values[key]) /
            Math.max(finalValues[key], values[key])
        );

        return error <= 0.01;
      });

      if (finished) {
        this.playing = false;
        return;
      }
      const elapsed = Date.now() - this.start.getTime();

      const newValues = {};

      Object.keys(values).forEach((key) => {
        const from = initialValues[key];
        const to = finalValues[key];

        if (to < from)
          newValues[key] =
            (1 - this.easing(elapsed / this.duration)) * (from - to) + to;
        else
          newValues[key] =
            this.easing(elapsed / this.duration) * (to - from) + from;
      });

      this.values = newValues;
      window[this.variable] = newValues;

      this.play();
    });
  }
}
