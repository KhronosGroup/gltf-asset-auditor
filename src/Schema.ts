import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { SchemaJSONInterface } from './SchemaJSON.js';

export interface SchemaInterface {
  checksRequireUvIndices: boolean; // UV Gutter Width, Overlapping UVs
  checksRequireXyzIndices: boolean; // Manifold Edges, Beveled Edges
  loaded: boolean;
  maxFileSizeInKb: LoadableAttributeInterface;
  maxHeight: LoadableAttributeInterface;
  maxLength: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  maxMeshCount: LoadableAttributeInterface;
  maxNodeCount: LoadableAttributeInterface;
  maxPixelsPerMeter: LoadableAttributeInterface;
  maxPrimitiveCount: LoadableAttributeInterface;
  maxTextureHeight: LoadableAttributeInterface;
  maxTextureWidth: LoadableAttributeInterface;
  maxTriangleCount: LoadableAttributeInterface;
  maxWidth: LoadableAttributeInterface;
  minFileSizeInKb: LoadableAttributeInterface;
  minHeight: LoadableAttributeInterface;
  minLength: LoadableAttributeInterface;
  minMaterialCount: LoadableAttributeInterface;
  minMeshCount: LoadableAttributeInterface;
  minNodeCount: LoadableAttributeInterface;
  minPixelsPerMeter: LoadableAttributeInterface;
  minPrimitiveCount: LoadableAttributeInterface;
  minTextureHeight: LoadableAttributeInterface;
  minTextureWidth: LoadableAttributeInterface;
  minWidth: LoadableAttributeInterface;
  pbrColorMax: LoadableAttributeInterface;
  pbrColorMin: LoadableAttributeInterface;
  percentToleranceHeight: LoadableAttributeInterface;
  percentToleranceLength: LoadableAttributeInterface;
  percentToleranceWidth: LoadableAttributeInterface;
  requireBeveledEdges: LoadableAttributeInterface;
  requireCleanRootNodeTransform: LoadableAttributeInterface;
  requireManifoldEdges: LoadableAttributeInterface;
  requireNotInvertedUVs: LoadableAttributeInterface;
  requireNotOverlappingUVs: LoadableAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: LoadableAttributeInterface;
  requireTextureDimensionsBeQuadratic: LoadableAttributeInterface;
  requireUVRangeZeroToOne: LoadableAttributeInterface;
  resolutionNeededForUvMargin: LoadableAttributeInterface;
  uvGutterWidth256: LoadableAttributeInterface;
  uvGutterWidth512: LoadableAttributeInterface;
  uvGutterWidth1024: LoadableAttributeInterface;
  uvGutterWidth2048: LoadableAttributeInterface;
  uvGutterWidth4096: LoadableAttributeInterface;
  version: LoadableAttributeInterface;
  getAttributes(): LoadableAttributeInterface[];
  getJsonObject(): SchemaJSONInterface;
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
  loadFromSchemaObject(obj: SchemaJSONInterface): void;
}

export class Schema implements SchemaInterface {
  checksRequireUvIndices = false;
  checksRequireXyzIndices = false;
  // The initial values will all be -1 / false to disable all tests. The schema will then enable each with the desired settings.
  loaded = false;
  maxFileSizeInKb = new LoadableAttribute('Max file size in Kb', -1);
  maxHeight = new LoadableAttribute('Max Height (z)', -1);
  maxLength = new LoadableAttribute('Max Length (y)', -1);
  maxMaterialCount = new LoadableAttribute('Max Material Count', -1);
  maxMeshCount = new LoadableAttribute('Max Mesh Count', -1);
  maxNodeCount = new LoadableAttribute('Max Node Count', -1);
  maxPixelsPerMeter = new LoadableAttribute('Max Pixels per Meter', -1);
  maxPrimitiveCount = new LoadableAttribute('Max Primitive Count', -1);
  maxTextureHeight = new LoadableAttribute('Max Texture Height', -1);
  maxTextureWidth = new LoadableAttribute('Max Texture Width', -1);
  maxTriangleCount = new LoadableAttribute('Max Triangle Count', -1);
  maxWidth = new LoadableAttribute('Max Width (x)', -1);
  minFileSizeInKb = new LoadableAttribute('Min file size in Kb', -1);
  minHeight = new LoadableAttribute('Min Height (z)', -1);
  minLength = new LoadableAttribute('Min Length (y)', -1);
  minMaterialCount = new LoadableAttribute('Min Material Count', -1);
  minMeshCount = new LoadableAttribute('Min Mesh Count', -1);
  minNodeCount = new LoadableAttribute('Min Node Count', -1);
  minPixelsPerMeter = new LoadableAttribute('Min Pixels per Meter', -1);
  minPrimitiveCount = new LoadableAttribute('Min Primitive Count', -1);
  minTextureHeight = new LoadableAttribute('Min Texture Height', -1);
  minTextureWidth = new LoadableAttribute('Min Texture Width', -1);
  minTriangleCount = new LoadableAttribute('Min Triangle Count', -1);
  minWidth = new LoadableAttribute('Min Width (x)', -1);
  pbrColorMax = new LoadableAttribute('Color max value is PBR safe', -1);
  pbrColorMin = new LoadableAttribute('Color min value is PBR safe', -1);
  percentToleranceHeight = new LoadableAttribute('Percent Tolerance Height (z)', 0);
  percentToleranceLength = new LoadableAttribute('Percent Tolerance Length (y)', 0);
  percentToleranceWidth = new LoadableAttribute('Percent Tolerance Width (x)', 0);
  requireBeveledEdges = new LoadableAttribute('Require Beveled Edges', false);
  requireManifoldEdges = new LoadableAttribute('Require Manifold Edges', false);
  requireNotInvertedUVs = new LoadableAttribute('No Inverted UVs', false);
  requireNotOverlappingUVs = new LoadableAttribute('No Overlapping UVs', false);
  requireTextureDimensionsBePowersOfTwo = new LoadableAttribute('Require Texture Dimensions be Powers of 2', false);
  requireTextureDimensionsBeQuadratic = new LoadableAttribute(
    'Require Texture Dimensions be Quadratic (height = width)',
    false,
  );
  requireCleanRootNodeTransform = new LoadableAttribute('Require Root Node Have a Clean Transform', false);
  requireUVRangeZeroToOne = new LoadableAttribute('Require UV range 0 to 1', false);
  resolutionNeededForUvMargin = new LoadableAttribute('UV Gutter Wide Enough', -1);
  uvGutterWidth256 = new LoadableAttribute('UV Gutter Width at 256', -1);
  uvGutterWidth512 = new LoadableAttribute('UV Gutter Width at 512', -1);
  uvGutterWidth1024 = new LoadableAttribute('UV Gutter Width at 1024', -1);
  uvGutterWidth2048 = new LoadableAttribute('UV Gutter Width at 2048', -1);
  uvGutterWidth4096 = new LoadableAttribute('UV Gutter Width at 4096', -1);
  version = new LoadableAttribute('Version', '1.0.2');

  // Helper function to return all of the loaded attributes for the schema that can be looped through
  getAttributes() {
    return [
      this.version,
      this.minFileSizeInKb,
      this.maxFileSizeInKb,
      this.maxMaterialCount,
      this.minMaterialCount,
      this.maxMeshCount,
      this.minMeshCount,
      this.maxNodeCount,
      this.maxPrimitiveCount,
      this.requireBeveledEdges,
      this.requireCleanRootNodeTransform,
      this.requireManifoldEdges,
      this.maxTriangleCount,
      this.minHeight,
      this.maxHeight,
      this.minLength,
      this.maxLength,
      this.minWidth,
      this.maxWidth,
      this.minTextureHeight,
      this.maxTextureHeight,
      this.minTextureWidth,
      this.maxTextureWidth,
      this.requireTextureDimensionsBePowersOfTwo,
      this.requireTextureDimensionsBeQuadratic,
      this.pbrColorMax,
      this.pbrColorMin,
      this.percentToleranceLength,
      this.percentToleranceWidth,
      this.percentToleranceHeight,
      this.requireUVRangeZeroToOne,
      this.maxPixelsPerMeter,
      this.minPixelsPerMeter,
      this.requireNotInvertedUVs,
      this.requireNotOverlappingUVs,
      this.resolutionNeededForUvMargin,
      this.uvGutterWidth256,
      this.uvGutterWidth512,
      this.uvGutterWidth1024,
      this.uvGutterWidth2048,
      this.uvGutterWidth4096,
    ];
  }

  public getJsonObject(): SchemaJSONInterface {
    let schema = {
      version: this.version.value as string,
      fileSizeInKb: {
        maximum: this.maxFileSizeInKb.value as number,
        minimum: this.minFileSizeInKb.value as number,
      },
      materials: {
        maximum: this.maxMaterialCount.value as number,
        minimum: this.minMaterialCount.value as number,
      },
      model: {
        objectCount: {
          nodes: {
            maximum: this.maxNodeCount.value as number,
            minimum: this.minNodeCount.value as number,
          },
          meshes: {
            maximum: this.maxMeshCount.value as number,
            minimum: this.minMeshCount.value as number,
          },
          primitives: {
            maximum: this.maxPrimitiveCount.value as number,
            minimum: this.minPrimitiveCount.value as number,
          },
        },
        requireBeveledEdges: this.requireBeveledEdges.value as boolean,
        requireCleanRootNodeTransform: this.requireCleanRootNodeTransform.value as boolean,
        requireManifoldEdges: this.requireManifoldEdges.value as boolean,
        triangles: {
          maximum: this.maxTriangleCount.value as number,
          minimum: this.minTriangleCount.value as number,
        },
      },
      product: {
        dimensions: {
          height: {
            maximum: this.maxHeight.value as number,
            minimum: this.minHeight.value as number,
            percentTolerance: this.percentToleranceHeight.value as number,
          },
          length: {
            maximum: this.maxLength.value as number,
            minimum: this.minLength.value as number,
            percentTolerance: this.percentToleranceLength.value as number,
          },
          width: {
            maximum: this.maxWidth.value as number,
            minimum: this.minWidth.value as number,
            percentTolerance: this.percentToleranceWidth.value as number,
          },
        },
      },
      textures: {
        height: {
          maximum: this.maxTextureHeight.value as number,
          minimum: this.minTextureHeight.value as number,
        },
        pbrColorRange: {
          maximum: this.pbrColorMax.value as number,
          minimum: this.pbrColorMin.value as number,
        },
        requireDimensionsBePowersOfTwo: this.requireTextureDimensionsBePowersOfTwo.value as boolean,
        requireDimensionsBeQuadratic: this.requireTextureDimensionsBeQuadratic.value as boolean,
        width: {
          maximum: this.maxTextureWidth.value as number,
          minimum: this.minTextureWidth.value as number,
        },
      },
      uvs: {
        gutterWidth: {
          resolution256: this.uvGutterWidth256.value as number,
          resolution512: this.uvGutterWidth512.value as number,
          resolution1024: this.uvGutterWidth1024.value as number,
          resolution2048: this.uvGutterWidth2048.value as number,
          resolution4096: this.uvGutterWidth4096.value as number,
        },
        pixelsPerMeter: {
          maximum: this.maxPixelsPerMeter.value as number,
          minimum: this.minPixelsPerMeter.value as number,
        },
        requireNotInverted: this.requireNotInvertedUVs.value as boolean,
        requireNotOverlapping: this.requireNotOverlappingUVs.value as boolean,
        requireRangeZeroToOne: this.requireUVRangeZeroToOne.value as boolean,
      },
    } as SchemaJSONInterface;
    return schema;
  }

  public getRecommended(): SchemaJSONInterface {
    return {
      version: this.version.value as string,
      fileSizeInKb: {
        maximum: 5120,
        minimum: 1,
      },
      materials: {
        maximum: 5,
        minimum: -1,
      },
      model: {
        objectCount: {
          nodes: {
            maximum: -1,
            minimum: -1,
          },
          meshes: {
            maximum: -1,
            minimum: -1,
          },
          primitives: {
            maximum: -1,
            minimum: -1,
          },
        },
        requireBeveledEdges: false,
        requireCleanRootNodeTransform: false,
        requireManifoldEdges: false,
        triangles: {
          maximum: 100000,
          minimum: -1,
        },
      },
      product: {
        dimensions: {
          height: {
            maximum: -1,
            minimum: -1,
            percentTolerance: 3,
          },
          length: {
            maximum: -1,
            minimum: -1,
            percentTolerance: 3,
          },
          width: {
            maximum: -1,
            minimum: -1,
            percentTolerance: 3,
          },
        },
      },
      textures: {
        height: {
          maximum: 2048,
          minimum: 512,
        },
        pbrColorRange: {
          maximum: 243,
          minimum: 30,
        },
        requireDimensionsBePowersOfTwo: true,
        requireDimensionsBeQuadratic: false,
        width: {
          maximum: 2048,
          minimum: 512,
        },
      },
      uvs: {
        gutterWidth: {
          resolution256: -1,
          resolution512: -1,
          resolution1024: -1,
          resolution2048: -1,
          resolution4096: -1,
        },
        pixelsPerMeter: {
          maximum: -1,
          minimum: -1,
        },
        requireNotInverted: true,
        requireNotOverlapping: false,
        requireRangeZeroToOne: false,
      },
    } as SchemaJSONInterface;
  }

  public loadFromSchemaObject(obj: SchemaJSONInterface) {
    // Required Attributes
    this.version.loadValue(obj.version);

    // Optional Attributes (default values will be used if not provided)
    if (obj.fileSizeInKb !== undefined) {
      if (obj.fileSizeInKb.maximum) {
        this.maxFileSizeInKb.loadValue(obj.fileSizeInKb.maximum);
      }
      if (obj.fileSizeInKb.minimum) {
        this.minFileSizeInKb.loadValue(obj.fileSizeInKb.minimum);
      }
    }
    if (obj.materials !== undefined) {
      if (obj.materials.maximum !== undefined) {
        this.maxMaterialCount.loadValue(obj.materials.maximum);
      }
      if (obj.materials.minimum !== undefined) {
        this.minMaterialCount.loadValue(obj.materials.minimum);
      }
    }
    if (obj.model !== undefined) {
      if (obj.model.objectCount !== undefined) {
        if (obj.model.objectCount.meshes !== undefined) {
          if (obj.model.objectCount.meshes.maximum !== undefined) {
            this.maxMeshCount.loadValue(obj.model.objectCount.meshes.maximum);
          }
          if (obj.model.objectCount.meshes.minimum !== undefined) {
            this.minMeshCount.loadValue(obj.model.objectCount.meshes.minimum);
          }
        }
        if (obj.model.objectCount.nodes !== undefined) {
          if (obj.model.objectCount.nodes.maximum !== undefined) {
            this.maxNodeCount.loadValue(obj.model.objectCount.nodes.maximum);
          }
          if (obj.model.objectCount.nodes.minimum !== undefined) {
            this.minNodeCount.loadValue(obj.model.objectCount.nodes.minimum);
          }
        }
        if (obj.model.objectCount.primitives !== undefined) {
          if (obj.model.objectCount.primitives.maximum !== undefined) {
            this.maxPrimitiveCount.loadValue(obj.model.objectCount.primitives.maximum);
          }
          if (obj.model.objectCount.primitives.minimum !== undefined) {
            this.minPrimitiveCount.loadValue(obj.model.objectCount.primitives.minimum);
          }
        }
      }
      if (obj.model.requireBeveledEdges !== undefined) {
        if (obj.model.requireBeveledEdges) {
          this.checksRequireXyzIndices = true; // indices are required to generate edges
        }
        this.requireBeveledEdges.loadValue(obj.model.requireBeveledEdges);
      }
      if (obj.model.requireCleanRootNodeTransform !== undefined) {
        this.requireCleanRootNodeTransform.loadValue(obj.model.requireCleanRootNodeTransform);
      }
      if (obj.model.requireManifoldEdges !== undefined) {
        if (obj.model.requireManifoldEdges) {
          this.checksRequireXyzIndices = true; // indices are required to generate edges
        }
        this.requireManifoldEdges.loadValue(obj.model.requireManifoldEdges);
      }
      if (obj.model.triangles !== undefined) {
        if (obj.model.triangles.maximum) {
          this.maxTriangleCount.loadValue(obj.model.triangles.maximum);
        }
        if (obj.model.triangles.minimum) {
          this.minTriangleCount.loadValue(obj.model.triangles.minimum);
        }
      }
    }
    if (obj.product !== undefined) {
      if (obj.product.dimensions !== undefined) {
        if (obj.product.dimensions.height !== undefined) {
          if (obj.product.dimensions.height.maximum !== undefined) {
            this.maxHeight.loadValue(obj.product.dimensions.height.maximum);
          }
          if (obj.product.dimensions.height.minimum !== undefined) {
            this.minHeight.loadValue(obj.product.dimensions.height.minimum);
          }
          if (obj.product.dimensions.height.percentTolerance !== undefined) {
            this.percentToleranceHeight.loadValue(obj.product.dimensions.height.percentTolerance);
          }
        }
        if (obj.product.dimensions.length !== undefined) {
          if (obj.product.dimensions.length.maximum !== undefined) {
            this.maxLength.loadValue(obj.product.dimensions.length.maximum);
          }
          if (obj.product.dimensions.length.minimum !== undefined) {
            this.minLength.loadValue(obj.product.dimensions.length.minimum);
          }
          if (obj.product.dimensions.length.percentTolerance !== undefined) {
            this.percentToleranceLength.loadValue(obj.product.dimensions.length.percentTolerance);
          }
        }
        if (obj.product.dimensions.width !== undefined) {
          if (obj.product.dimensions.width.maximum !== undefined) {
            this.maxWidth.loadValue(obj.product.dimensions.width.maximum);
          }
          if (obj.product.dimensions.width.minimum !== undefined) {
            this.minWidth.loadValue(obj.product.dimensions.width.minimum);
          }
          if (obj.product.dimensions.width.percentTolerance !== undefined) {
            this.percentToleranceWidth.loadValue(obj.product.dimensions.width.percentTolerance);
          }
        }
      }
    }
    if (obj.textures !== undefined) {
      if (obj.textures.height !== undefined) {
        if (obj.textures.height.maximum !== undefined) {
          this.maxTextureHeight.loadValue(obj.textures.height.maximum);
        }
        if (obj.textures.height.minimum !== undefined) {
          this.minTextureHeight.loadValue(obj.textures.height.minimum);
        }
      }
      if (obj.textures.pbrColorRange !== undefined) {
        if (obj.textures.pbrColorRange.maximum !== undefined) {
          this.pbrColorMax.loadValue(obj.textures.pbrColorRange.maximum);
        }
        if (obj.textures.pbrColorRange.minimum !== undefined) {
          this.pbrColorMin.loadValue(obj.textures.pbrColorRange.minimum);
        }
      }
      if (obj.textures.requireDimensionsBePowersOfTwo !== undefined) {
        this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.textures.requireDimensionsBePowersOfTwo);
      }
      if (obj.textures.requireDimensionsBeQuadratic !== undefined) {
        this.requireTextureDimensionsBeQuadratic.loadValue(obj.textures.requireDimensionsBeQuadratic);
      }
      if (obj.textures.width !== undefined) {
        if (obj.textures.width.maximum !== undefined) {
          this.maxTextureWidth.loadValue(obj.textures.width.maximum);
        }
        if (obj.textures.width.minimum !== undefined) {
          this.minTextureWidth.loadValue(obj.textures.width.minimum);
        }
      }
    }
    if (obj.uvs !== undefined) {
      if (obj.uvs.gutterWidth !== undefined) {
        let minResolutionNeeded = undefined as unknown as number;
        if (obj.uvs.gutterWidth.resolution256 !== undefined) {
          this.uvGutterWidth256.loadValue(obj.uvs.gutterWidth.resolution256);
          if (obj.uvs.gutterWidth.resolution256 > 0) {
            minResolutionNeeded = 256 / obj.uvs.gutterWidth.resolution256;
          }
        }
        if (obj.uvs.gutterWidth.resolution512 !== undefined) {
          this.uvGutterWidth512.loadValue(obj.uvs.gutterWidth.resolution512);
          if (obj.uvs.gutterWidth.resolution512 > 0) {
            const resolution = 512 / obj.uvs.gutterWidth.resolution512;
            if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
              minResolutionNeeded = resolution;
            }
          }
        }
        if (obj.uvs.gutterWidth.resolution1024 !== undefined) {
          this.uvGutterWidth1024.loadValue(obj.uvs.gutterWidth.resolution1024);
          if (obj.uvs.gutterWidth.resolution1024 > 0) {
            const resolution = 1024 / obj.uvs.gutterWidth.resolution1024;
            if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
              minResolutionNeeded = resolution;
            }
          }
        }
        if (obj.uvs.gutterWidth.resolution2048 !== undefined) {
          this.uvGutterWidth2048.loadValue(obj.uvs.gutterWidth.resolution2048);
          if (obj.uvs.gutterWidth.resolution2048 > 0) {
            const resolution = 2048 / obj.uvs.gutterWidth.resolution2048;
            if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
              minResolutionNeeded = resolution;
            }
          }
        }
        if (obj.uvs.gutterWidth.resolution4096 !== undefined) {
          this.uvGutterWidth4096.loadValue(obj.uvs.gutterWidth.resolution4096);
          if (obj.uvs.gutterWidth.resolution4096 > 0) {
            const resolution = 4096 / obj.uvs.gutterWidth.resolution4096;
            if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
              minResolutionNeeded = resolution;
            }
          }
        }
        if (minResolutionNeeded === undefined) {
          minResolutionNeeded = -1; // skip this test
        }
        if (minResolutionNeeded > 0) {
          this.checksRequireUvIndices = true; // indices are required for islands and overlap tests
        }
        this.resolutionNeededForUvMargin.loadValue(minResolutionNeeded);
      }
      if (obj.uvs.requireNotInverted !== undefined) {
        this.requireNotInvertedUVs.loadValue(obj.uvs.requireNotInverted);
      }
      if (obj.uvs.requireNotOverlapping !== undefined) {
        if (obj.uvs.requireNotOverlapping) {
          this.checksRequireUvIndices = true; // indices are required for islands and overlap tests
        }
        this.requireNotOverlappingUVs.loadValue(obj.uvs.requireNotOverlapping);
      }
      if (obj.uvs.pixelsPerMeter !== undefined) {
        if (obj.uvs.pixelsPerMeter?.maximum !== undefined) {
          this.maxPixelsPerMeter.loadValue(obj.uvs.pixelsPerMeter.maximum);
        }
        if (obj.uvs.pixelsPerMeter?.minimum !== undefined) {
          this.minPixelsPerMeter.loadValue(obj.uvs.pixelsPerMeter.minimum);
        }
      }
      if (obj.uvs.requireRangeZeroToOne !== undefined) {
        this.requireUVRangeZeroToOne.loadValue(obj.uvs.requireRangeZeroToOne);
      }
    }

    this.loaded = true;
  }

  // This version is for the browser and the file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    const loader = new Promise((resolve, reject) => {
      const fileReader = new FileReader(); // FileReader is not available in node.js
      fileReader.onload = async function () {
        const schemaText = fileReader.result as string;
        const schemaData = JSON.parse(schemaText) as SchemaJSONInterface;
        // FileReader is not async be default, so this wrapper is needed.
        resolve(schemaData);
      };
      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsText(file);
    });

    const schemaObj = (await loader) as SchemaJSONInterface;
    this.loadFromSchemaObject(schemaObj);
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    // Need to import promises this way to compile webpack
    // webpack.config.js also needs config.resolve.fallback.fs = false
    const { promises } = await import('fs');
    const schemaText = await promises.readFile(filepath, 'utf-8');
    const schemaObj = JSON.parse(schemaText) as SchemaJSONInterface;
    this.loadFromSchemaObject(schemaObj);
  }
}
