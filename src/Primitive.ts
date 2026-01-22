import EdgeUv, { EdgeUvInterface } from './EdgeUv.js';
import EdgeXyz, { EdgeXyzInterface } from './EdgeXyz.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import TriangleUv, { TriangleUvInterface } from './TriangleUv.js';
import TriangleXyz, { TriangleXyzInterface } from './TriangleXyz.js';
import { UV, UVInterface } from './UV.js';
import VertexUv, { VertexUvInterface } from './VertexUv.js';
import VertexXyz, { VertexXyzInterface } from './VertexXyz.js';
import { AbstractMesh } from '@babylonjs/core';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';

export interface PrimitiveInterface {
  checksRequireUvIndices: boolean;
  checksRequireXyzIndices: boolean;
  densityMax: LoadableAttributeInterface<number>;
  densityMin: LoadableAttributeInterface<number>;
  edgesUv: EdgeUvInterface[];
  edgesXyz: EdgeXyzInterface[];
  hardEdgeCount: number;
  mesh: AbstractMesh;
  name: string;
  nonManifoldEdgeCount: number;
  trianglesUv: TriangleUvInterface[];
  trianglesXyz: TriangleXyzInterface[];
  uv: UVInterface;
  verticesUv: VertexUvInterface[];
  verticesXyz: VertexXyzInterface[];
}

// A primitive is a mesh with a single material and UV map
export class Primitive implements PrimitiveInterface {
  checksRequireUvIndices = false;
  checksRequireXyzIndices = false;
  densityMax = new LoadableAttribute('Highest pixel density', 0);
  densityMin = new LoadableAttribute('Lowest pixel density', 0);
  edgesUv = [] as EdgeUvInterface[];
  edgesXyz = [] as EdgeXyzInterface[];
  hardEdgeCount = 0;
  mesh = null as unknown as AbstractMesh;
  name = '';
  nonManifoldEdgeCount = 0;
  trianglesUv = [] as TriangleUvInterface[];
  trianglesXyz = [] as TriangleXyzInterface[];
  uv = null as unknown as UVInterface;
  verticesUv = [] as VertexUvInterface[];
  verticesXyz = [] as VertexXyzInterface[];

  constructor(mesh: AbstractMesh, checksRequireUvIndices: boolean, checksRequireXyzIndices: boolean) {
    // If not running tests that need UV or XYZ triangle groups, skip generating them because they are slow
    this.checksRequireUvIndices = checksRequireUvIndices;
    this.checksRequireXyzIndices = checksRequireXyzIndices;
    this.mesh = mesh;
    this.name = mesh.name;

    // Copy binary data to internal representation
    this.loadDataFromMesh(mesh);

    if (checksRequireXyzIndices) {
      // Edges are only available when indices have been pre-computed
      this.calculateEdgeAttributes();
    }
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Hard and Non-Manifold edge counts computed for each edge
  private calculateEdgeAttributes = () => {
    this.edgesXyz.forEach(edge => {
      edge.calculateAttributes();
      if (edge.nonManifold !== undefined && edge.nonManifold) {
        this.nonManifoldEdgeCount++;
      }
      if (edge.faceAngleInRadians !== undefined && edge.faceAngleInRadians >= Math.PI / 2) {
        this.hardEdgeCount++;
      }
    });
  };

  // Extracts the vertices (XYZ and UV) from a Babylon mesh. Matches them to indices if needed.
  private loadDataFromMesh = (mesh: AbstractMesh) => {
    const faceIndices = mesh.getIndices();

    if (faceIndices && faceIndices.length > 0) {
      let densityMax = undefined as unknown as number;
      let densityMin = undefined as unknown as number;
      const uvData = mesh.getVerticesData(VertexBuffer.UVKind);
      const xyzData = mesh.getVerticesData(VertexBuffer.PositionKind);

      for (let i = 0; i < faceIndices.length; i = i + 3) {
        // Face = 3 vertices (a,b,c)
        const indexA = faceIndices[i];
        const indexB = faceIndices[i + 1];
        const indexC = faceIndices[i + 2];

        // 3D Points (very similar to 2D uv point loading, below)
        if (xyzData) {
          let vertexA = new VertexXyz(xyzData[indexA * 3], xyzData[indexA * 3 + 1], xyzData[indexA * 3 + 2]);
          let vertexB = new VertexXyz(xyzData[indexB * 3], xyzData[indexB * 3 + 1], xyzData[indexB * 3 + 2]);
          let vertexC = new VertexXyz(xyzData[indexC * 3], xyzData[indexC * 3 + 1], xyzData[indexC * 3 + 2]);

          // The glTF 2.0 format does not share vertices between triangles
          // https://github.com/KhronosGroup/glTF/issues/1362
          // The position data is copied to a new location in the binary data
          // XYZ vertices and edges are different from UV vertices and edges
          // To audit certain features, such as Hard Edges and Non-Manifold Edges, XYZ vertex indices need to be computed
          // WARNING: This can get really slow with a lot of vertices, which is why it is only runs if checksRequireXyzIndices
          if (this.checksRequireXyzIndices) {
            if (this.verticesXyz.length === 0) {
              // first set of vertices to add
              let index = 0;
              vertexA.index = index; // 0
              this.verticesXyz.push(vertexA);
              if (vertexB.checkForMatch(vertexA)) {
                // In the rare case that the vertices match, keep the index at 0
                // do nothing
              } else {
                index++; // 1
              }
              vertexB.index = index;
              this.verticesXyz.push(vertexB);
              if (vertexC.checkForMatch(vertexA)) {
                index = 0; // A is always index 0
              } else if (vertexC.checkForMatch(vertexB)) {
                // B index is either 0 or 1 and it should stay the same for C
                // do nothing
              } else {
                index++; // 2 (or 1 if A == B)
              }
              vertexC.index = index;
              this.verticesXyz.push(vertexC);
            } else {
              // search all existing vertices for duplicates O(n * log(n))
              for (let i = 0; i < this.verticesXyz.length; i++) {
                if (vertexA.index === undefined && this.verticesXyz[i].checkForMatch(vertexA)) {
                  vertexA = this.verticesXyz[i];
                }
                if (vertexB.index === undefined && this.verticesXyz[i].checkForMatch(vertexB)) {
                  vertexB = this.verticesXyz[i];
                }
                if (vertexC.index === undefined && this.verticesXyz[i].checkForMatch(vertexC)) {
                  vertexC = this.verticesXyz[i];
                }
              }
              let nextIndex = this.verticesXyz.length;
              if (vertexA.index === undefined) {
                vertexA.index = nextIndex;
                this.verticesXyz.push(vertexA);
                nextIndex++;
              }
              if (vertexB.index === undefined) {
                vertexB.index = nextIndex;
                this.verticesXyz.push(vertexB);
                nextIndex++;
              }
              if (vertexC.index === undefined) {
                vertexC.index = nextIndex;
                this.verticesXyz.push(vertexC);
              }
            }
          }

          // Create a 3D triangle object (vertices may or may not have indices)
          const triangle = new TriangleXyz(vertexA, vertexB, vertexC);
          this.trianglesXyz.push(triangle);

          // Indices are needed for edges
          if (this.checksRequireXyzIndices) {
            // Edges
            let edgeAB = new EdgeXyz(vertexA, vertexB);
            let edgeBC = new EdgeXyz(vertexB, vertexC);
            let edgeCA = new EdgeXyz(vertexC, vertexA);

            // Only record edges once
            if (this.edgesXyz.length === 0) {
              // The first set of edges
              let index = 0;
              edgeAB.index = index; // 0
              this.edgesXyz.push(edgeAB);
              if (edgeBC.checkForMatch(edgeAB)) {
                // In the rare case that the edges match, keep the index at 0
                // do nothing
              } else {
                index++; // 1
              }
              edgeBC.index = index;
              this.edgesXyz.push(edgeBC);
              if (edgeCA.checkForMatch(edgeAB)) {
                index = 0; // AB is always index 0
              } else if (edgeCA.checkForMatch(edgeBC)) {
                // BC index is either 0 or 1 and it should stay the same for CA
                // do nothing
              } else {
                index++; // 2 (or 1 if AB == BC)
              }
              edgeCA.index = index;
              this.edgesXyz.push(edgeCA);
            } else {
              // search all existing edges for duplicates O(n * log(n))
              for (let i = 0; i < this.edgesXyz.length; i++) {
                if (edgeAB.index === undefined && this.edgesXyz[i].checkForMatch(edgeAB)) {
                  edgeAB = this.edgesXyz[i];
                }
                if (edgeBC.index === undefined && this.edgesXyz[i].checkForMatch(edgeBC)) {
                  edgeBC = this.edgesXyz[i];
                }
                if (edgeCA.index === undefined && this.edgesXyz[i].checkForMatch(edgeCA)) {
                  edgeCA = this.edgesXyz[i];
                }
              }

              let nextIndex = this.edgesXyz.length;
              if (edgeAB.index === undefined) {
                edgeAB.index = nextIndex;
                this.edgesXyz.push(edgeAB);
                nextIndex++;
              }
              if (edgeBC.index === undefined) {
                edgeBC.index = nextIndex;
                this.edgesXyz.push(edgeBC);
                nextIndex++;
              }
              if (edgeCA.index === undefined) {
                edgeCA.index = nextIndex;
                this.edgesXyz.push(edgeCA);
              }
            }

            // Link the triangle to the edges (used to compute angle and if manifold)
            edgeAB.triangles.push(triangle);
            edgeBC.triangles.push(triangle);
            edgeCA.triangles.push(triangle);
          }
        }

        // 2D Points (very similar to 3D xyz point loading, above)
        if (uvData) {
          let vertexA = new VertexUv(uvData[indexA * 2], uvData[indexA * 2 + 1]);
          let vertexB = new VertexUv(uvData[indexB * 2], uvData[indexB * 2 + 1]);
          let vertexC = new VertexUv(uvData[indexC * 2], uvData[indexC * 2 + 1]);

          // The glTF 2.0 format does not share vertices between triangles
          // https://github.com/KhronosGroup/glTF/issues/1362
          // The position data is copied to a new location in the binary data
          // UV vertices and edges are different from XYZ vertices and edges
          // To validate certain features, such as overlapping UVs or UV gutter size, UV vertex indices need to be computed
          // WARNING: This can get really slow with a lot of vertices, which is why it is only runs if checksRequireUvIndices

          if (this.checksRequireUvIndices) {
            if (this.verticesUv.length === 0) {
              // Add the first set of vertices
              let index = 0;
              vertexA.setIndex(index);
              this.verticesUv.push(vertexA);
              if (vertexB.checkForMatch(vertexA)) {
                // In the rare case that the vertices match, keep the index at 0
                // do nothing
              } else {
                index++; // 1
              }
              vertexB.setIndex(index);
              this.verticesUv.push(vertexB);
              if (vertexC.checkForMatch(vertexA)) {
                index = 0; // A is always index 0
              } else if (vertexC.checkForMatch(vertexB)) {
                // B index is either 0 or 1 and it should stay the same for C
                // do nothing
              } else {
                index++; // 2 (or 1 if A == B)
              }
              vertexC.setIndex(index);
              this.verticesUv.push(vertexC);
            } else {
              // search all existing vertices for duplicates O(n * log(n))
              for (let i = 0; i < this.verticesUv.length; i++) {
                if (vertexA.index === undefined && this.verticesUv[i].checkForMatch(vertexA)) {
                  vertexA = this.verticesUv[i];
                }
                if (vertexB.index === undefined && this.verticesUv[i].checkForMatch(vertexB)) {
                  vertexB = this.verticesUv[i];
                }
                if (vertexC.index === undefined && this.verticesUv[i].checkForMatch(vertexC)) {
                  vertexC = this.verticesUv[i];
                }
              }
              // Insert new vertices if they are unique
              let nextIndex = this.verticesUv.length;
              if (vertexA.index === undefined) {
                vertexA.setIndex(nextIndex);
                this.verticesUv.push(vertexA);
                nextIndex++;
              }
              if (vertexB.index === undefined) {
                vertexB.setIndex(nextIndex);
                this.verticesUv.push(vertexB);
                nextIndex++;
              }
              if (vertexC.index === undefined) {
                vertexC.setIndex(nextIndex);
                this.verticesUv.push(vertexC);
              }
            }
          }

          // Create a 2D triangle object (vertices may or may not have indices)
          const triangle = new TriangleUv(i / 3, vertexA, vertexB, vertexC);
          this.trianglesUv.push(triangle);

          // Link the triangle to the vertices (used for island computation)
          vertexA.triangles.push(triangle);
          vertexB.triangles.push(triangle);
          vertexC.triangles.push(triangle);

          if (this.checksRequireUvIndices) {
            let edgeAB = new EdgeUv(triangle.a, triangle.b);
            let edgeBC = new EdgeUv(triangle.b, triangle.c);
            let edgeCA = new EdgeUv(triangle.c, triangle.a);

            if (this.edgesUv.length === 0) {
              let index = 0;
              edgeAB.index = index; // AB is the first, so always index 0
              edgeAB.triangles.push(triangle);
              this.edgesUv.push(edgeAB);
              if (edgeBC.checkForMatch(edgeAB)) {
                // In the rare case that the edges match, keep the index at 0
                // do nothing
              } else {
                index++; // 1
              }
              edgeBC.index = index;
              edgeBC.triangles.push(triangle);
              this.edgesUv.push(edgeBC);
              if (edgeCA.checkForMatch(edgeAB)) {
                index = 0; // AB is always index 0
              } else if (edgeCA.checkForMatch(edgeBC)) {
                // BC index is either 0 or 1 and it should stay the same for CA
                // do nothing
              } else {
                index++; // 2 (or 1 if AB == BC)
              }
              edgeCA.index = index;
              edgeCA.triangles.push(triangle);
              this.edgesUv.push(edgeCA);
            } else {
              // search all existing edges for duplicates O(n * log(n))
              for (let i = 0; i < this.edgesUv.length; i++) {
                if (edgeAB.index === undefined && this.edgesUv[i].checkForMatch(edgeAB)) {
                  edgeAB = this.edgesUv[i];
                }
                if (edgeBC.index === undefined && this.edgesUv[i].checkForMatch(edgeBC)) {
                  edgeBC = this.edgesUv[i];
                }
                if (edgeCA.index === undefined && this.edgesUv[i].checkForMatch(edgeCA)) {
                  edgeCA = this.edgesUv[i];
                }
              }

              // Link the triangle to the edge
              edgeAB.triangles.push(triangle);
              edgeBC.triangles.push(triangle);
              edgeCA.triangles.push(triangle);

              let nextIndex = this.edgesUv.length;
              if (edgeAB.index === undefined) {
                edgeAB.index = nextIndex;
                this.edgesUv.push(edgeAB);
                nextIndex++;
              }
              if (edgeBC.index === undefined) {
                edgeBC.index = nextIndex;
                this.edgesUv.push(edgeBC);
                nextIndex++;
              }
              if (edgeCA.index === undefined) {
                edgeCA.index = nextIndex;
                this.edgesUv.push(edgeCA);
              }
            }

            // Link the edges to the vertices (not strictly needed, but may be useful in the future)
            vertexA.edges.push(edgeAB, edgeCA);
            vertexB.edges.push(edgeAB, edgeBC);
            vertexC.edges.push(edgeBC, edgeCA);
          }
        }
        if (xyzData && uvData) {
          // Calculate min/max density as 0-1 UV percentage per meter.
          // The pixel density depends on the texture resolution and is computed in Auditor.ts vs all image files.
          // V2: It would be preferable to compute pixels here using only images linked to this primitive's material
          const meshArea = this.trianglesXyz[this.trianglesXyz.length - 1].area;
          const uvArea = this.trianglesUv[this.trianglesUv.length - 1].area;
          const density = meshArea == 0 ? 0 : uvArea / meshArea;
          if (densityMax === undefined || density > densityMax) {
            densityMax = density;
          }
          if (densityMin === undefined || density < densityMin) {
            densityMin = density;
          }
        }
      }
      if (densityMax !== undefined) {
        this.densityMax.loadValue(densityMax);
      }
      if (densityMin !== undefined) {
        this.densityMin.loadValue(densityMin);
      }

      // Group UVs into islands for the purpose of margin testing
      // An island is a group of triangles that are connected by one or more vertices
      // A recursive process propagates the smallest vertex index across the entire island
      this.trianglesUv.forEach((triangle: TriangleUvInterface) => {
        triangle.calculateIslandIndex();
      });

      // Create the UV object. The triangles should already have island indices
      this.uv = new UV(mesh.name, this.trianglesUv, this.checksRequireUvIndices);
    }
  };
}
