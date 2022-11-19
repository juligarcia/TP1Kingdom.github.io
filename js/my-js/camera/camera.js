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

    window.addEventListener(
      "mousedown",
      ({ clientX: x, clientY: y }) => {
        if (!this.enabled) return;

        this.mouseDown = true;
        this.anchor = { x, y };
        this.dragPosition = { x, y };
      },
      { passive: true }
    );

    window.addEventListener(
      "mouseup",
      () => {
        if (!this.enabled) return;

        this.mouseDown = false;
        this.dragX += this.dragPosition.x - this.anchor.x;
        this.dragY += this.dragPosition.y - this.anchor.y;
        this.anchor = { x: 0, y: 0 };
        this.dragPosition = { x: 0, y: 0 };
      },
      { passive: true }
    );

    window.addEventListener(
      "mousemove",
      ({ clientX: x, clientY: y }) => {
        if (!this.enabled) return;

        if (this.mouseDown) {
          this.dragPosition = { x, y };
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "wheel",
      ({ deltaY }) => {
        if (!this.enabled) return;

        this.scrollingDown = deltaY > 0;
        this.scrollingUp = deltaY < 0;
        this.deltaScroll += deltaY;
      },
      { passive: true }
    );
  }

  getObserver() {
    return [this.observer.x, this.observer.y, this.observer.z];
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

class FirstPersonCamera {
  constructor() {
    this.direction = vec3.fromValues(-1, 0, 0);
    this.speed = 0.1;
    this.keyState = { w: false, s: false, d: false, a: false };
    this.position = vec3.fromValues(30, 1.5, 0);
    this.mouse = vec3.create();

    this.canvas = document.getElementById("myCanvas");
    this.canvas.requestPointerLock();

    window.addEventListener("keydown", ({ key }) => {
      if (key === "w" || key === "W")
        this.keyState = { ...this.keyState, w: true };

      if (key === "s" || key === "S")
        this.keyState = { ...this.keyState, s: true };

      if (key === "d" || key === "D")
        this.keyState = { ...this.keyState, d: true };

      if (key === "a" || key === "A")
        this.keyState = { ...this.keyState, a: true };
    });

    window.addEventListener("keyup", ({ key }) => {
      if (key === "w" || key === "W")
        this.keyState = { ...this.keyState, w: false };

      if (key === "s" || key === "S")
        this.keyState = { ...this.keyState, s: false };

      if (key === "d" || key === "D")
        this.keyState = { ...this.keyState, d: false };

      if (key === "a" || key === "A")
        this.keyState = { ...this.keyState, a: false };
    });

    window.addEventListener("mousemove", ({ movementX: x, movementY: y }) => {
      const [mX, mY] = this.mouse;

      this.mouse = vec3.fromValues(mX + x, mY + y, 0);
    });
  }

  getObserver() {
    return this.position;
  }

  update() {
    const r = 200;

    const dir = vec3.fromValues(1, 0, 0);

    const rotationAngleX = (this.mouse[0] % (r * 2 * Math.PI)) / r;
    const rotationAngleY = (this.mouse[1] % (r * 2 * Math.PI)) / r;

    vec3.rotateZ(dir, dir, [0, 0, 0], rotationAngleY);
    vec3.rotateY(dir, dir, [0, 0, 0], rotationAngleX);

    let forwardScale = 0;
    forwardScale += this.keyState.w ? -1 : 0;
    forwardScale += this.keyState.s ? 1 : 0;

    const forwardMovement = forwardScale * this.speed;

    let strafeScale = 0;
    strafeScale += this.keyState.d ? 1 : 0;
    strafeScale += this.keyState.a ? -1 : 0;

    const strafeMovement = strafeScale * this.speed;

    const deltaPosition = vec3.fromValues(forwardMovement, 0, strafeMovement);

    const angleX = vec3.angle(dir, [1, 0, 0]);
    const angleSign = dir[2] >= 0 ? -1 : 1;

    vec3.rotateY(deltaPosition, deltaPosition, [0, 0, 0], angleX * angleSign);

    vec3.add(this.position, this.position, deltaPosition);

    this.direction = dir;
  }

  buildLookAt() {
    const view = mat4.create();

    const eye = vec3.fromValues(...this.position);

    const target = vec3.create();

    vec3.add(target, target, this.position);

    vec3.sub(target, target, this.direction);

    mat4.lookAt(view, eye, target, vec3.fromValues(0, 1, 0));

    return view;
  }
}
