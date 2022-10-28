class Animated {
  constructor(initialValues, finalValues, easing, duration, setter, onFinish) {
    this.initialValues = initialValues;
    this.finalValues = finalValues;
    this.values = initialValues;
    this.playing = false;
    this.finished = false;
    this.start = null;
    this.easing = easing;
    this.setter = setter;
    this.duration = duration;
    this.onFinish = onFinish;
  }

  stop() {
    this.playing = false;
    this.stopped = true;
  }

  reset() {
    this.finished = false;
    this.values = this.initialValues;
    this.start = null;
    this.playing = false;
    this.stopped = false;
  }

  play() {
    window.requestAnimationFrame(() => {
      const values = this.values;
      const finalValues = this.finalValues;
      const initialValues = this.initialValues;

      if (this.stopped) {
        this.reset();
        return;
      }

      if (!this.playing) {
        this.playing = true;
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
        this.finished = true;
        this.onFinish?.();
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
      this.setter(newValues);

      this.play();
    });
  }
}
