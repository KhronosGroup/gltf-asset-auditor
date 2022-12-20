import { TriangleUvInterface } from './TriangleUv';
import { VertexUvInterface } from './VertexUv';

export interface EdgeUvInterface {
  index: number;
  triangles: TriangleUvInterface[];
  vertexA: VertexUvInterface;
  vertexB: VertexUvInterface;
  zeroLength: boolean;
  checkForMatch(edge: EdgeUvInterface): boolean;
}

// A 2D line connecting two UV vertices
export default class EdgeUv implements EdgeUvInterface {
  index = undefined as unknown as number;
  triangles = [] as TriangleUvInterface[];
  vertexA = null as unknown as VertexUvInterface;
  vertexB = null as unknown as VertexUvInterface;
  zeroLength = false;

  constructor(a: VertexUvInterface, b: VertexUvInterface) {
    this.vertexA = a;
    this.vertexB = b;
    // if both vertices are in the same position, it has zero length
    // V2: Add zero length UV edges to the report
    this.zeroLength = this.vertexA.index === this.vertexB.index;
  }

  // Check if this edge matches another one, which is true if they have the same vertices
  public checkForMatch(edge: EdgeUvInterface): boolean {
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
