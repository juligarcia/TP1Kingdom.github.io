class Animated {
  constructor(
    initialValues,
    finalValues,
    easing,
    duration,
    eventConfiguration
  ) {
    this.initialValues = initialValues;
    this.finalValues = finalValues;
    this.values = initialValues;
    this.playing = false;
    this.start = null;

    const element = document.getElementById(eventConfiguration.id);

    element.addEventListener(eventConfiguration.event, () => {
      window.requestAnimationFrame(() => {
        if (this.playing) {
          this.playing = false;
          return;
        }

        if (!start) this.start = new Date();

        const finished = Object.keys(values).every((key) => {
          const error = Math.abs(
            (finalValues[key] - values[key]) /
              Math.max(finalValues[key], values[key])
          );

          error <= 0.01;
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
              (1 - easing(elapsed / duration)) * (from - to) + to;
          else newValues[key] = easing(elapsed / duration) * (to - from) + from;
        });

        this.values = newValues;
      });
    });
  }
}
