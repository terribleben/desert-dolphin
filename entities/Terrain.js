import * as THREE from 'three';
import GameState from '../state/GameState';
import { diffAngle } from '../util/Geometry';
import Pool from './Pool';
import TerrainGenerator from './TerrainGenerator';

export default class Terrain {
  constructor(randomSeed, previousTerrain) {
    const scene = GameState.scene;
    const { poolRange, spans } = new TerrainGenerator(randomSeed, previousTerrain).generate();
    this._poolRange = poolRange;
    this._spans = spans;
    this._collisionMap = this._generateCollisionMap(this._spans);

    this._groundMaterial = new THREE.MeshBasicMaterial({ color: 0xe28631 });
    this._groundMesh = new THREE.Mesh(this._makeShapeGeometry(this._spans), this._groundMaterial);
    this._groundMesh.position.z = 1;
    scene.add(this._groundMesh);

    this._pool = new Pool(this);

    if (previousTerrain) {
      const indexIntoPreviousTerrain = previousTerrain._poolRange.begin - 1;
      const initialXPosition = (GameState.viewport.width / TerrainGenerator.NUM_SPANS) * indexIntoPreviousTerrain;
      this.updateXPosition(initialXPosition);
    }
  }

  addLoser = (loser) => {
    if (!this._losers) {
      this._losers = [];
    }
    this._losers.push(loser);
  }

  updateXPosition = (x) => {
    if (x) {
      this._pool.updateXPosition(x);
      this._groundMesh.position.x += x;
      if (this._previousPool) {
        this._previousPool.updateXPosition(x);
      }
      if (this._losers) {
        this._losers.forEach(loser => {
          loser.updateXPosition(x);
        });
      }
    }
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._groundMesh);
    if (this._previousPool) {
      this._previousPool.destroy();
      this._previousPool = null;
    }
    if (this._losers) {
      this._losers.forEach(loser => { loser.destroy(); });
      this._losers = null;
    }
  }

  isInPool = (x) => {
    const delta = (GameState.viewport.width / TerrainGenerator.NUM_SPANS) * 0.1;
    const { spanIndex } = this._scaledPosition(x - delta);
    if (spanIndex >= this._poolRange.begin && spanIndex <= this._poolRange.end) {
      return true;
    }
    const { otherSpanIndex } = this._scaledPosition(x + delta);
    return (otherSpanIndex == this._poolRange.end);
  }

  getTerrainY = (x) => {
    let { spanIndex, interp } = this._scaledPosition(x);
    return TerrainGenerator.NEUTRAL_Y +
      (this._spans[spanIndex][0] * (1.0 - interp)) +
      (this._spans[spanIndex][1] * (interp));
  }

  getPoolY = (x) => {
    const spanWidth = (GameState.viewport.width / TerrainGenerator.NUM_SPANS);
    const numPoolSpans = (1 + this._poolRange.end - this._poolRange.begin);
    const poolWidth = spanWidth * numPoolSpans;
    const poolCenterX = (Math.floor(x / spanWidth) + (numPoolSpans * 0.5)) * spanWidth;
    const leftY = this.getTerrainY(poolCenterX - poolWidth * 0.49),
          rightY = this.getTerrainY(poolCenterX + poolWidth * 0.49);
    return Math.max(leftY, rightY);
  }

  pointIntersectsTerrain = (point) => {
    return !!(this._getTriangleIntersectingPoint(point));
  }

  _getTriangleIntersectingPoint = (point) => {
    const { spanIndex } = this._scaledPosition(point.x);
    const triangles = this._collisionMap[spanIndex];
    
    if (!triangles) return null;

    const point3 = new THREE.Vector3(point.x, point.y, 0);
    for (let ii = 0; ii < triangles.length; ii++) {
      if (triangles[ii].containsPoint(point3)) {
        return triangles[ii];
      }
    }
    return null;
  }

  /**
   *  params position and velocity represent the motion of something that might
   *  collide with the terrain.
   *
   *  return an object with
   *  isIntersected: bool, intersection: point, angle: number, normal: vector, friction: vector
   */
  getCollision = (position, velocity) => {
    const triangle = this._getTriangleIntersectingPoint(position);
    if (!triangle) {
      return { isIntersected: false };
    }
    const prevPosition = new THREE.Vector3(position.x - velocity.x, position.y - velocity.y, 0);
    const intersection = triangle.closestPointToPoint(prevPosition);
    const angle = this.getAngle(intersection.x);
    const diffVelocityTerrainAngle = diffAngle(
      velocity.angle(),
      angle
    );
    const normalAngle = angle + Math.PI * -0.5;
    const normalMag = velocity.length() * Math.sin(diffVelocityTerrainAngle);
    const normal = new THREE.Vector2(
      normalMag * Math.cos(normalAngle),
      normalMag * Math.sin(normalAngle)
    );
    const frictionAngle = angle - Math.PI,
          frictionMag = velocity.length() * 0.18;
    const friction = new THREE.Vector2(
      frictionMag * Math.cos(frictionAngle),
      frictionMag * Math.sin(frictionAngle)
    );
    return {
      isIntersected: true,
      intersection,
      angle,
      normal,
      friction,
    };
  }

  getAngle = (x) => {
    const quarterSpan = (GameState.viewport.width / TerrainGenerator.NUM_SPANS) * 0.01;
    const yLeft = this.getTerrainY(x - quarterSpan),
          yRight = this.getTerrainY(x + quarterSpan);
    
    const segment = new THREE.Vector2(
      (x + quarterSpan) - (x - quarterSpan),
      yRight - yLeft
    );
    return segment.angle();
  }

  getStartPosition = () => {
    let xStart;
    if (this._previousPool) {
      xStart = this._previousPool.getCenterX();
    } else {
      xStart = GameState.viewport.width * -0.4;
    }
    
    return new THREE.Vector2(
      xStart,
      this.getTerrainY(xStart) + 0.2
    );
  }

  _scaledPosition = (worldX) => {
    const viewportX = ((worldX + GameState.viewport.width * 0.5) / GameState.viewport.width);
    const spanIndexFloat = Math.max(0, Math.min(0.999, viewportX)) * (TerrainGenerator.NUM_SPANS);
    const spanIndex = Math.floor(spanIndexFloat);
    const interp = spanIndexFloat - spanIndex;
    return { spanIndex, interp };
  }

  _makeShapeGeometry = (spans) => {
    const viewport = GameState.viewport;
    let width = viewport.width;
    let shape = new THREE.Shape();
    shape.moveTo(-viewport.width / 2, -viewport.height / 2);

    // (interpolating, 1 + value)
    const depths = [ 0.1, -0.1, 0.05, -0.05, 0.2 ];
    for (let ii = 0; ii < TerrainGenerator.NUM_SPANS; ii++) {
      let xInterpLeft = ii / (TerrainGenerator.NUM_SPANS);
      let xInterpRight = (ii + 1) / (TerrainGenerator.NUM_SPANS);
      let span = spans[ii];
      shape.lineTo(-(viewport.width / 2) + (xInterpLeft * width), TerrainGenerator.NEUTRAL_Y + span[0]);
      shape.lineTo(-(viewport.width / 2) + (xInterpRight * width), TerrainGenerator.NEUTRAL_Y + span[1]);
    }
    // neutral top-right corner
    shape.lineTo(viewport.width / 2, TerrainGenerator.NEUTRAL_Y);

    // bottom two corners
    shape.lineTo(viewport.width / 2, -viewport.height / 2);
    shape.lineTo(-viewport.width / 2, -viewport.height / 2);
    return new THREE.ShapeGeometry(shape);
  }

  getFinalY = () => {
    if (this._spans) {
      return this._spans[TerrainGenerator.NUM_SPANS - 1][1];
    }
    return 0;
  }

  /**
   *  Return a map where keys are span indices
   *  and values are lists of triangles near that span index.
   */
  _generateCollisionMap = (spans) => {
    let collisionMap = {};
    const spanWidth = GameState.viewport.width / TerrainGenerator.NUM_SPANS;
    const viewportBottom = -(GameState.viewport.height / 2);
    const buffer = 0.1;
    let xLeft = -(GameState.viewport.width / 2);
    for (let spanIndex = 0, numSpans = spans.length; spanIndex < numSpans; spanIndex++) {
      const span = spans[spanIndex];
      const xRight = xLeft + spanWidth;
      
      let triangles = [];
      // 2 below
      const leftCorner = new THREE.Vector3(xLeft, span[0], 0),
            rightCorner = new THREE.Vector3(xRight, span[1], 0),
            bottomLeftCorner = new THREE.Vector3(xLeft, viewportBottom, 0),
            bottomRightCorner = new THREE.Vector3(xRight, viewportBottom, 0);

      triangles.push(new THREE.Triangle(leftCorner, rightCorner, bottomLeftCorner));
      triangles.push(new THREE.Triangle(rightCorner, bottomRightCorner, bottomLeftCorner));

      // left discontinuity?
      if (spanIndex > 0) {
        const prevSpan = spans[spanIndex - 1];
        if (prevSpan[1] > span[0]) {
          const prevRightCorner = new THREE.Vector3(xLeft, prevSpan[1], 0),
                bufferCorner = new THREE.Vector3(xLeft - buffer, prevSpan[1], 0);
          triangles.push(new THREE.Triangle(bufferCorner, prevRightCorner, leftCorner));
        }
      }
      // right discontinuity?
      if (spanIndex < numSpans - 1) {
        const nextSpan = spans[spanIndex + 1];
        if (nextSpan[0] > span[1]) {
          const nextLeftCorner = new THREE.Vector3(xRight, nextSpan[0], 0),
                bufferCorner = new THREE.Vector3(xRight + buffer, nextSpan[0], 0);
          triangles.push(new THREE.Triangle(rightCorner, nextLeftCorner, bufferCorner));
        }
      }

      collisionMap[spanIndex] = triangles;
      xLeft += spanWidth;
    }
    return collisionMap;
  }
}
