// This is the format for specifying a requirements schema. All values except version are optional.
export interface SchemaJSONInterface {
  version: string;
  fileSizeInKb?: {
    maximum?: number;
    minimum?: number;
  };
  materials?: {
    maximum?: number;
    minimum?: number;
  };
  model?: {
    objectCount?: {
      nodes?: {
        maximum?: number;
        minimum?: number;
      };
      meshes?: {
        maximum?: number;
        minimum?: number;
      };
      primitives?: {
        maximum?: number;
        minimum?: number;
      };
    };
    requireBeveledEdges?: boolean;
    requireCleanRootNodeTransform?: boolean;
    requireManifoldEdges?: boolean;
    triangles?: {
      maximum?: number;
      minimum?: number;
    };
  };
  product?: {
    dimensions?: {
      height?: {
        maximum?: number;
        minimum?: number;
        percentTolerance?: number;
      };
      length?: {
        maximum?: number;
        minimum?: number;
        percentTolerance?: number;
      };
      width?: {
        maximum?: number;
        minimum?: number;
        percentTolerance?: number;
      };
    };
  };
  textures?: {
    height?: {
      maximum?: number;
      minimum?: number;
    };
    pbrColorRange?: {
      maximum?: number;
      minimum?: number;
    };
    requireDimensionsBePowersOfTwo?: boolean;
    requireDimensionsBeQuadratic?: boolean;
    width?: {
      maximum?: number;
      minimum?: number;
    };
  };
  uvs?: {
    gutterWidth?: {
      resolution256?: number;
      resolution512?: number;
      resolution1024?: number;
      resolution2048?: number;
      resolution4096?: number;
    };
    pixelsPerMeter?: {
      maximum?: number;
      minimum?: number;
    };
    requireNotInverted?: boolean;
    requireNotOverlapping?: boolean;
    requireRangeZeroToOne?: boolean;
  };
}
