import VertexUv, { VertexUvInterface } from './VertexUv.js';
import { Vector2 } from '@babylonjs/core';

export interface TriangleUvInterface {
  a: VertexUvInterface;
  area: number;
  b: VertexUvInterface;
  c: VertexUvInterface;
  id: number;
  inverted: boolean;
  islandIndex: number;
  maxU: number;
  maxV: number;
  minU: number;
  minV: number;
  overlapping: boolean;
  calculateIslandIndex(): void;
  lineIntersects(p1: VertexUvInterface, p2: VertexUvInterface): boolean;
  overlapsTriangle(triangle: TriangleUvInterface): boolean;
  vertexInside(point: VertexUvInterface): boolean;
}

// A 2D triangle of a UV map
export default class TriangleUv implements TriangleUvInterface {
  a = null as unknown as VertexUvInterface;
  area = undefined as unknown as number;
  b = null as unknown as VertexUvInterface;
  c = null as unknown as VertexUvInterface;
  id = undefined as unknown as number;
  inverted = false;
  islandIndex = undefined as unknown as number;
  maxU = undefined as unknown as number;
  maxV = undefined as unknown as number;
  minU = undefined as unknown as number;
  minV = undefined as unknown as number;
  overlapping = false;

  constructor(id: number, a: VertexUv, b: VertexUv, c: VertexUv) {
    this.id = id;
    this.a = a;
    this.b = b;
    this.c = c;

    this.calculateArea();
    this.calculateInverted();
    this.loadMinMax();
  }

  // Recursively groups itself into an island with other triangles it is connected with
  // The minimum vertex index is passed to all neighbors and the smallest one becomes the island index
  public calculateIslandIndex(): void {
    try {
      if (this.a.islandIndex === this.b.islandIndex && this.b.islandIndex === this.c.islandIndex) {
        this.islandIndex = this.a.islandIndex;
        // End of recursive propagation when all 3 vertices are the same
        return;
      } else {
        this.islandIndex = Math.min(this.a.islandIndex, this.b.islandIndex, this.c.islandIndex);
        if (this.a.islandIndex != this.islandIndex) {
          this.a.islandIndex = this.islandIndex;
          if (this.b.islandIndex === this.islandIndex && this.c.islandIndex === this.islandIndex) {
            // "tail" return should reduce recursion depth issues
            return this.a.computeIslandIndexForTriangles();
          } else {
            this.a.computeIslandIndexForTriangles();
          }
        }
        if (this.b.islandIndex != this.islandIndex) {
          this.b.islandIndex = this.islandIndex;
          if (this.c.islandIndex === this.islandIndex) {
            // "tail" return should reduce recursion depth issues
            return this.b.computeIslandIndexForTriangles();
          } else {
            // c's triangles need to be checked too, so can't return here
            this.b.computeIslandIndexForTriangles();
          }
        }
        if (this.c.islandIndex != this.islandIndex) {
          this.c.islandIndex = this.islandIndex;
          // "tail" return should reduce recursion depth issues
          return this.c.computeIslandIndexForTriangles();
        }
      }
    } catch (err) {
      // The recursive function may exceed the stack depth if there are too many triangles
      throw new Error('Unable to merge UV triangles into islands. The model may be too complex');
    }
  }

  // Check if a line intersects this triangle (any of its 3 edges)
  public lineIntersects(p1: VertexUvInterface, p2: VertexUvInterface): boolean {
    return (
      TriangleUv.edgesIntersect(this.a, this.b, p1, p2) ||
      TriangleUv.edgesIntersect(this.b, this.c, p1, p2) ||
      TriangleUv.edgesIntersect(this.c, this.a, p1, p2)
    );
  }

  // Check if another triangle overlaps this one
  public overlapsTriangle(otherTriangle: TriangleUvInterface): boolean {
    // Step 1 - skip if it is the same triangle (fastest)
    if (this.id === otherTriangle.id) {
      return false; // not overlapping
    }
    // Step 2 - skip any triangle with no area. ensures all 3 points are different
    if (this.area === 0 || otherTriangle.area === 0) {
      return false; // not overlapping
    }
    // Step 3 - rectangle check using min/max values from each (fast)
    if (
      this.minU >= otherTriangle.maxU || // right
      this.maxU <= otherTriangle.minU || // left
      this.minV >= otherTriangle.maxV || // above
      this.maxV <= otherTriangle.minV //    below
    ) {
      return false; // not overlapping
    }
    // Step 4 - check for shared points (order is not sorted, so 9 checks needed)
    // Vertex indices were already calculated and can be used for matching here
    const aMatchesA = this.a.index === otherTriangle.a.index;
    const aMatchesB = this.a.index === otherTriangle.b.index;
    const aMatchesC = this.a.index === otherTriangle.c.index;
    const bMatchesA = this.b.index === otherTriangle.a.index;
    const bMatchesB = this.b.index === otherTriangle.b.index;
    const bMatchesC = this.b.index === otherTriangle.c.index;
    const cMatchesA = this.c.index === otherTriangle.a.index;
    const cMatchesB = this.c.index === otherTriangle.b.index;
    const cMatchesC = this.c.index === otherTriangle.c.index;

    const aMatches = aMatchesA || aMatchesB || aMatchesC;
    const bMatches = bMatchesA || bMatchesB || bMatchesC;
    const cMatches = cMatchesA || cMatchesB || cMatchesC;
    const matchCount = (aMatches ? 1 : 0) + (bMatches ? 1 : 0) + (cMatches ? 1 : 0);

    if (matchCount === 3) {
      // (fast)
      return true; // vertex positions are the same
    } else if (matchCount === 2) {
      // (somewhat fast)
      // The non-matching points need to be on opposite sides of the edge to not overlap
      const edgeP1 = aMatches ? this.a : this.b; // if not a, it must be BC
      const edgeP2 = cMatches ? this.c : this.b; // if not c, it must be AB
      const point1 = !aMatches ? this.a : !bMatches ? this.b : this.c; // the one that doesn't match
      let point2 = otherTriangle.a;
      if (!aMatchesB && !bMatchesB && !cMatchesB) {
        point2 = otherTriangle.b;
      } else if (!aMatchesC && !bMatchesC && !cMatchesC) {
        point2 = otherTriangle.c;
      }

      // Linear equation to test which side of the line each point is on. Negative result is one side, positive is the other side
      const side1 = TriangleUv.isCounterClockwise(point1.u, point1.v, edgeP1.u, edgeP1.v, edgeP2.u, edgeP2.v);
      const side2 = TriangleUv.isCounterClockwise(point2.u, point2.v, edgeP1.u, edgeP1.v, edgeP2.u, edgeP2.v);

      // If both sides are the same (positive * positive) or (negative * negative), the value will be > 0
      if (side1 == side2) {
        return true;
      } else {
        return false; // not overlapping
      }
    } else if (matchCount === 1) {
      // (somewhat slow)
      const commonPoint = aMatches ? this.a : bMatches ? this.b : this.c;
      const point1 = !aMatches ? this.a : this.b; // if a is the common point, points are [b and c]
      const point2 = !cMatches ? this.c : this.b; // if c is the common point, points are [a and b]
      // start with the assumption that other C is the common point, so check [a and b]
      let otherPoint1 = otherTriangle.a;
      let otherPoint2 = otherTriangle.b;
      if (aMatchesA || bMatchesA || cMatchesA) {
        // A is the common point, so check [b and c]
        otherPoint1 = otherTriangle.b;
        otherPoint2 = otherTriangle.c;
      } else if (aMatchesB || bMatchesB || cMatchesB) {
        // B is the common point, so check [a and c]
        otherPoint1 = otherTriangle.a;
        otherPoint2 = otherTriangle.c;
      } else {
        // C is the common point, so check [a and b] (defaults)
      }

      // 4a. Check if either point is inside the other triangle
      if (
        this.vertexInside(otherPoint1) ||
        this.vertexInside(otherPoint2) ||
        otherTriangle.vertexInside(point1) ||
        otherTriangle.vertexInside(point2)
      ) {
        return true;
      }

      // 4b. Check for edge intersections
      // For each triangle, check the edge with the non-shared vertex against the two edges that are shared
      if (
        TriangleUv.edgesIntersect(commonPoint, otherPoint1, point1, point2) ||
        TriangleUv.edgesIntersect(commonPoint, otherPoint2, point1, point2) ||
        TriangleUv.edgesIntersect(commonPoint, point1, otherPoint1, otherPoint2) ||
        TriangleUv.edgesIntersect(commonPoint, point2, otherPoint1, otherPoint2)
      ) {
        return true;
      }
      return false; // not overlapping
    }

    // Step 5 - check if any of the 3 vertices are inside the other (same as 4a, but with 6 checks)
    if (
      this.vertexInside(otherTriangle.a) ||
      this.vertexInside(otherTriangle.b) ||
      this.vertexInside(otherTriangle.c) ||
      otherTriangle.vertexInside(this.a) ||
      otherTriangle.vertexInside(this.b) ||
      otherTriangle.vertexInside(this.c)
    ) {
      return true;
    }

    // Step 6 - check for edge intersects (same as 4b, but with 9 checks)
    if (
      TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.a, otherTriangle.b) ||
      TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.a, otherTriangle.b) ||
      TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.a, otherTriangle.b) ||
      TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.b, otherTriangle.c) ||
      TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.b, otherTriangle.c) ||
      TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.b, otherTriangle.c) ||
      TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.c, otherTriangle.a) ||
      TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.c, otherTriangle.a) ||
      TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.c, otherTriangle.a)
    ) {
      return true;
    }
    return false; // make it here without finding an overlap
  }

  // Check if a vertex is inside this triangle
  public vertexInside(point: VertexUvInterface): boolean {
    return this.pointInside(point.u, point.v);
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Compute the UV area using Heron's formula
  private calculateArea() {
    // Note: units are a percentage of the 0-1 UV area. They get converted to pixels per meter later
    // V2: if the image texture dimensions were available here, this could be pixels per UV space
    const uvA = new Vector2(this.a.u, this.a.v);
    const uvB = new Vector2(this.b.u, this.b.v);
    const uvC = new Vector2(this.c.u, this.c.v);
    const uvAB = Vector2.Distance(uvA, uvB);
    const uvAC = Vector2.Distance(uvA, uvC);
    const uvBC = Vector2.Distance(uvB, uvC);
    const uvHalfPerimeter = (uvAB + uvBC + uvAC) / 2;
    this.area = Math.sqrt(
      uvHalfPerimeter * (uvHalfPerimeter - uvAB) * (uvHalfPerimeter - uvBC) * (uvHalfPerimeter - uvAC),
    );
  }

  // Check inversion based on winding direction
  private calculateInverted() {
    // https://stackoverflow.com/questions/17592800/how-to-find-the-orientation-of-three-points-in-a-two-dimensional-space-given-coo
    this.inverted = TriangleUv.isCounterClockwise(this.a.u, this.a.v, this.b.u, this.b.v, this.c.u, this.c.v);
  }

  // Check if two edges intersect, based on 2 points each
  private static edgesIntersect(
    p1: VertexUvInterface,
    p2: VertexUvInterface,
    q1: VertexUvInterface,
    q2: VertexUvInterface,
  ) {
    //https://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
    return (
      TriangleUv.isCounterClockwise(p1.u, p1.v, q1.u, q1.v, q2.u, q2.v) !=
        TriangleUv.isCounterClockwise(p2.u, p2.v, q1.u, q1.v, q2.u, q2.v) &&
      TriangleUv.isCounterClockwise(p1.u, p1.v, p2.u, p2.v, q1.u, q1.v) !=
        TriangleUv.isCounterClockwise(p1.u, p1.v, p2.u, p2.v, q2.u, q2.v)
    );
  }

  // Checks if the winding direction is counter clockwise
  private static isCounterClockwise(p1u: number, p1v: number, p2u: number, p2v: number, p3u: number, p3v: number) {
    return (p3v - p1v) * (p2u - p1u) > (p2v - p1v) * (p3u - p1u);
  }

  // Get the min/max UV values, which is later used to check if all triangles are in the 0-1 range
  private loadMinMax() {
    this.maxU = Math.max(this.a.u, this.b.u, this.c.u);
    this.maxV = Math.max(this.a.v, this.b.v, this.c.v);
    this.minU = Math.min(this.a.u, this.b.u, this.c.u);
    this.minV = Math.min(this.a.v, this.b.v, this.c.v);
  }

  // Check if a point is inside this triangle
  private pointInside(u: number, v: number): boolean {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // https://www.gamedev.net/forums/topic.asp?topic_id=295943
    const b1 = TriangleUv.isCounterClockwise(u, v, this.a.u, this.a.v, this.b.u, this.b.v);
    const b2 = TriangleUv.isCounterClockwise(u, v, this.b.u, this.b.v, this.c.u, this.c.v);
    const b3 = TriangleUv.isCounterClockwise(u, v, this.c.u, this.c.v, this.a.u, this.a.v);
    return b1 == b2 && b2 == b3;
  }
}
