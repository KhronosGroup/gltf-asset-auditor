import { Model, ModelInterface } from './Model.js';
import { PrimitiveInterface } from './Primitive.js';
import { ProductInfo, ProductInfoInterface } from './ProductInfo.js';
import { Report, ReportInterface } from './Report.js';
import { ReportJSON } from './ReportJSON.js';
import { Schema, SchemaInterface } from './Schema.js';

export interface AuditorInterface {
  decimalDisplayPrecision: number;
  model: ModelInterface;
  productInfo: ProductInfoInterface;
  report: ReportInterface;
  reportReady: boolean;
  schema: SchemaInterface;
  version: string;
  generateReport: () => void;
  getReportCsv: () => string;
  getReportJson: () => string;
}

export class Auditor implements AuditorInterface {
  decimalDisplayPrecision = 3; // Used for display only (not comparisons), can be changed before running generateReport()
  model = null as unknown as ModelInterface;
  productInfo = new ProductInfo(); // This is optional and can provide more specific per product auditing
  report = new Report();
  reportReady = false;
  schema = new Schema();
  version = '1.0.0';

  constructor() {
    // Model needs access to this.schema to know if indices need to be calculated or not
    // The schema should be loaded before the model, or the model re-loaded when the schema changes to require indices
    this.model = new Model(this);
  }

  // Run after loading the model and schema to create the report
  public generateReport() {
    if (!this.model.loaded) {
      throw new Error('Unable to generate report. No 3D model loaded.');
    }
    if (!this.schema.loaded) {
      throw new Error('Unable to generate report. No schema loaded.');
    }

    // Run the validator first
    this.testGltfValidator();
    // Run the rest of the tests, grouped into separate functions for legibility
    this.testFileSize();
    this.testMaterialCount();
    this.testTriangleCount();
    this.testTextures();
    this.testDimensions();
    this.testEdges();
    this.testObjectCount();
    this.testRootNodeTransform();
    this.testUVs();

    if (this.productInfo.loaded) {
      // Additional checks that require product information to be made available
      this.testProductDimensions();
    } else {
      this.report.productDimensionsWithinTolerance.skipTestWithMessage('No Product Info Loaded');
    }

    this.reportReady = true;
  }

  // Return the report items as a comma separated values string
  public getReportCsv(): string {
    return (
      '"Test Name","Result","Notes"\r\n' +
      this.report
        .getItems()
        .map(item => {
          return [
            item.name,
            item.tested ? (item.pass ? 'PASS' : 'FAIL') : 'NOT TESTED',
            item.message,
            item.componentMessage,
          ]
            .map(v => v.replaceAll('"', '""'))
            .map(v => `"${v}"`)
            .join(',');
        })
        .join('\r\n')
    );
  }

  // Return the report as a stringified JSON object
  public getReportJson(): string {
    // Check if the model passes overall by looking for any tests that failed
    let passing = this.report.getItems().every(item => {
      return item.tested === false || (item.tested === true && item.pass);
    });
    const reportJson = new ReportJSON(
      this.version,
      passing,
      this.model.gltfValidatorReport.issues.numErrors,
      this.model.gltfValidatorReport.issues.numWarnings,
      this.model.gltfValidatorReport.issues.numHints,
      this.model.gltfValidatorReport.issues.numInfos,
    );
    reportJson.fileSizeInKb = {
      pass: this.report.fileSize.pass,
      tested: this.report.fileSize.tested,
      value: this.model.fileSizeInKb.value as number,
    };
    reportJson.materialCount = {
      pass: this.report.materialCount.pass,
      tested: this.report.materialCount.tested,
      value: this.model.materialCount.value as number,
    };
    reportJson.model.objectCount.nodes = {
      pass: this.report.nodeCount.pass,
      tested: this.report.nodeCount.tested,
      value: this.model.nodeCount.value as number,
    };
    reportJson.model.objectCount.meshes = {
      pass: this.report.meshCount.pass,
      tested: this.report.meshCount.tested,
      value: this.model.meshCount.value as number,
    };
    reportJson.model.objectCount.primitives = {
      pass: this.report.primitiveCount.pass,
      tested: this.report.primitiveCount.tested,
      value: this.model.primitiveCount.value as number,
    };
    reportJson.model.requireBeveledEdges = {
      pass: this.report.requireBeveledEdges.pass,
      tested: this.report.requireBeveledEdges.tested,
    };
    reportJson.model.requireCleanRootNodeTransform = {
      pass: this.model.rootNodeTransform.isClean(),
      tested: this.report.rootNodeCleanTransform.tested,
    };
    reportJson.model.requireManifoldEdges = {
      pass: this.report.requireManifoldEdges.pass,
      tested: this.report.requireManifoldEdges.tested,
    };
    reportJson.model.triangles = {
      pass: this.report.triangleCount.pass,
      tested: this.report.triangleCount.tested,
      value: this.model.triangleCount.value as number,
    };
    reportJson.product.overallDimensions = {
      pass: this.report.overallDimensionsWithinTolerance.pass,
      tested: this.report.overallDimensionsWithinTolerance.tested,
      height: { value: this.model.height.value as number },
      length: { value: this.model.length.value as number },
      width: { value: this.model.width.value as number },
    };
    reportJson.product.productDimensions = {
      pass: this.report.productDimensionsWithinTolerance.pass,
      tested: this.report.productDimensionsWithinTolerance.tested,
      height: { value: this.model.height.value as number },
      length: { value: this.model.length.value as number },
      width: { value: this.model.width.value as number },
    };
    reportJson.textures.height = {
      maximum: {
        pass: this.report.textureDimensionsMaxHeight.pass,
        tested: this.report.textureDimensionsMaxHeight.tested,
        value: this.model.texturesMaxHeight.value as number,
      },
      minimum: {
        pass: this.report.textureDimensionsMinHeight.pass,
        tested: this.report.textureDimensionsMinHeight.tested,
        value: this.model.texturesMinHeight.value as number,
      },
    };
    reportJson.textures.pbrColorRange = {
      maximum: {
        pass: this.report.pbrColorMax.pass,
        tested: this.report.pbrColorMax.tested,
        value: this.model.colorValueMax.value as number,
      },
      minimum: {
        pass: this.report.pbrColorMin.pass,
        tested: this.report.pbrColorMin.tested,
        value: this.model.colorValueMin.value as number,
      },
    };
    reportJson.textures.requireDimensionsBePowersOfTwo = {
      pass: this.report.texturesPowerOfTwo.pass,
      tested: this.report.texturesPowerOfTwo.tested,
    };
    reportJson.textures.requireDimensionsBeQuadratic = {
      pass: this.report.texturesQuadratic.pass,
      tested: this.report.texturesQuadratic.tested,
    };
    reportJson.textures.width = {
      maximum: {
        pass: this.report.textureDimensionsMaxWidth.pass,
        tested: this.report.textureDimensionsMaxWidth.tested,
        value: this.model.texturesMaxWidth.value as number,
      },
      minimum: {
        pass: this.report.textureDimensionsMinWidth.pass,
        tested: this.report.textureDimensionsMinWidth.tested,
        value: this.model.texturesMinWidth.value as number,
      },
    };
    reportJson.uvs.gutterWidth = {
      pass: this.report.uvGutterWideEnough.pass,
      tested: this.report.uvGutterWideEnough.tested,
    };
    reportJson.uvs.pixelsPerMeter = {
      maximum: {
        pass: this.report.pixelsPerMeterMax.pass,
        tested: this.report.pixelsPerMeterMax.tested,
        value: this.model.maxUvDensity.value as number,
      },
      minimum: {
        pass: this.report.pixelsPerMeterMin.pass,
        tested: this.report.pixelsPerMeterMin.tested,
        value: this.model.minUvDensity.value as number,
      },
    };
    reportJson.uvs.requireNotInverted = {
      pass: this.report.uvsInverted.pass,
      tested: this.report.uvsInverted.tested,
    };
    reportJson.uvs.requireNotOverlapping = {
      pass: this.report.uvsOverlap.pass,
      tested: this.report.uvsOverlap.tested,
    };
    reportJson.uvs.requireRangeZeroToOne = {
      pass: this.report.uvsInZeroToOneRange.pass,
      tested: this.report.uvsInZeroToOneRange.tested,
    };
    return JSON.stringify(reportJson);
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Check that the model fits within viewer/application min/max dimensions
  private testDimensions() {
    let dimensionsMessage =
      '(L:' +
      (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
      ' x W:' +
      (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
      ' x H:' +
      (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
      ')';
    // Dimensions
    if (
      this.schema.maxHeight.value === -1 &&
      this.schema.maxLength.value === -1 &&
      this.schema.maxWidth.value === -1 &&
      this.schema.minHeight.value === -1 &&
      this.schema.minLength.value === -1 &&
      this.schema.minWidth.value === -1
    ) {
      this.report.overallDimensionsWithinTolerance.skipTestWithMessage(dimensionsMessage);
    } else {
      let dimensionsOK = true;
      let failingDimensions = [];
      if (this.schema.maxHeight.value !== -1) {
        if (this.model.height.value > this.schema.maxHeight.value) {
          dimensionsOK = false;
          failingDimensions.push('Height too big');
        }
      }
      if (this.schema.minHeight.value !== -1) {
        if (this.model.height.value < this.schema.minHeight.value) {
          dimensionsOK = false;
          failingDimensions.push('Height too small');
        }
      }
      if (this.schema.maxLength.value !== -1) {
        if (this.model.length.value > this.schema.maxLength.value) {
          dimensionsOK = false;
          failingDimensions.push('Length too big');
        }
      }
      if (this.schema.minLength.value !== -1) {
        if (this.model.length.value < this.schema.minLength.value) {
          dimensionsOK = false;
          failingDimensions.push('Length too small');
        }
      }
      if (this.schema.maxWidth.value !== -1) {
        if (this.model.width.value > this.schema.maxWidth.value) {
          dimensionsOK = false;
          failingDimensions.push('Width too big');
        }
      }
      if (this.schema.minWidth.value !== -1) {
        if (this.model.width.value < this.schema.minWidth.value) {
          dimensionsOK = false;
          failingDimensions.push('Width too small');
        }
      }
      this.report.overallDimensionsWithinTolerance.test(
        dimensionsOK,
        dimensionsMessage,
        dimensionsOK ? '' : failingDimensions.join('; '),
      );
    }
  }

  // Check if edges are Hard and/or non-manifold
  private testEdges() {
    if (this.schema.requireBeveledEdges.value === false) {
      this.report.requireBeveledEdges.skipTestWithMessage('Not Computed (slow)');
    } else {
      this.report.requireBeveledEdges.test(
        this.model.hardEdgeCount.value === 0,
        (this.model.hardEdgeCount.value as number).toLocaleString() + ' hard edges (>= 90 degrees)',
      );
    }
    if (this.schema.requireManifoldEdges.value === false) {
      this.report.requireManifoldEdges.skipTestWithMessage('Not Computed (slow)');
    } else {
      this.report.requireManifoldEdges.test(
        this.model.nonManifoldEdgeCount.value === 0,
        (this.model.nonManifoldEdgeCount.value as number).toLocaleString() + ' non-manifold edges',
      );
    }
  }

  // The file size should be within the specified range. Min and/or Max size can be ignored with a value of -1
  private testFileSize() {
    if (this.schema.maxFileSizeInKb.value === -1 && this.schema.minFileSizeInKb.value === -1) {
      // Skip test, but still report the file size
      this.report.fileSize.skipTestWithMessage(this.model.fileSizeInKb.value.toLocaleString() + 'kb');
    } else if (this.schema.maxFileSizeInKb.value === -1) {
      // Check only the min file size
      const fileSizeOK = (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number);
      let fileSizeComponentMessage = '';
      let fileSizeMessage =
        this.model.fileSizeInKb.value.toLocaleString() +
        'kb >= ' +
        this.schema.minFileSizeInKb.value.toLocaleString() +
        'kb';
      if (!fileSizeOK) {
        fileSizeComponentMessage = 'File too small';
        fileSizeMessage =
          this.model.fileSizeInKb.value.toLocaleString() +
          'kb < ' +
          this.schema.minFileSizeInKb.value.toLocaleString() +
          'kb';
      }
      this.report.fileSize.test(fileSizeOK, fileSizeMessage, fileSizeComponentMessage);
    } else if (this.schema.minFileSizeInKb.value === -1) {
      // Check only the max file size
      const fileSizeOK = (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
      let fileSizeComponentMessage = '';
      let fileSizeMessage =
        this.model.fileSizeInKb.value.toLocaleString() +
        'kb <= ' +
        this.schema.maxFileSizeInKb.value.toLocaleString() +
        'kb';
      if (!fileSizeOK) {
        fileSizeComponentMessage = 'File too large';
        fileSizeMessage =
          this.model.fileSizeInKb.value.toLocaleString() +
          'kb > ' +
          this.schema.maxFileSizeInKb.value.toLocaleString() +
          'kb';
      }
      this.report.fileSize.test(fileSizeOK, fileSizeMessage, fileSizeComponentMessage);
    } else {
      // Check that file size is within range (min-max)
      const fileSizeOK =
        // Greater than Min
        (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number) &&
        // Less than Max
        (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
      let fileSizeComponentMessage = '';
      let fileSizeMessage =
        this.schema.minFileSizeInKb.value.toLocaleString() +
        'kb <= ' +
        this.model.fileSizeInKb.value.toLocaleString() +
        'kb <= ' +
        this.schema.maxFileSizeInKb.value.toLocaleString() +
        'kb';
      if (!fileSizeOK) {
        if ((this.model.fileSizeInKb.value as number) < (this.schema.minFileSizeInKb.value as number)) {
          fileSizeComponentMessage = 'File too small';
          fileSizeMessage =
            this.model.fileSizeInKb.value.toLocaleString() +
            'kb < ' +
            this.schema.minFileSizeInKb.value.toLocaleString() +
            'kb';
        } else if ((this.model.fileSizeInKb.value as number) > (this.schema.maxFileSizeInKb.value as number)) {
          fileSizeComponentMessage = 'File too large';
          fileSizeMessage =
            this.model.fileSizeInKb.value.toLocaleString() +
            'kb > ' +
            this.schema.maxFileSizeInKb.value.toLocaleString() +
            'kb';
        }
      }
      this.report.fileSize.test(fileSizeOK, fileSizeMessage, fileSizeComponentMessage);
    }
  }

  // glTF validation is considered passed if there are no errors.
  private testGltfValidator() {
    if (this.model.gltfValidatorReport) {
      this.report.gltfValidator.test(
        this.model.gltfValidatorReport.issues.numErrors === 0,
        'Errors: ' +
          this.model.gltfValidatorReport.issues.numErrors +
          ', Warnings: ' +
          this.model.gltfValidatorReport.issues.numWarnings +
          ', Hints: ' +
          this.model.gltfValidatorReport.issues.numHints +
          ', Info: ' +
          this.model.gltfValidatorReport.issues.numInfos,
      );
    }
  }

  // The number of materials should be less than or equal to the max, unless the max is -1
  private testMaterialCount() {
    if (this.schema.maxMaterialCount.value === -1 && this.schema.minMaterialCount.value === -1) {
      // Skip the test, but still report the material count
      this.report.materialCount.skipTestWithMessage(this.model.materialCount.value.toLocaleString());
    } else if (this.schema.maxMaterialCount.value === -1) {
      // Check only the min material count
      const materialCountOK =
        (this.model.materialCount.value as number) >= (this.schema.minMaterialCount.value as number);
      const materialCountMessage =
        this.model.materialCount.value + (materialCountOK ? ' >= ' : ' < ') + this.schema.minMaterialCount.value;
      this.report.materialCount.test(materialCountOK, materialCountMessage);
    } else if (this.schema.minMaterialCount.value === -1) {
      // Check only the max material count
      const materialCountOK =
        (this.model.materialCount.value as number) <= (this.schema.maxMaterialCount.value as number);
      const materialCountMessage =
        this.model.materialCount.value + (materialCountOK ? ' <= ' : ' > ') + this.schema.maxMaterialCount.value;
      this.report.materialCount.test(materialCountOK, materialCountMessage);
    } else {
      // Check that the material count is within range
      const materialCountOK =
        (this.model.materialCount.value as number) >= (this.schema.minMaterialCount.value as number) &&
        (this.model.materialCount.value as number) <= (this.schema.maxMaterialCount.value as number);
      let materialCountMessage =
        this.schema.minMaterialCount.value +
        ' <= ' +
        this.model.materialCount.value +
        ' <= ' +
        this.schema.maxMaterialCount.value;
      if (!materialCountOK) {
        if ((this.model.materialCount.value as number) < (this.schema.minMaterialCount.value as number)) {
          materialCountMessage = this.model.materialCount.value + ' < ' + this.schema.minMaterialCount.value;
        } else if ((this.model.materialCount.value as number) > (this.schema.maxMaterialCount.value as number)) {
          materialCountMessage = this.model.materialCount.value + ' > ' + this.schema.maxMaterialCount.value;
        }
      }
      this.report.materialCount.test(materialCountOK, materialCountMessage);
    }
  }

  // Check the number of meshes, nodes, and primitives
  private testObjectCount() {
    // Nodes
    if (this.schema.maxNodeCount.value === -1 && this.schema.minNodeCount.value === -1) {
      // Skip the test, but still report the node count
      this.report.nodeCount.skipTestWithMessage(this.model.nodeCount.value.toLocaleString());
    } else if (this.schema.maxNodeCount.value === -1) {
      // Check only the min node count
      const nodeCountOK = this.model.nodeCount.value >= this.schema.minNodeCount.value;
      const nodeCountMessage =
        this.model.nodeCount.value + (nodeCountOK ? ' >= ' : ' < ') + this.schema.minNodeCount.value;
      this.report.nodeCount.test(nodeCountOK, nodeCountMessage);
    } else if (this.schema.minNodeCount.value === -1) {
      // Check only the max node count
      const nodeCountOK = this.model.nodeCount.value <= this.schema.maxNodeCount.value;
      const nodeCountMessage =
        this.model.nodeCount.value + (nodeCountOK ? ' <= ' : ' > ') + this.schema.maxNodeCount.value;
      this.report.nodeCount.test(nodeCountOK, nodeCountMessage);
    } else {
      // Check that the node count is within range
      const nodeCountOK =
        (this.model.nodeCount.value as number) >= (this.schema.minNodeCount.value as number) &&
        (this.model.nodeCount.value as number) <= (this.schema.maxNodeCount.value as number);
      let nodeCountMessage =
        this.schema.minNodeCount.value + ' <= ' + this.model.nodeCount.value + ' <= ' + this.schema.maxNodeCount.value;
      if (!nodeCountOK) {
        if ((this.model.nodeCount.value as number) < (this.schema.minNodeCount.value as number)) {
          nodeCountMessage = this.model.nodeCount.value + ' < ' + this.schema.minNodeCount.value;
        } else if ((this.model.nodeCount.value as number) > (this.schema.maxNodeCount.value as number)) {
          nodeCountMessage = this.model.nodeCount.value + ' > ' + this.schema.maxNodeCount.value;
        }
      }
      this.report.nodeCount.test(nodeCountOK, nodeCountMessage);
    }

    // Meshes
    if (this.schema.maxMeshCount.value === -1 && this.schema.minMeshCount.value === -1) {
      // Skip the test, but still report the mesh count
      this.report.meshCount.skipTestWithMessage(this.model.meshCount.value.toLocaleString());
    } else if (this.schema.maxMeshCount.value === -1) {
      // Check only the min mesh count
      const meshCountOK = this.model.meshCount.value >= this.schema.minMeshCount.value;
      const meshCountMessage =
        this.model.meshCount.value + (meshCountOK ? ' >= ' : ' < ') + this.schema.minMeshCount.value;
      this.report.meshCount.test(meshCountOK, meshCountMessage);
    } else if (this.schema.minMeshCount.value === -1) {
      // Check only the max mesh count
      const meshCountOK = this.model.meshCount.value <= this.schema.maxMeshCount.value;
      const meshCountMessage =
        this.model.meshCount.value + (meshCountOK ? ' <= ' : ' > ') + this.schema.maxMeshCount.value;
      this.report.meshCount.test(meshCountOK, meshCountMessage);
    } else {
      // Check that the mesh count is within range
      const meshCountOK =
        (this.model.meshCount.value as number) >= (this.schema.minMeshCount.value as number) &&
        (this.model.meshCount.value as number) <= (this.schema.maxMeshCount.value as number);
      let meshCountMessage =
        this.schema.minMeshCount.value + ' <= ' + this.model.meshCount.value + ' <= ' + this.schema.maxMeshCount.value;
      if (!meshCountOK) {
        if ((this.model.meshCount.value as number) < (this.schema.minMeshCount.value as number)) {
          meshCountMessage = this.model.meshCount.value + ' < ' + this.schema.minMeshCount.value;
        } else if ((this.model.meshCount.value as number) > (this.schema.maxMeshCount.value as number)) {
          meshCountMessage = this.model.meshCount.value + ' > ' + this.schema.maxMeshCount.value;
        }
      }
      this.report.meshCount.test(meshCountOK, meshCountMessage);
    }

    // Primitives
    if (this.schema.maxPrimitiveCount.value === -1 && this.schema.minPrimitiveCount.value === -1) {
      // Skip the test, but still report the primitive count
      this.report.primitiveCount.skipTestWithMessage(this.model.primitiveCount.value.toLocaleString());
    } else if (this.schema.maxPrimitiveCount.value === -1) {
      // Check only the min primitive count
      const primitiveCountOK = this.model.primitiveCount.value >= this.schema.maxPrimitiveCount.value;
      const primitiveCountMessage =
        this.model.primitiveCount.value + (primitiveCountOK ? ' >= ' : ' < ') + this.schema.maxPrimitiveCount.value;
      this.report.primitiveCount.test(primitiveCountOK, primitiveCountMessage);
    } else if (this.schema.minPrimitiveCount.value === -1) {
      // Check only the max mesh count
      const primitiveCountOK = this.model.primitiveCount.value <= this.schema.maxPrimitiveCount.value;
      const primitiveCountMessage =
        this.model.primitiveCount.value + (primitiveCountOK ? ' <= ' : ' > ') + this.schema.maxPrimitiveCount.value;
      this.report.primitiveCount.test(primitiveCountOK, primitiveCountMessage);
    } else {
      // Check that the mesh count is within range
      const primitiveCountOK =
        (this.model.primitiveCount.value as number) >= (this.schema.minPrimitiveCount.value as number) &&
        (this.model.primitiveCount.value as number) <= (this.schema.maxPrimitiveCount.value as number);
      let primitiveCountMessage =
        this.schema.minPrimitiveCount.value +
        ' <= ' +
        this.model.primitiveCount.value +
        ' <= ' +
        this.schema.maxPrimitiveCount.value;
      if (!primitiveCountOK) {
        if ((this.model.primitiveCount.value as number) < (this.schema.minPrimitiveCount.value as number)) {
          primitiveCountMessage = this.model.primitiveCount.value + ' < ' + this.schema.minPrimitiveCount.value;
        } else if ((this.model.primitiveCount.value as number) > (this.schema.maxPrimitiveCount.value as number)) {
          primitiveCountMessage = this.model.primitiveCount.value + ' > ' + this.schema.maxPrimitiveCount.value;
        }
      }
      this.report.primitiveCount.test(primitiveCountOK, primitiveCountMessage);
    }
  }

  // If product info is available, check that dimensions are within the specified tolerance
  private testProductDimensions() {
    // Product Dimensions meet tolerance (assume true for any missing product dimensions)
    let heightWithinTolerance = true;
    let lengthWithinTolerance = true;
    let widthWithinTolerance = true;
    let productToleranceMessage = '';
    let componentMessages = [];

    if (this.productInfo.height.loaded) {
      const heightMarginOfError =
        ((this.schema.percentToleranceHeight.value as number) / 100) * (this.productInfo.height.value as number);
      const heightTooSmall = this.model.height.value < (this.productInfo.height.value as number) - heightMarginOfError;
      const heightTooLarge = this.model.height.value > (this.productInfo.height.value as number) + heightMarginOfError;
      heightWithinTolerance = !heightTooSmall && !heightTooLarge;
      if (heightTooSmall) {
        componentMessages.push('Height too small');
        productToleranceMessage +=
          (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          heightMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (heightTooLarge) {
        componentMessages.push('Height too large');
        productToleranceMessage +=
          (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          heightMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
    }
    if (this.productInfo.length.loaded) {
      const lengthMarginOfError =
        ((this.schema.percentToleranceLength.value as number) / 100) * (this.productInfo.length.value as number);
      const lengthTooSmall = this.model.length.value < (this.productInfo.length.value as number) - lengthMarginOfError;
      const lengthTooLarge = this.model.length.value > (this.productInfo.length.value as number) + lengthMarginOfError;
      lengthWithinTolerance = !lengthTooSmall && !lengthTooLarge;
      if (lengthTooSmall) {
        componentMessages.push('Length too small');
        productToleranceMessage +=
          (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          lengthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (lengthTooLarge) {
        componentMessages.push('Length too large');
        productToleranceMessage +=
          (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          lengthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
    }
    if (this.productInfo.width.loaded) {
      const widthMarginOfError =
        ((this.schema.percentToleranceWidth.value as number) / 100) * (this.productInfo.width.value as number);
      const widthTooSmall = this.model.width.value < (this.productInfo.width.value as number) - widthMarginOfError;
      const widthTooLarge = this.model.width.value > (this.productInfo.width.value as number) + widthMarginOfError;
      widthWithinTolerance = !widthTooSmall && !widthTooLarge;
      if (widthTooSmall) {
        componentMessages.push('Width too small');
        productToleranceMessage +=
          (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          widthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (widthTooLarge) {
        componentMessages.push('Width too large');
        productToleranceMessage +=
          (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          widthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
    }

    if (!productToleranceMessage) {
      productToleranceMessage =
        'Product Dimensions: (L: ' +
        (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
        ' x W: ' +
        (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
        ' x H: ' +
        (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
        ') +/- ';
      if (
        this.schema.percentToleranceLength.value == this.schema.percentToleranceWidth.value &&
        this.schema.percentToleranceLength.value == this.schema.percentToleranceHeight.value
      ) {
        productToleranceMessage +=
          (this.schema.percentToleranceLength.value as number).toFixed(this.decimalDisplayPrecision) + '%';
      } else {
        productToleranceMessage +=
          '(L: ' +
          (this.schema.percentToleranceLength.value as number).toFixed(this.decimalDisplayPrecision) +
          '% x W: ' +
          (this.schema.percentToleranceWidth.value as number).toFixed(this.decimalDisplayPrecision) +
          '% x H: ' +
          (this.schema.percentToleranceHeight.value as number).toFixed(this.decimalDisplayPrecision) +
          '%)';
      }
    }

    this.report.productDimensionsWithinTolerance.test(
      widthWithinTolerance && heightWithinTolerance && lengthWithinTolerance,
      productToleranceMessage,
      componentMessages.join('; '),
    );
  }

  // Check that the root node transform is clean
  private testRootNodeTransform() {
    if (this.schema.requireCleanRootNodeTransform.value === false) {
      this.report.rootNodeCleanTransform.skipTestWithMessage(this.model.rootNodeTransform.isClean() ? 'true' : 'false');
    } else {
      let rootNodeTransformOK = this.model.rootNodeTransform.isClean();
      let rootNodeTransformMessage = '';
      if (!rootNodeTransformOK) {
        if (!this.model.rootNodeTransform.locationIsZero()) {
          rootNodeTransformMessage +=
            'Location: (' +
            (this.model.rootNodeTransform.location.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.location.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.location.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ') ';
        }
        if (!this.model.rootNodeTransform.rotationIsZero()) {
          rootNodeTransformMessage +=
            'Rotation: (' +
            (this.model.rootNodeTransform.rotation.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.rotation.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.rotation.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ') ';
        }
        if (!this.model.rootNodeTransform.scaleIsOne()) {
          rootNodeTransformMessage +=
            'Scale: (' +
            (this.model.rootNodeTransform.scale.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.scale.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.scale.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ')';
        }
      }
      this.report.rootNodeCleanTransform.test(rootNodeTransformOK, rootNodeTransformMessage);
    }
  }

  // The number of triangles should be less than or equal to the max, unless the max is -1
  private testTriangleCount() {
    if (this.schema.maxTriangleCount.value === -1 && this.schema.minTriangleCount.value === -1) {
      // Skip the test, but still report the triangle count
      this.report.triangleCount.skipTestWithMessage(this.model.triangleCount.value.toLocaleString());
    } else if (this.schema.maxTriangleCount.value === -1) {
      // Check only the min triangle count
      const triangleCountOK =
        (this.model.triangleCount.value as number) >= (this.schema.minTriangleCount.value as number);
      const triangleCountMessage =
        this.model.triangleCount.value.toLocaleString() +
        (triangleCountOK ? ' >= ' : ' < ') +
        this.schema.minTriangleCount.value.toLocaleString();
      this.report.triangleCount.test(triangleCountOK, triangleCountMessage);
    } else if (this.schema.minTriangleCount.value === -1) {
      // Check only the max primitive count
      const triangleCountOK =
        (this.model.triangleCount.value as number) <= (this.schema.maxTriangleCount.value as number);
      const triangleCountMessage =
        this.model.triangleCount.value.toLocaleString() +
        (triangleCountOK ? ' <= ' : ' > ') +
        this.schema.maxTriangleCount.value.toLocaleString();
      this.report.triangleCount.test(triangleCountOK, triangleCountMessage);
    } else {
      // Check that the mesh count is within range
      const triangleCountOK =
        (this.model.triangleCount.value as number) >= (this.schema.minTriangleCount.value as number) &&
        (this.model.triangleCount.value as number) <= (this.schema.maxTriangleCount.value as number);
      let triangleCountMessage =
        this.schema.minTriangleCount.value +
        ' <= ' +
        this.model.triangleCount.value +
        ' <= ' +
        this.schema.maxTriangleCount.value;
      if (!triangleCountOK) {
        if ((this.model.triangleCount.value as number) < (this.schema.minTriangleCount.value as number)) {
          triangleCountMessage = this.model.triangleCount.value + ' < ' + this.schema.minTriangleCount.value;
        } else if ((this.model.triangleCount.value as number) > (this.schema.maxTriangleCount.value as number)) {
          triangleCountMessage = this.model.triangleCount.value + ' > ' + this.schema.maxTriangleCount.value;
        }
      }
      this.report.triangleCount.test(triangleCountOK, triangleCountMessage);
    }
  }

  // Check if texture dimensions are within range, powers of 2, quadratic, and PBR safe
  private testTextures() {
    if (this.model.images.length === 0) {
      // If there are no images, skip all of these tests
      this.report.textureDimensionsMaxHeight.skipTestWithMessage('No Images');
      this.report.textureDimensionsMinHeight.skipTestWithMessage('No Images');
      this.report.textureDimensionsMaxWidth.skipTestWithMessage('No Images');
      this.report.textureDimensionsMinWidth.skipTestWithMessage('No Images');
      this.report.texturesPowerOfTwo.skipTestWithMessage('No Images');
      this.report.texturesQuadratic.skipTestWithMessage('No Images');
      this.report.pbrColorMax.skipTestWithMessage('No Images');
      this.report.pbrColorMin.skipTestWithMessage('No Images');
      this.report.pixelsPerMeterMax.skipTestWithMessage('No Images');
      this.report.pixelsPerMeterMin.skipTestWithMessage('No Images');
    } else {
      // Texture Size - Height (max)
      if (this.schema.maxTextureHeight.value === -1) {
        this.report.textureDimensionsMaxHeight.skipTestWithMessage(this.model.texturesMaxHeight.value.toLocaleString());
      } else {
        const maxHeightPasses = this.model.texturesMaxHeight.value <= this.schema.maxTextureHeight.value;
        let failingTextureList = [] as string[];
        if (!maxHeightPasses) {
          this.model.images.forEach(image => {
            if (image.height > this.schema.maxTextureHeight.value) {
              failingTextureList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.textureDimensionsMaxHeight.test(
          maxHeightPasses,
          this.model.texturesMaxHeight.value + (maxHeightPasses ? ' <= ' : ' > ') + this.schema.maxTextureHeight.value,
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // Texture Size - Height (min)
      if (this.schema.minTextureHeight.value === -1) {
        this.report.textureDimensionsMinHeight.skipTestWithMessage(this.model.texturesMinHeight.value.toLocaleString());
      } else {
        const minHeightPasses = this.model.texturesMinHeight.value >= this.schema.minTextureHeight.value;
        let failingTextureList = [] as string[];
        if (!minHeightPasses) {
          this.model.images.forEach(image => {
            if (image.height < this.schema.minTextureHeight.value) {
              failingTextureList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.textureDimensionsMinHeight.test(
          minHeightPasses,
          this.model.texturesMinHeight.value + (minHeightPasses ? ' >= ' : ' < ') + this.schema.minTextureHeight.value,
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // Texture Size - Width (max)
      if (this.schema.maxTextureWidth.value === -1) {
        this.report.textureDimensionsMaxWidth.skipTestWithMessage(this.model.texturesMaxWidth.value.toLocaleString());
      } else {
        const maxWidthPasses = this.model.texturesMaxWidth.value <= this.schema.maxTextureWidth.value;
        let failingTextureList = [] as string[];
        if (!maxWidthPasses) {
          this.model.images.forEach(image => {
            if (image.width > this.schema.maxTextureWidth.value) {
              failingTextureList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.textureDimensionsMaxWidth.test(
          maxWidthPasses,
          this.model.texturesMaxWidth.value + (maxWidthPasses ? ' <= ' : ' > ') + this.schema.maxTextureWidth.value,
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // Texture Size - Width (min)
      if (this.schema.minTextureWidth.value === -1) {
        this.report.textureDimensionsMinWidth.skipTestWithMessage(this.model.texturesMinWidth.value.toLocaleString());
      } else {
        const minWidthPasses = this.model.texturesMinWidth.value >= this.schema.minTextureWidth.value;
        let failingTextureList = [] as string[];
        if (!minWidthPasses) {
          this.model.images.forEach(image => {
            if (image.width < this.schema.minTextureWidth.value) {
              failingTextureList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.textureDimensionsMinWidth.test(
          minWidthPasses,
          this.model.texturesMinWidth.value + (minWidthPasses ? ' >= ' : ' < ') + this.schema.minTextureWidth.value,
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // Texture Size - Power of 2
      const allTexturesArePowerOfTwo = this.model.images.every(v => v.isPowerOfTwo());
      if (this.schema.requireTextureDimensionsBePowersOfTwo.value === false) {
        this.report.texturesPowerOfTwo.skipTestWithMessage(allTexturesArePowerOfTwo ? 'true' : 'false');
      } else {
        let failingTextureList = [] as string[];
        let failingResolutions = [] as string[];
        if (!allTexturesArePowerOfTwo) {
          this.model.images.forEach(image => {
            if (!image.isPowerOfTwo()) {
              failingTextureList.push(image.name ?? 'unnamed');
              failingResolutions.push(image.width + ' x ' + image.height);
            }
          });
        }
        this.report.texturesPowerOfTwo.test(
          allTexturesArePowerOfTwo,
          failingResolutions.join('; '),
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // Texture Size - Quadratic (width=height)
      const allTexturesAreQuadratic = this.model.images.every(v => v.isQuadratic());
      if (this.schema.requireTextureDimensionsBeQuadratic.value === false) {
        this.report.texturesQuadratic.skipTestWithMessage(allTexturesAreQuadratic ? 'true' : 'false');
      } else {
        let failingTextureList = [] as string[];
        let failingResolutions = [] as string[];
        if (!allTexturesAreQuadratic) {
          this.model.images.forEach(image => {
            if (!image.isQuadratic()) {
              failingTextureList.push(image.name ?? 'unnamed');
              failingResolutions.push(image.width + ' x ' + image.height);
            }
          });
        }
        this.report.texturesQuadratic.test(
          allTexturesAreQuadratic,
          failingResolutions.join('; '),
          failingTextureList.length > 0 ? 'Failing images: ' + failingTextureList.join('; ') : '',
        );
      }

      // PBR safe colors
      if (this.schema.pbrColorMax.value === -1) {
        this.report.pbrColorMax.skipTestWithMessage((this.model.colorValueMax.value as number).toLocaleString());
      } else {
        const pbrMaxOK = this.model.colorValueMax.value <= this.schema.pbrColorMax.value;
        const message =
          (this.model.colorValueMax.value as number).toLocaleString() +
          (pbrMaxOK ? ' <= ' : ' > ') +
          (this.schema.pbrColorMax.value as number).toLocaleString();
        let failingImageList = [] as string[];
        if (!pbrMaxOK) {
          this.model.images.forEach(image => {
            if (image.maxValue > this.schema.pbrColorMax.value) {
              failingImageList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.pbrColorMax.test(
          pbrMaxOK,
          message,
          failingImageList.length > 0 ? 'Failing images: ' + failingImageList.join('; ') : '',
        );
      }
      if (this.schema.pbrColorMin.value === -1) {
        this.report.pbrColorMin.skipTestWithMessage((this.model.colorValueMin.value as number).toLocaleString());
      } else {
        const pbrMinOK = this.model.colorValueMin.value >= this.schema.pbrColorMin.value;
        const message =
          (this.model.colorValueMin.value as number).toLocaleString() +
          (this.model.colorValueMin.value >= this.schema.pbrColorMin.value ? ' >= ' : ' < ') +
          (this.schema.pbrColorMin.value as number).toLocaleString();
        let failingImageList = [] as string[];
        if (!pbrMinOK) {
          this.model.images.forEach(image => {
            if (image.minValue < this.schema.pbrColorMin.value) {
              failingImageList.push(image.name ?? 'unnamed');
            }
          });
        }
        this.report.pbrColorMin.test(
          pbrMinOK,
          message,
          failingImageList.length > 0 ? 'Failing images: ' + failingImageList.join('; ') : '',
        );
      }
    }
  }

  // UVs are in the 0 to 1 range, not inverted, and texel density is within limits
  private testUVs() {
    // 0-1 Range
    const uvRangeMessage =
      'u: ' +
      (this.model.u.min.value as number).toFixed(this.decimalDisplayPrecision) +
      ' to ' +
      (this.model.u.max.value as number).toFixed(this.decimalDisplayPrecision) +
      ', v: ' +
      (this.model.v.min.value as number).toFixed(this.decimalDisplayPrecision) +
      ' to ' +
      (this.model.v.max.value as number).toFixed(this.decimalDisplayPrecision);
    if (this.schema.requireUVRangeZeroToOne.value === false) {
      this.report.uvsInZeroToOneRange.skipTestWithMessage(uvRangeMessage);
    } else {
      this.report.uvsInZeroToOneRange.test(this.model.uvIsInRangeZeroToOne(), uvRangeMessage);
    }

    // Inverted UVs
    if (this.schema.requireNotInvertedUVs.value === false) {
      this.report.uvsInverted.skipTestWithMessage(this.model.invertedTriangleCount.value.toLocaleString());
    } else {
      this.report.uvsInverted.test(
        this.model.invertedTriangleCount.value === 0,
        this.model.invertedTriangleCount.value.toLocaleString(),
      );
    }

    // Overlapping UVs
    if (this.schema.checksRequireUvIndices === false) {
      this.report.uvsOverlap.skipTestWithMessage('Not Computed (slow)');
    } else if (this.schema.requireNotOverlappingUVs.value === false) {
      this.report.uvsOverlap.skipTestWithMessage(this.model.overlappingUvCount.value.toLocaleString());
    } else {
      this.report.uvsOverlap.test(
        this.model.overlappingUvCount.value === 0,
        this.model.overlappingUvCount.value.toLocaleString(),
      );
    }

    // Pixels per Meter (Texel Density)
    // V2: texel density should ideally be calculated per material, rather than the min/max of all images in the file.
    // Computing density per material requires linking the canvas images to textures and linking those to materials
    // and linking the gltf material indices to the babylon meshes because NullEngine does not load images.
    if (this.model.images.length > 0) {
      // Only necessary if there are images. A skip test message is set in testTextures().
      const maxResolutionSquared =
        (this.model.texturesMaxWidth.value as number) * (this.model.texturesMaxHeight.value as number);
      const minResolutionSquared =
        (this.model.texturesMinWidth.value as number) * (this.model.texturesMinHeight.value as number);
      const maxPixelDensity = (this.model.maxUvDensity.value as number) * maxResolutionSquared;
      const minPixelDensity = (this.model.minUvDensity.value as number) * minResolutionSquared;
      const maxPixelDensityMessage = maxPixelDensity.toLocaleString();
      const minPixelDensityMessage = minPixelDensity.toLocaleString();
      // Max ppm
      if (this.schema.maxPixelsPerMeter.value === -1) {
        this.report.pixelsPerMeterMax.skipTestWithMessage(maxPixelDensityMessage);
      } else {
        const maxUvDensityOK = maxPixelDensity <= this.schema.maxPixelsPerMeter.value;
        this.report.pixelsPerMeterMax.test(
          maxUvDensityOK,
          maxPixelDensityMessage +
            (maxUvDensityOK ? ' <= ' : ' > ') +
            (this.schema.maxPixelsPerMeter.value as number).toLocaleString(),
        );
      }
      // Min ppm
      if (this.schema.minPixelsPerMeter.value === -1) {
        this.report.pixelsPerMeterMin.skipTestWithMessage(minPixelDensityMessage);
      } else {
        const minUvDensityOK = minPixelDensity >= this.schema.minPixelsPerMeter.value;
        this.report.pixelsPerMeterMin.test(
          minUvDensityOK,
          minPixelDensityMessage +
            (minUvDensityOK ? ' >= ' : ' < ') +
            (this.schema.minPixelsPerMeter.value as number).toLocaleString(),
        );
      }
    }

    // Island Margin
    // For each primitive, see if there is enough margin at the specified resolution
    // This process rasterizes the island margins at the given resolution and if two or more
    // islands try to set the same pixel, it will return false.
    if (this.schema.checksRequireUvIndices === false) {
      this.report.uvGutterWideEnough.skipTestWithMessage('Not Computed (slow)');
    } else if (this.schema.resolutionNeededForUvMargin.value < 0) {
      this.report.uvGutterWideEnough.skipTestWithMessage('');
    } else {
      let hasEnoughMargin = true;
      const resolution = this.schema.resolutionNeededForUvMargin.value as number;
      this.model.primitives.every((primitive: PrimitiveInterface) => {
        hasEnoughMargin = hasEnoughMargin && primitive.uv.hasEnoughMarginAtResolution(resolution);
        return hasEnoughMargin; // .every stops looping when a falsy value is returned. no need to keep checking
      });
      this.report.uvGutterWideEnough.test(
        hasEnoughMargin,
        'Checked for pixel collision at ' + resolution + 'x' + resolution,
      );
    }
  }
}
