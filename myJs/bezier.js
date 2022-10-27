class Bezier extends Path {
  constructor(controlPoints, plane) {
    super(plane);

    this.controlPoints = controlPoints.map((point) =>
      vec3.fromValues(...point)
    );
    this.grade = this.controlPoints.length - 1;
  }

  binomial(a, b) {
    let binomial = 1;
    for (let x = a - b + 1; x <= a; x++) binomial *= x;
    for (let x = 1; x <= b; x++) binomial /= x;
    return binomial;
  }

  base(index, n, u) {
    return (
      this.binomial(n, index) * Math.pow(1 - u, n - index) * Math.pow(u, index)
    );
  }

  eval(u) {
    return this.controlPoints.reduce((acc, curr, index) => {
      let term = vec3.create();
      vec3.scale(term, curr, this.base(index, this.grade, u));

      vec3.add(term, term, acc);

      return term;
    }, vec3.create());
  }

  build(divisions) {
    const build = [];
    const step = 1 / divisions;

    for (let i = 0; i <= divisions; i++) {
      build.push({
        point: this.eval(i * step),
        normal: this.evalNormalMatrix(i * step, step)
      });
    }

    return build;
  }
}

class JointBezier {
  constructor(grade, controlPoints, plane) {
    const controlPointsPerSegment = grade + 1;

    if (controlPoints.length % controlPointsPerSegment !== 0)
      throw new Error(
        `Control points must be grouped in groups of ${controlPointsPerSegment}`
      );

    this.numberOfSegments = controlPoints.length / controlPointsPerSegment;
    this.bezierSegments = [];
    this.grade = grade;

    for (let i = 0; i < controlPoints.length; i += controlPointsPerSegment) {
      this.bezierSegments.push(
        new Bezier(controlPoints.slice(i, i + controlPointsPerSegment), plane)
      );
    }
  }

  build(divisions) {
    let build = [];
    const pointsPerSegment = Math.round(divisions / this.numberOfSegments);

    for (
      let currentSegment = 0;
      currentSegment < this.numberOfSegments;
      currentSegment++
    )
      build = build.concat(
        this.bezierSegments[currentSegment].build(pointsPerSegment)
      );

    return build;
  }
}
