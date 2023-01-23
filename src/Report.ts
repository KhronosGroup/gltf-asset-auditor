import { ReportItem, ReportItemInterface } from './ReportItem.js';

export interface ReportInterface {
  fileSize: ReportItemInterface;
  gltfValidator: ReportItemInterface;
  materialCount: ReportItemInterface;
  meshCount: ReportItemInterface;
  nodeCount: ReportItemInterface;
  overallDimensionsWithinTolerance: ReportItemInterface;
  pbrColorMax: ReportItemInterface;
  pbrColorMin: ReportItemInterface;
  pixelsPerMeterMax: ReportItemInterface;
  pixelsPerMeterMin: ReportItemInterface;
  primitiveCount: ReportItemInterface;
  productDimensionsWithinTolerance: ReportItemInterface;
  requireBeveledEdges: ReportItemInterface;
  requireManifoldEdges: ReportItemInterface;
  rootNodeCleanTransform: ReportItemInterface;
  textureDimensionsMaxHeight: ReportItemInterface;
  textureDimensionsMaxWidth: ReportItemInterface;
  textureDimensionsMinHeight: ReportItemInterface;
  textureDimensionsMinWidth: ReportItemInterface;
  texturesPowerOfTwo: ReportItemInterface;
  texturesQuadratic: ReportItemInterface;
  triangleCount: ReportItemInterface;
  uvGutterWideEnough: ReportItemInterface;
  uvsInverted: ReportItemInterface;
  uvsInZeroToOneRange: ReportItemInterface;
  uvsOverlap: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

// All of the checks that are available. Will either be PASS, FAIL, or NOT TESTED
// Specifies a link to the Asset Auditor for more information about what the test is checking and why it is important.
export class Report implements ReportInterface {
  fileSize = new ReportItem(
    'File Size',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec01_FileFormatsAndAssetStructure/FileFormatsAndAssetStructure.md',
  );
  gltfValidator = new ReportItem('glTF Validator', 'http://github.khronos.org/glTF-Validator/');
  materialCount = new ReportItem(
    'Material Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#multiple-materials-per-model',
  );
  meshCount = new ReportItem(
    'Mesh Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  nodeCount = new ReportItem(
    'Node Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  overallDimensionsWithinTolerance = new ReportItem(
    'Overall Dimensions',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  pbrColorMax = new ReportItem(
    'Maximum HSV color value for PBR safe colors',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#pbr-colors-and-values',
  );
  pbrColorMin = new ReportItem(
    'Minimum HSV color value for PBR safe colors',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#pbr-colors-and-values',
  );
  pixelsPerMeterMax = new ReportItem(
    'Maximum Pixels per Meter',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  pixelsPerMeterMin = new ReportItem(
    'Minimum Pixels per Meter',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  primitiveCount = new ReportItem(
    'Primitive Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  productDimensionsWithinTolerance = new ReportItem(
    'Dimensions Match Product',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  requireBeveledEdges = new ReportItem(
    'Require Beveled Edges',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#topology--mesh-optimization',
  );
  requireManifoldEdges = new ReportItem(
    'Require Manifold Edges',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#watertight-vs-open-mesh-geometry',
  );
  rootNodeCleanTransform = new ReportItem(
    'Root Node has Clean Transform',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#best-practice',
  );
  textureDimensionsMaxHeight = new ReportItem(
    'Texture Height <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMaxWidth = new ReportItem(
    'Texture Width <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinHeight = new ReportItem(
    'Texture Height >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinWidth = new ReportItem(
    'Texture Width >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  texturesPowerOfTwo = new ReportItem(
    'Texture Dimensions are Powers of 2',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#powers-of-two',
  );
  texturesQuadratic = new ReportItem(
    'Texture Dimensions are Square (width=height)',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#texture-dimensions-square-vs-rectangular',
  );
  triangleCount = new ReportItem(
    'Triangle Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#polygonal-count',
  );
  // TODO: A section explaining gutter width needs to be added to the guidelines and this link can be more specific.
  uvGutterWideEnough = new ReportItem(
    'UV Gutter Wide Enough',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
  );
  uvsInverted = new ReportItem(
    'Inverted UVs',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
  );
  uvsInZeroToOneRange = new ReportItem(
    'UVs in 0 to 1 Range',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
  );
  uvsOverlap = new ReportItem(
    'Overlapping UVs',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md#overlapping-uvs-considerations-in-an-atlas-layout',
  );

  // Return an iterable list of all the items
  getItems() {
    return [
      this.gltfValidator,
      this.fileSize,
      this.triangleCount,
      this.materialCount,
      this.nodeCount,
      this.meshCount,
      this.primitiveCount,
      this.rootNodeCleanTransform,
      this.requireBeveledEdges,
      this.requireManifoldEdges,
      this.overallDimensionsWithinTolerance,
      this.productDimensionsWithinTolerance,
      this.pbrColorMax,
      this.pbrColorMin,
      this.textureDimensionsMaxHeight,
      this.textureDimensionsMinHeight,
      this.textureDimensionsMaxWidth,
      this.textureDimensionsMinWidth,
      this.texturesPowerOfTwo,
      this.texturesQuadratic,
      this.pixelsPerMeterMax,
      this.pixelsPerMeterMin,
      this.uvsInZeroToOneRange,
      this.uvsInverted,
      this.uvsOverlap,
      this.uvGutterWideEnough,
    ];
  }
}
