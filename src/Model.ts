import Glb, { GlbInterface } from './Glb.js';
import { GltfBinInterface } from './GltfBin.js';
import { GltfJsonInterface, GltfJsonMeshInterface } from './GltfJson.js';
import {
  GltfValidatorReportInterface,
  GltfValidatorReportInfoInterface,
  GltfValidatorReportInfoResourceInterface,
} from './GltfValidatorReport.js';
import { Image, ImageInterface } from './Image.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { NodeTransform, NodeTransformInterface } from './NodeTransform.js';
import { Primitive, PrimitiveInterface } from './Primitive.js';
//@ts-ignore - there is no type info for gltf-validator, alternative is to create a .d.ts file with declare module 'gltf-validator';
import { validateBytes } from 'gltf-validator';
import { AbstractMesh } from '@babylonjs/core';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Logger } from '@babylonjs/core/Misc/logger.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { Scene } from '@babylonjs/core/scene.js';
import { AuditorInterface } from './Auditor.js';

export interface ModelInterface {
  auditor: AuditorInterface;
  colorValueMax: LoadableAttributeInterface;
  colorValueMin: LoadableAttributeInterface;
  fileSizeInKb: LoadableAttributeInterface;
  glb: GlbInterface;
  gltfValidatorReport: GltfValidatorReportInterface;
  hardEdgeCount: LoadableAttributeInterface;
  height: LoadableAttributeInterface;
  images: ImageInterface[];
  invertedTriangleCount: LoadableAttributeInterface;
  json: GltfJsonInterface;
  length: LoadableAttributeInterface;
  loaded: boolean;
  materialCount: LoadableAttributeInterface;
  maxUvDensity: LoadableAttributeInterface;
  meshCount: LoadableAttributeInterface;
  minUvDensity: LoadableAttributeInterface;
  overlappingUvCount: LoadableAttributeInterface;
  nodeCount: LoadableAttributeInterface;
  nonManifoldEdgeCount: LoadableAttributeInterface;
  primitives: PrimitiveInterface[];
  primitiveCount: LoadableAttributeInterface;
  rootNodeTransform: NodeTransformInterface;
  texturesMaxHeight: LoadableAttributeInterface;
  texturesMaxWidth: LoadableAttributeInterface;
  texturesMinHeight: LoadableAttributeInterface;
  texturesMinWidth: LoadableAttributeInterface;
  triangleCount: LoadableAttributeInterface;
  scene: Scene;
  u: {
    max: LoadableAttributeInterface;
    min: LoadableAttributeInterface;
  };
  v: {
    max: LoadableAttributeInterface;
    min: LoadableAttributeInterface;
  };
  width: LoadableAttributeInterface;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(files: File[]): Promise<void>;
  loadFromFileSystem(filepaths: string[]): Promise<void>;
  uvIsInRangeZeroToOne: () => boolean;
}

export class Model implements ModelInterface {
  auditor = null as unknown as AuditorInterface;
  colorValueMax = new LoadableAttribute('Max HSV color value', 0);
  colorValueMin = new LoadableAttribute('Min HSV color value', 0);
  fileSizeInKb = new LoadableAttribute('File size in Kb', 0);
  glb = null as unknown as GlbInterface;
  gltfValidatorReport = null as unknown as GltfValidatorReportInterface;
  hardEdgeCount = new LoadableAttribute('Hard Edges (angle > 90)', 0);
  height = new LoadableAttribute('Height in Meters', 0);
  images = [] as ImageInterface[];
  invertedTriangleCount = new LoadableAttribute('Inverted Faces', 0);
  json = null as unknown as GltfJsonInterface;
  length = new LoadableAttribute('Length in Meters', 0);
  loaded = false;
  materialCount = new LoadableAttribute('Material Count', 0);
  maxUvDensity = new LoadableAttribute('Max UV Density', 0);
  meshCount = new LoadableAttribute('Mesh Count', 0);
  minUvDensity = new LoadableAttribute('Min UV Density', 0);
  nonManifoldEdgeCount = new LoadableAttribute('Non-Manifold Edges', 0);
  nodeCount = new LoadableAttribute('Node Count', 0);
  overlappingUvCount = new LoadableAttribute('Overlapping UVs', 0);
  primitives = [] as PrimitiveInterface[];
  primitiveCount = new LoadableAttribute('Primitive Count', 0);
  rootNodeTransform = new NodeTransform();
  texturesMaxHeight = new LoadableAttribute('Max Texture Height', 0);
  texturesMaxWidth = new LoadableAttribute('Max Texture Width', 0);
  texturesMinHeight = new LoadableAttribute('Min Texture Height', 0);
  texturesMinWidth = new LoadableAttribute('Min Texture Width', 0);
  triangleCount = new LoadableAttribute('Triangle Count', 0);
  scene = null as unknown as Scene;
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };
  width = new LoadableAttribute('Width in Meters', 0);

  constructor(auditor: AuditorInterface) {
    // Link back to the parent for access to the schema
    this.auditor = auditor;

    // suppress NullEngine welcome message
    Logger.LogLevels = Logger.WarningLogLevel;
    // Initialize a Babylon scene with the Null Engine
    const engine = new NullEngine();
    this.scene = new Scene(engine);

    // The GLB gets populated either from Files[] in the browser or filePaths[] in Node.js
    this.glb = new Glb();
  }

  // Helper function to return all of the loaded attributes for the model that can be looped through
  public getAttributes() {
    return [
      this.fileSizeInKb,
      this.triangleCount,
      this.materialCount,
      this.meshCount,
      this.nodeCount,
      this.primitiveCount,
      this.hardEdgeCount,
      this.nonManifoldEdgeCount,
      this.texturesMaxHeight,
      this.texturesMinHeight,
      this.texturesMaxWidth,
      this.texturesMinWidth,
      this.colorValueMax,
      this.colorValueMin,
      this.length,
      this.width,
      this.height,
      this.rootNodeTransform.location.x,
      this.rootNodeTransform.location.y,
      this.rootNodeTransform.location.z,
      this.rootNodeTransform.rotation.x,
      this.rootNodeTransform.rotation.y,
      this.rootNodeTransform.rotation.z,
      this.rootNodeTransform.scale.x,
      this.rootNodeTransform.scale.y,
      this.rootNodeTransform.scale.z,
      this.u.max,
      this.u.min,
      this.v.max,
      this.v.min,
      this.maxUvDensity,
      this.minUvDensity,
      this.invertedTriangleCount,
      this.overlappingUvCount,
    ];
  }

  // (Browser) - Single glb file or multi-part gltf files that come from an <input type='file'> element
  public async loadFromFileInput(files: File[]): Promise<void> {
    try {
      let fileSize = 0;
      files.forEach(file => {
        fileSize += file.size;
      });
      if (fileSize === 0) {
        throw new Error('File size is zero');
      }
      this.fileSizeInKb.loadValue(Math.round(fileSize / 1024)); // bytes to Kb

      if (files.length === 1) {
        // Single .glb file
        await this.glb.initFromGlbFile(files[0]);
      } else {
        // gltf + bin + textures
        let gltfFile = null as unknown as File;
        files.forEach(file => {
          if (file.name.endsWith('gltf')) {
            gltfFile = file;
          }
        });
        if (!gltfFile) {
          throw new Error('One of the files needs to be a .gltf');
        }
        await this.glb.initFromGltfFiles(files);
      }

      // once the glb data has been loaded, calculate the model info
      await this.loadFromGlb(this.glb);
    } catch (err) {
      throw new Error('Error loading model: ' + (err as Error).message);
    }
  }

  // (Node.js) - Single glb file or multi-part gltf files paths that are loaded from the file system
  public async loadFromFileSystem(filePaths: string[]): Promise<void> {
    try {
      // Need to import promises this way to compile webpack
      // webpack.config.js also needs config.resolve.fallback.fs = false
      const { promises } = await import('fs');

      // Total up the size of all files
      let fileSize = 0;
      for (let i = 0; i < filePaths.length; i++) {
        const supportingFileStats = await promises.stat(filePaths[i]);
        fileSize += supportingFileStats.size;
      }
      if (fileSize === 0) {
        throw new Error('File size is zero');
      }
      this.fileSizeInKb.loadValue(Math.round(fileSize / 1024)); // bytes to Kb

      // Read the data
      if (filePaths.length === 1) {
        // Single file, .glb
        await this.glb.initFromGlbFilePath(filePaths[0]);
      } else {
        // Multi-file .gltf
        await this.glb.initFromGltfFilePaths(filePaths);
      }

      // once the glb data has been loaded, calculate the model info
      await this.loadFromGlb(this.glb);
    } catch (err) {
      throw new Error('Unable to load model from file system: ' + (err as Error).message);
    }
  }

  // Check that UV values are in the 0-1 range, which is desired for atlas textures
  public uvIsInRangeZeroToOne = () => {
    return (
      (this.u.max.value as number) <= 1 &&
      (this.u.min.value as number) >= 0 &&
      (this.v.max.value as number) <= 1 &&
      (this.v.min.value as number) >= 0
    );
  };

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Min/Max color values used to check the PBR range
  private calculateColorValues(images: ImageInterface[]) {
    let max = undefined as unknown as number;
    let min = undefined as unknown as number;
    images.forEach((image: ImageInterface) => {
      // Only test base color texture images
      // other types, such as metallic, do not apply
      if (image.usedForBaseColor) {
        if (max === undefined || image.maxValue > max) {
          max = image.maxValue;
        }
        if (min === undefined || image.minValue < min) {
          min = image.minValue;
        }
      }
    });
    if (max !== undefined) {
      this.colorValueMax.loadValue(max);
    }
    if (min !== undefined) {
      this.colorValueMin.loadValue(min);
    }
  }

  // The bounding box of the model
  private calculateDimensions(scene: Scene) {
    // Dimensions - from the __root__ node, get bounds of all child meshes
    if (scene.meshes.length > 0) {
      const { min, max } = scene.meshes[0].getHierarchyBoundingVectors();
      // Round to precision of 6
      this.height.loadValue(+(max.y - min.y).toFixed(6) as number);
      this.length.loadValue(+(max.x - min.x).toFixed(6) as number);
      this.width.loadValue(+(max.z - min.z).toFixed(6) as number);
    }
  }

  // Hard and Manifold edge detection (sum of all primitive values)
  private calculateEdgeValues(primitives: PrimitiveInterface[]) {
    let hardEdges = 0;
    let nonManifoldEdges = 0;
    this.primitives.forEach((primitive: PrimitiveInterface) => {
      hardEdges += primitive.hardEdgeCount;
      nonManifoldEdges += primitive.nonManifoldEdgeCount;
    });
    this.hardEdgeCount.loadValue(hardEdges);
    this.nonManifoldEdgeCount.loadValue(nonManifoldEdges);
  }

  // Get the UV Range, Inverted, Overlapping, Texel Density (sum of all primitive values)
  private calculateUvValues(primitives: PrimitiveInterface[]) {
    // 1. Find the min/max U and V values
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;

    // 2. Count the number of inverted UVs
    let invertedTriangleCount = 0;

    // 3. Count the number of overlapping UVs
    let overlappingUvCount = 0;

    // 4. Find the min/max texel density
    let densityMax = undefined as unknown as number;
    let densityMin = undefined as unknown as number;

    this.primitives.forEach((primitive: PrimitiveInterface) => {
      // 1.
      if (maxU === undefined || primitive.uv.u.max.value > maxU) {
        maxU = primitive.uv.u.max.value as number;
      }
      if (maxV === undefined || primitive.uv.v.max.value > maxV) {
        maxV = primitive.uv.v.max.value as number;
      }
      if (minU === undefined || primitive.uv.u.min.value < minU) {
        minU = primitive.uv.u.min.value as number;
      }
      if (minV === undefined || primitive.uv.v.min.value < minV) {
        minV = primitive.uv.v.min.value as number;
      }

      // 2.
      invertedTriangleCount += primitive.uv.invertedTriangleCount.value as number;

      // 3.
      overlappingUvCount += primitive.uv.overlapCount.value as number;

      // 4.
      if (densityMax === undefined || primitive.densityMax.value > densityMax) {
        densityMax = primitive.densityMax.value as number;
      }
      if (densityMin === undefined || primitive.densityMin.value < densityMin) {
        densityMin = primitive.densityMin.value as number;
      }
    });

    // 1.
    if (maxU !== undefined) {
      this.u.max.loadValue(maxU);
    }
    if (minU !== undefined) {
      this.u.min.loadValue(minU);
    }
    if (maxV !== undefined) {
      this.v.max.loadValue(maxV);
    }
    if (minV !== undefined) {
      this.v.min.loadValue(minV);
    }

    // 2.
    this.invertedTriangleCount.loadValue(invertedTriangleCount);

    // 3.
    this.overlappingUvCount.loadValue(overlappingUvCount);

    // 4.
    if (densityMax !== undefined) {
      this.maxUvDensity.loadValue(densityMax);
    }
    if (densityMin !== undefined) {
      this.minUvDensity.loadValue(densityMin);
    }
  }

  // Get the min and max dimensions from all of the images
  private getTextureSizes(reportInfo: GltfValidatorReportInfoInterface) {
    let maxHeight = 0;
    let minHeight = 0;
    let maxWidth = 0;
    let minWidth = 0;

    if (reportInfo.resources) {
      reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
        if (resource.image) {
          if (resource.image.height > maxHeight) {
            maxHeight = resource.image.height;
          }
          if (minHeight === 0 || resource.image.height < minHeight) {
            minHeight = resource.image.height;
          }
          if (resource.image.width > maxWidth) {
            maxWidth = resource.image.width;
          }
          if (minWidth === 0 || resource.image.width < minWidth) {
            minWidth = resource.image.width;
          }
        }
      });
    }
    return { maxHeight, minHeight, maxWidth, minWidth };
  }

  // Loads the binary data into Image objects using node-canvas. Note: NullEngine cannot load images.
  private async loadImagesFromBin(json: GltfJsonInterface, data: GltfBinInterface) {
    // Identify the baseColorTexture index mapping for the PBR color range test
    let baseColorTextureIndices = [] as number[];
    if (json.materials) {
      json.materials.forEach(material => {
        if (material.pbrMetallicRoughness) {
          if (material.pbrMetallicRoughness.baseColorTexture) {
            baseColorTextureIndices.push(material.pbrMetallicRoughness.baseColorTexture.index);
          }
        }
      });
    }
    // Look up the image source index from the texture array
    // Material -> TextureInfo (index) -> Texture (source) -> Image
    let baseColorTextureImageIndices = [] as number[];
    baseColorTextureIndices.forEach(index => {
      baseColorTextureImageIndices.push(json.textures[index].source);
    });
    if (json.images !== undefined) {
      // Note: can't use forEach because we need to await
      for (let i = 0; i < json.images.length; i++) {
        try {
          const imageJson = json.images[i];
          const image = new Image(imageJson);
          // If this index is in the list, flag it as a base color for the PBR color check
          image.usedForBaseColor = baseColorTextureImageIndices.includes(i);
          if (imageJson.bufferView) {
            const bufferView = json.bufferViews[imageJson.bufferView];
            const arrayBuffer = await data.readAsync(bufferView.byteOffset, bufferView.byteLength);
            if (typeof window === 'undefined') {
              // Node (can use Buffer)
              const buffer = Buffer.alloc(bufferView.byteLength, undefined, 'utf-8');
              const binaryData = new Uint8Array(arrayBuffer);
              for (let j = 0; j < buffer.length; j++) {
                buffer[j] = binaryData[j];
              }
              await image.init(buffer);
            } else {
              // Browser (cannot use Buffer and needs to construct a data uri)
              await image.initFromBrowser(arrayBuffer);
            }
            this.images.push(image);
          }
        } catch (err) {
          console.log('error creating image named: ' + json.images[i].name);
          console.log(err);
        }
      }
    }
  }

  // All file inputs get converted into GLB format so this single function can handle extracting that data into the model
  private async loadFromGlb(glb: GlbInterface) {
    if (!glb.loaded) {
      throw new Error('The model was not loaded properly');
    }

    // Running the glTF-Validator also populates some model information (triangle count, material count, texture sizes)
    await this.runGltfValidatorWithBytes(glb.getBytes());

    // Note: the file was previously loaded with GltfFileLoader to extract the JSON/bin
    // BUG: SceneLoader is not currently able to load a model with draco compression in the Node.js context
    // GltfFileLoader is able to read the file, but doesn't place the model into the scene
    // In a browser context, additional files are loaded for decompressing using XMLHttpRequest
    // https://forum.babylonjs.com/t/what-pluginextension-string-should-be-used-for-draco-compression-with-base64-data-in-sceneloader-appendasync/39074/2
    await SceneLoader.AppendAsync('', glb.getBase64String(), this.scene);

    // Loading / calculating values in separate functions to keep loadFromGlb easier to read
    await this.loadImagesFromBin(glb.json, glb.bin);
    this.calculateDimensions(this.scene);
    this.calculateColorValues(this.images); // needs to run after loadImagesFromBin
    this.loadObjectCountsFromJson(glb.json);
    this.loadRootNodeTransform(this.scene);
    this.loadPrimitives(this.scene);
    this.calculateEdgeValues(this.primitives);
    this.calculateUvValues(this.primitives);
    this.loaded = true;
  }

  // Creates a primitive object for each mesh in the scene
  private loadPrimitives(scene: Scene) {
    // Note: the schema should already be loaded, before the model, to know if slow computations need to be run
    scene.meshes.forEach((mesh: AbstractMesh) => {
      // exclude the auto-generated __root__ node and anything else with no vertices
      if (mesh.isVerticesDataPresent(VertexBuffer.PositionKind)) {
        this.primitives.push(
          new Primitive(mesh, this.auditor.schema.checksRequireUvIndices, this.auditor.schema.checksRequireXyzIndices),
        );
      }
    });
  }

  // Get the location, rotation, and scale of the root node
  private loadRootNodeTransform(scene: Scene) {
    if (scene.meshes.length <= 1) {
      //const rootNode = scene.meshes[0]; // <-- This is not the correct node
      // The top level __root__ node (scene.meshes[0]) is created by BabylonJS for coordinate system conversion (right hand to left hand)
      throw new Error('There are no objects in the scene');
    }
    const rootNode = scene.meshes[1]; // The first real object from the glTF file

    // location
    this.rootNodeTransform.location.x.loadValue(rootNode.position.x);
    this.rootNodeTransform.location.y.loadValue(rootNode.position.y);
    this.rootNodeTransform.location.z.loadValue(rootNode.position.z);
    // rotation
    if (rootNode.rotationQuaternion) {
      // glTF uses Quaternion rotations
      this.rootNodeTransform.rotation.x.loadValue(rootNode.rotationQuaternion.x);
      this.rootNodeTransform.rotation.y.loadValue(rootNode.rotationQuaternion.y);
      this.rootNodeTransform.rotation.z.loadValue(rootNode.rotationQuaternion.z);
    }
    // scale
    this.rootNodeTransform.scale.x.loadValue(rootNode.scaling.x);
    this.rootNodeTransform.scale.y.loadValue(rootNode.scaling.y);
    this.rootNodeTransform.scale.z.loadValue(rootNode.scaling.z);
  }

  // Get number of meshes, nodes, and primitives
  private loadObjectCountsFromJson(json: GltfJsonInterface) {
    this.meshCount.loadValue(json.meshes.length);
    this.nodeCount.loadValue(json.nodes.length);
    let primitiveCount = 0;
    json.meshes.forEach((mesh: GltfJsonMeshInterface) => {
      primitiveCount += mesh.primitives.length;
    });
    this.primitiveCount.loadValue(primitiveCount);
  }

  // Save a copy of the report and populate some values with the results
  private loadReportFromGltfValidator(report: GltfValidatorReportInterface) {
    // Keep a copy of the report
    this.gltfValidatorReport = report;
    // These values are available in the glTF validator,
    // so we might as well use them, although they could also be
    // pulled from the babylon scene and node-canvas
    this.triangleCount.loadValue(report.info.totalTriangleCount);
    this.materialCount.loadValue(report.info.materialCount);
    const textureSizes = this.getTextureSizes(report.info);
    this.texturesMaxHeight.loadValue(textureSizes.maxHeight);
    this.texturesMaxWidth.loadValue(textureSizes.maxWidth);
    this.texturesMinHeight.loadValue(textureSizes.minHeight);
    this.texturesMinWidth.loadValue(textureSizes.minWidth);
  }

  // Run the glTF-Validator using bytes from the GLB
  private async runGltfValidatorWithBytes(bytes: Uint8Array) {
    return new Promise<void>((resolve, reject) => {
      validateBytes(bytes)
        .then((report: GltfValidatorReportInterface) => {
          this.loadReportFromGltfValidator(report);
          resolve();
        })
        .catch((error: any) => {
          console.error('Validation failed: ', error);
          reject();
        });
    });
  }
}
