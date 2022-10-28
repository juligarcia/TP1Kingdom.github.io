class DragCamera {
  constructor() {
    this.anchor = { x: 0, y: 0 };
    this.dragPosition = { x: 0, y: 0 };

    this.mouseDown = false;

    this.deltaScroll = 100;

    this.scrollingUp = false;
    this.scrollingDown = false;

    this.dragX = 110;
    this.dragY = 60;

    this.enabled = true;

    this.observer = { x: 0, y: 0, z: 0 };

    this.UI = null;

    window.addEventListener("mousedown", ({ clientX: x, clientY: y }) => {
      if (!this.enabled) return;

      this.mouseDown = true;
      this.anchor = { x, y };
      this.dragPosition = { x, y };
    });

    window.addEventListener("mouseup", () => {
      if (!this.enabled) return;

      this.mouseDown = false;
      this.dragX += this.dragPosition.x - this.anchor.x;
      this.dragY += this.dragPosition.y - this.anchor.y;
      this.anchor = { x: 0, y: 0 };
      this.dragPosition = { x: 0, y: 0 };
    });

    window.addEventListener("mousemove", ({ clientX: x, clientY: y }) => {
      if (!this.enabled) return;

      if (this.mouseDown) {
        this.dragPosition = { x, y };
      }
    });

    window.addEventListener("wheel", ({ deltaY }) => {
      if (!this.enabled) return;

      this.scrollingDown = deltaY > 0;
      this.scrollingUp = deltaY < 0;
      this.deltaScroll += deltaY;
    });
  }

  setGUIListener() {
    if (this.UI) return;

    const UI = document.getElementsByClassName("dg main a")?.[0];

    if (!UI) return;

    UI.addEventListener("mouseover", () => {
      this.enabled = false;
    });

    UI.addEventListener("mouseleave", () => {
      this.enabled = true;
    });

    this.UI = UI;
  }

  update() {
    this.setGUIListener();

    if (!this.enabled) return;

    const dragX = this.dragX + (this.dragPosition.x - this.anchor.x);
    const dragY = this.dragY + (this.dragPosition.y - this.anchor.y);

    const angleX = dragX * 0.01;
    const angleY = Math.min(Math.PI / 2 - 0.01, Math.max(0.01, dragY * 0.01));

    this.observer = {
      x: (20 + this.deltaScroll / 20) * (Math.cos(angleY) * Math.sin(angleX)),
      y: (20 + this.deltaScroll / 20) * Math.sin(angleY),
      z: (20 + this.deltaScroll / 20) * (Math.cos(angleY) * Math.cos(angleX))
    };
  }

  buildLookAt(target = vec3.create()) {
    const view = mat4.create();

    const eye = vec3.create();
    vec3.add(eye, eye, target);
    vec3.add(
      eye,
      eye,
      vec3.fromValues(this.observer.x, this.observer.y, this.observer.z)
    );

    mat4.lookAt(view, eye, target, vec3.fromValues(0, 1, 0));

    return view;
  }
}
