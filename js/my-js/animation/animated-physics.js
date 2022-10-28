class AnimatedPhysics {
  constructor(initialValues, physics, isFinished, setter, onFinish) {
    this.initialValues = initialValues;
    this.values = initialValues;
    this.playing = false;
    this.start = null;
    this.physics = physics;
    this.setter = setter;
    this.isFinished = isFinished;
    this.finished = false;
    this.stopped = false;
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
      const initialValues = this.initialValues;

      if (this.stopped) {
        this.reset();
        return;
      }

      if (!this.playing) {
        this.playing = true;
      }

      if (!this.start) this.start = new Date();

      const finished = this.isFinished(initialValues, values);

      if (finished) {
        this.playing = false;
        this.finished = true;
        this.onFinish?.();
        return;
      }
      const elapsed = Date.now() - this.start.getTime();

      const newValues = this.physics(elapsed, initialValues);

      this.values = newValues;
      this.setter(newValues);

      this.play();
    });
  }
}
