// Note: these interfaces are not exhaustive and generally only cover the
// attributes that are needed by the asset validator
// Full Schema: https://github.com/KhronosGroup/glTF/tree/main/specification/2.0/schema

export interface GltfJsonBufferInterface {
  byteLength: number;
  uri?: string;
}

export interface GltfJsonBufferViewInterface {
  buffer: number;
  byteLength: number;
  byteOffset: number;
}

export interface GltfJsonImageInterface {
  bufferView?: number;
  mimeType: string;
  name: string;
  uri?: string;
}

export interface GltfJsonMaterialInterface {
  alphaCutoff: number;
  alphaMode: string;
  doubleSided: boolean;
  emissiveFactor: [number, number, number];
  emissiveTexture: GltfJsonTextureInfoInterface;
  extensions: object;
  extras: object;
  name: string;
  normalTexture: object;
  occlusionTexture: object;
  pbrMetallicRoughness: GltfJsonPbrMetallicRoughnessInterface;
}

export interface GltfJsonMeshInterface {
  name: string;
  primitives: GltfJsonPrimitiveInterface[];
}

export interface GltfJsonPrimitiveInterface {
  indices: number;
  attributes: object;
  material: number;
}

export interface GltfJsonPbrMetallicRoughnessInterface {
  baseColorFactor: [number, number, number, number];
  baseColorTexture: GltfJsonTextureInfoInterface;
  metallicFactor: number;
  roughnessFactor: number;
  metallicRoughnessTexture: GltfJsonTextureInfoInterface;
}

export interface GltfJsonTextureInfoInterface {
  extensions: object;
  extras: object;
  index: number;
  texCoord: number;
}

export interface GltfJsonTextureInterface {
  extensions: object;
  extras: object;
  name: string;
  sampler: number;
  source: number;
}

// Top Level Interface
export interface GltfJsonInterface {
  accessors: object[];
  asset: {
    copyright: string;
    generator: string;
    version: string;
  };
  bufferViews: GltfJsonBufferViewInterface[];
  buffers: GltfJsonBufferInterface[];
  extensionsUsed: string[];
  images: GltfJsonImageInterface[];
  materials: GltfJsonMaterialInterface[];
  meshes: GltfJsonMeshInterface[];
  nodes: object[];
  samplers: object[];
  scene: number;
  scenes: object[];
  textures: GltfJsonTextureInterface[];
}
