import { float, Vector3 } from '@babylonjs/core';
import { TriangleXyzInterface } from './TriangleXyz';
import { VertexXyzInterface } from './VertexXyz';

export interface EdgeXyzInterface {
  faceAngleInRadians: float;
  index: number;
  nonManifold: boolean;
  triangles: TriangleXyzInterface[];
  vertexA: VertexXyzInterface;
  vertexB: VertexXyzInterface;
  calculateAttributes(): void;
  checkForMatch(edge: EdgeXyzInterface): boolean;
}

// A 3D line connecting two XYZ vertices
export default class EdgeXyz implements EdgeXyzInterface {
  faceAngleInRadians = undefined as unknown as number;
  index = undefined as unknown as number;
  nonManifold = undefined as unknown as boolean;
  triangles = [] as TriangleXyzInterface[];
  vertexA = null as unknown as VertexXyzInterface;
  vertexB = null as unknown as VertexXyzInterface;

  constructor(a: VertexXyzInterface, b: VertexXyzInterface) {
    this.vertexA = a;
    this.vertexB = b;
  }

  // Attributes that are calculated after all triangles are linked
  public calculateAttributes(): void {
    if (this.triangles.length === 2) {
      // Compute the angle between the normal vectors (used to check beveled edges vs hard edges)
      this.faceAngleInRadians = Vector3.GetAngleBetweenVectors(
        this.triangles[0].normal,
        this.triangles[1].normal,
        Vector3.Cross(this.triangles[0].normal, this.triangles[1].normal),
      );
      // Currently, having only 2 faces for the edge is enough to consider it manifold
      // Other factors to check for manifoldness (V2 update):
      // - Opposite facing normals
      // - Surfaces connected to one vertex
      // https://cgtyphoon.com/fundamentals/types-of-non-manifold-geometry/
      this.nonManifold = false;
    } else if (this.triangles.length === 1) {
      // Open Geometry (2-manifold with boundaries) - OK to have
      this.nonManifold = false;
    } else {
      // More than 2 faces can indicate these non-manifold conditions:
      // - T-type
      // - Internal Faces
      this.nonManifold = true;
    }
  }

  // Check if this edge matches another one, which is true if they have the same vertices
  public checkForMatch(edge: EdgeXyzInterface): boolean {
    // Treat AB and BA as equal by testing min/max of the index
    if (
      Math.min(this.vertexA.index, this.vertexB.index) === Math.min(edge.vertexA.index, edge.vertexB.index) &&
      Math.max(this.vertexA.index, this.vertexB.index) === Math.max(edge.vertexA.index, edge.vertexB.index)
    ) {
      return true;
    }
    return false;
  }
}
