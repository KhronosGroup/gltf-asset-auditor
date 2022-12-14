# Khronos 3D Commerce Asset Validator

## SPDX-License-Identifier: Apache-2.0

This is a typescript package that contains classes for checking a 3D file, in glTF format (.glb or .gltf), against a requirements schema definition in JSON. The schema file determines which of the checks, listed below, get run and what the passing values are. The result of each test is Pass, Fail, or Not Tested and some additional information may be available in a message.

This package can be used by both a command line interface (node), as well as a front-end web interface. The samples directory includes a command line interface (cli) as well as a web-based implementation to demonstrate how the package can be used in your own project.

Some of the checks can be **_SLOW_** for files with a lot of triangles. This is because the gltf format only stores geometry as indivdual triangles with independant vertices. If a test relies on shared edges, those edges have to be computed by checking each vertex's XYZ and/or UV location for a match. Beveled Edges and Non-Manifold edges both require XYZ edge computation. UV Gutter Width and UV Overlaps both require UV triangle computation. Each of those computations take about the same O(n log n) time, where n is the number of triangles. Typical run time without either of those computations is under 5 seconds, but if both types need to be run the test can take over a minute.

## Checks available

- File Size
- Triangle Count
- Material Count
- Node Count
- Mesh Count
- Primitive Count
- Clean Origin for Root Node
- Beveled Edges (no hard edges >= 90 degrees) (**_SLOW_**)
- Non-Manifold Edges (**_SLOW_**)
- Dimensions
- Dimensions (product within tolerance)
- PBR Safe Colors
- Texture Map Resolution
- Texture Map Resolution Power of 2
- Texture Map Resolution Quadratic
- Texel Density
- 0-1 UV Texture Space
- Inverted UVs
- UV Overlaps (**_SLOW_**)
- UV Gutter Width (**_SLOW_**)

## Product Info JSON file

For testing product dimensional tollerance, we need to know the dimensions of the product. The product info json file is used to provide that information. The product dimensions specified in the Scheam json file are different and more like a viewer bounding box check, but the percent tolerance value is used for both.

# Schema JSON file

The schema is used to specify which checks are run and what the passing values are. Ommitted values will use the default recommendations of the Khronos 3D Commerce Asset Creation Guidelines, which are set in Schema.ts. To turn off a test that would normally run by default, -1 should be specified for parameters of type number and false for booleans.

## Version

**_version: string_**

This is the only required value. It corresponds to the version of this package and is used to identify which settings may be available. Features that were added after the version specified, starting with 1.0.0, will be turned off, rather than use default values.

## File Size

**_fileSizeInKb?: { maximum?: number }_** (5120)

**_fileSizeInKb?: { minimum?: number }_** (1)

The size of the file in kilobytes.

## Materials Count

**_materials?: { maximum?: number }_** (5)

**_materials?: { minimum?: number }_** (-1)

The number of all materials used in the entire file.

## Model Attributes

**_model?: {...}_**

This group of values is related to objects and geometry

### Object Count

**_objectCount?: {...}_**

The number of objects can impact performance. Each primitive uses a separate draw call(s), based on the number of textures in its material.

**_nodes?: { maximum?: number }_** (-1)

**_nodes?: { minimum?: number }_** (-1)

Nodes establish parent / child structure between meshes.

**_meshes?: { maximum?: number }_** (-1)

**_meshes?: { minimum?: number }_** (-1)

Meshes are a groups of one or more primitives.

**_primitives?: { maximum?: number }_** (-1)

**_primitives?: { minimum?: number }_** (-1)

Primitives are collection of triangles that use one material.

### Beveled Edges

**_requireBeveledEdges?: boolean_** (false)

Most objects in the real world do not have perfectly sharp edges, they are slightly rounded, so rendering non-beveled edges looks less realistic. This checks that the angle between all faces is greater than 90 degrees.

### Clean Transform

**_requireCleanRootNodeTransform?: boolean_** (false)

The object's transform center should be (0,0,0), it's rotation should be (0,0,0) and it's scale should be (1,1,1).

### Manifold Edges

**_requireManifoldEdges?: boolean_** (false)

Checks that all edges have 2 faces connected to them.

### Triangle Count

**_triangles?: { maximum?: number }_** (100,000)

**_triangles?: { minimum?: number }_** (-1)

Specifies the range of number of triangles in the file.

## Product Info

// TODO: May want to move this into the object group if it's not relelated to the product info json file data.

### Dimensions

This check also requires a product info json file to provide the target dimensions.

**_product?: { dimensions?: { height?: { maximum?: number } } }_**

**_product?: { dimensions?: { height?: { minimum?: number } } }_**

**_product?: { dimensions?: { height?: { percentTolerance?: number } } }_**

**_product?: { dimensions?: { length?: { maximum?: number } } }_**

**_product?: { dimensions?: { length?: { minimum?: number } } }_**

**_product?: { dimensions?: { length?: { percentTolerance?: number } } }_**

**_product?: { dimensions?: { width?: { maximum?: number } } }_**

**_product?: { dimensions?: { width?: { minimum?: number } } }_**

**_product?: { dimensions?: { width?: { percentTolerance?: number } } }_**

Checks that the height is within a specified range +/- a given tolerance
// TODO: it seems like tolerance is the only value that should be here in the product object
// min/max should be provided via product info json and possibly also at the model object, with without tolerance

## Textures

**_textures?: {...}_**

### Height

**_height?: { maximum?: number }_** (2048)

**_height?: { minimum?: number }_** (512)

The width of the texture maps.

### PBR Color Range

**_pbrColorRange?: { maximum?: number }_** (243)

**_pbrColorRange?: { minimum?: number }_** (30)

The min/max luminosity value of every pixel in every texture image. For the rendering engine to be able to add or subtract light from the texture, additional headroom should be available.

### Dimensions Power of Two

**_requireDimensionsBePowersOfTwo?: boolean_** (true)

For optimal processing on the GPU and for mip mapping, the file size should be a power of 2 (256, 512, 1024, 2048, 4096, ...)

### Dimensions Quadratic

**_requireDimensionsBeQuadratic?: boolean_** (false)

When dimensions are quadratic, the height and width are the same.

### Width

**_width?: { maximum?: number }_** (2048)

**_width?: { minimum?: number }_** (512)

The width of the texture maps.

## UVs

**_uvs?: {...}_**

### Gutter Width

**_gutterWidth?: { resolution256?: number }_**

**_gutterWidth?: { resolution512?: number }_**

**_gutterWidth?: { resolution1024?: number }_**

**_gutterWidth?: { resolution2048?: number }_**

**_gutterWidth?: { resolution4096?: number }_**

The gutter width is related to spacing between UV islands to prevent texture bleed when scaling to various resolutions, typically through mip mapping.

The number of pixels of padding required can be specified against various base resolutions. Only one of these needs to be specified and if there are more than one, the smallest computed grid size will be used. For example, specifying a value of 8 for resolution1024 yields grid size of 128, meaning that there needs to be at least 1px buffer between islands when resized to 128px. A value of 2 for resolution256 gives the same grid size of 128, wheras a value of 4 for resolution256 gives 64. If both resolution256: 4 and resolution1024: 8 are provided, the smaller grid size of 64px will be used for the test.

### Not Inverted

**_requireNotInverted?: boolean_** (true)

UV faces should face upwards (wind in a clockwise direction)

### Not Overlapping

**_requireNotOverlapping?: boolean_** (true)

UV triangles should not overlap

### Texel Density

**_pixelsPerMeter?: { maximum?: number }_** (-1)

**_pixelsPerMeter?: { minimum?: number }_** (-1)

The min and max texel density of all triangles in the model based upon the largest and smallest texture sizes.

### UVs in 0-1 Range

**_requireRangeZeroToOne?: boolean_** (false)

UV triangles should be in the 0-1 space.
