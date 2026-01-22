import { EdgeUvInterface } from './EdgeUv.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import SquareUv, { SquareUvInterface } from './SquareUv.js';
import { TriangleUvInterface } from './TriangleUv.js';
import UvIsland, { UvIslandInterface } from './UvIsland.js';
import { VertexUvInterface } from './VertexUv.js';

// Group min/max into a single object. Only used in this file for now.
interface MaxMinLoadableAttributeInterface {
  max: LoadableAttributeInterface<number>;
  min: LoadableAttributeInterface<number>;
}

export interface UVInterface {
  edges: EdgeUvInterface[];
  invertedTriangleCount: LoadableAttributeInterface<number>;
  islands: UvIslandInterface[];
  name: string;
  overlapCount: LoadableAttributeInterface<number>;
  triangles: TriangleUvInterface[];
  pixelGrid: SquareUvInterface[];
  u: MaxMinLoadableAttributeInterface;
  v: MaxMinLoadableAttributeInterface;
  vertices: VertexUvInterface[];
  isInRangeZeroToOne: () => boolean;
  hasEnoughMarginAtResolution: (resolution: number) => boolean;
}

// Data related to the UV map for a primitive
export class UV implements UVInterface {
  edges = [] as EdgeUvInterface[];
  invertedTriangleCount = new LoadableAttribute('Number of inverted triangles', 0);
  islands = [] as UvIslandInterface[];
  name = '';
  overlapCount = new LoadableAttribute('Number of overlapping triangles', 0);
  triangles = [] as TriangleUvInterface[];
  pixelGrid = [] as SquareUvInterface[];
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };
  vertices = [] as VertexUvInterface[];

  constructor(name: string, triangles: TriangleUvInterface[], uvIndicesAvailable: boolean) {
    this.name = name;
    this.triangles = triangles;

    this.calculateInvertedTriangleCount();
    this.calculateMaxMinExtents();
    if (uvIndicesAvailable) {
      // These functions depend upon the UV vertices having pre-computed indices, which is slow and only available when required
      this.calculateUvIslands(this.triangles);
      this.calculateOverlapCount();
    }
  }

  // Check that UV values are in the 0-1 range, which is desired for atlas textures
  public isInRangeZeroToOne = () => {
    return (
      (this.u.max.value as number) <= 1 &&
      (this.u.min.value as number) >= 0 &&
      (this.v.max.value as number) <= 1 &&
      (this.v.min.value as number) >= 0
    );
  };

  // Check the island margin for a given grid size
  public hasEnoughMarginAtResolution = (resolution: number): boolean => {
    // Quantize the UV area based on the given resolution in pixels.
    // If a pixel grid is overlapped more than once, there is a collision and therefore not enough margin
    // [+][+][+][+]
    // [+][+][+][+]
    // [+][+][+][+]
    // [+][+][+][+]
    if (resolution < 0) {
      // safety check that resolution is not negative
      return false;
    }
    this.pixelGrid = new Array(resolution * resolution);
    const pixelSize = 1 / resolution;
    for (let i = 0; i < this.pixelGrid.length; i++) {
      const row = Math.floor(i / resolution);
      const column = i % resolution;
      const uCenter = row * pixelSize + pixelSize / 2;
      const vCenter = column * pixelSize + pixelSize / 2;
      this.pixelGrid[i] = new SquareUv(uCenter, vCenter, pixelSize * 2);
      // Pixel size is 2x the grid spacing to catch cases where triangles are separated by a grid line
      // a---b
      // |[+]|
      // c---d

      // a---b
      // |[+]|+][+][+]
      // c---d+][+][+]
      //  [+][+][+][+]
      //  [+][+][+][+]

      // [+a---b+][+]
      // [+|[+]|+][+]
      // [+c---d+][+]
      // [+][+][+][+]

      // Without up-scaling, close triangles separated at a grid line boundary (such as 0.5) wouldn't be caught
      // +--+ | +--+
      // | /  |  \ |
      // |/   |   \|
      // +   0.5   +
    }

    // check each triangle for overlaps
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      // only check pixels within the triangle's min/max (+ margin)
      let gridXStart = Math.floor((triangle.minU - pixelSize / 2) * resolution);
      if (gridXStart < 0) {
        gridXStart = 0;
      }
      let gridXEnd = Math.ceil((triangle.maxU + pixelSize / 2) * resolution);
      if (gridXEnd > resolution) {
        gridXEnd = resolution;
      }
      let gridYStart = Math.floor((triangle.minV - pixelSize / 2) * resolution);
      if (gridYStart < 0) {
        gridYStart = 0;
      }
      let gridYEnd = Math.ceil((triangle.maxV + pixelSize / 2) * resolution);
      if (gridYEnd > resolution) {
        gridYEnd = resolution;
      }
      for (let i = gridXStart; i < gridXEnd; i++) {
        for (let j = gridYStart; j < gridYEnd; j++) {
          const index = i * resolution + j;
          const gridPixel = this.pixelGrid[index];
          if (gridPixel.overlapsTriangle(triangle)) {
            if (gridPixel.islandIndex === undefined) {
              gridPixel.islandIndex = triangle.islandIndex;
            } else if (gridPixel.islandIndex != triangle.islandIndex) {
              // A collision was found, no need to continue checking
              return false;
            }
          }
        }
      }
    });

    return true; // made it here without finding a collision
  };

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Add up all triangles that are inverted
  private calculateInvertedTriangleCount = () => {
    let invertedTriangles = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (triangle.inverted) {
        invertedTriangles++;
      }
    });
    this.invertedTriangleCount.loadValue(invertedTriangles);
  };

  // Find the min/max U and V values
  private calculateMaxMinExtents = () => {
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;

    // loop through all triangles and record the min and the max
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (maxU === undefined || triangle.maxU > maxU) {
        maxU = triangle.maxU;
      }
      if (maxV === undefined || triangle.maxV > maxV) {
        maxV = triangle.maxV;
      }
      if (minU === undefined || triangle.minU < minU) {
        minU = triangle.minU;
      }
      if (minV === undefined || triangle.minV < minV) {
        minV = triangle.minV;
      }
    });

    this.u.max.loadValue(maxU);
    this.v.max.loadValue(maxV);
    this.u.min.loadValue(minU);
    this.v.min.loadValue(minV);
  };

  // Test each triangle against each other looking for overlaps
  private calculateOverlapCount = () => {
    // This can be slow for large models. O(n*n)
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.triangles.forEach((triangleToCompare: TriangleUvInterface) => {
        if (triangle.overlapsTriangle(triangleToCompare)) {
          triangle.overlapping = true;
          triangleToCompare.overlapping = true;
        }
      });
    });
    let overlappingTrianglesCount = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (triangle.overlapping) {
        overlappingTrianglesCount++;
      }
    });
    this.overlapCount.loadValue(overlappingTrianglesCount);
  };

  // Group triangles into UV islands (with the island indices already known)
  private calculateUvIslands = (triangles: TriangleUvInterface[]) => {
    triangles.forEach((triangle: TriangleUvInterface) => {
      let existingIsland = false;
      this.islands.forEach((island: UvIslandInterface) => {
        if (island.index === triangle.islandIndex) {
          existingIsland = true;
          island.triangles.push(triangle);
        }
      });
      if (!existingIsland) {
        this.islands.push(new UvIsland(triangle));
      }
    });
  };
}
