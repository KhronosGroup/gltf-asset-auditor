# Khronos glTF Asset Auditor

# Command Line Interface Example

## SPDX-License-Identifier: Apache-2.0

This is a sub-project of the glTF Asset Auditor which shows how to implement a version from the command line, using Node.js

### Usage

This folder, /cli, is designed to be extracted from the main project (glTF Asset Auditor) and run on its own.

You need to have **Node.js** installed on your system. This project was developed with v16.13.0, but any modern version should work.

Dependencies need to be installed using npm. The main dependency is the glTF Asset Auditor and chalk is just used to add some color to the output.

```
npm i
```

The glTF Asset Auditor is now ready to run and the most basic usage is:

```
node index.js {schema-json-filepath}.json {glb-model-filepath}.glb
```

### glTF Multi-file (.gltf + .bin + images)

When using a multi-file .gltf, all of the files should be provided, separated by a space. They will be identified by file extension. A .gltf and .bin file are required at a minimum.

```
node index.js {schema-json-filepath}.json {gltf-model-filepath}.gltf {bin-filepath}.bin {texture-1}.jpg {texture-2}.png ...
```

### Command Line Flags

Additional flags can be used to provide product information, save the report as .csv and/or .json (both can be used with two -o's)

- -o ; without a name argument creates a .json file with the model file name and a date + timestamp. This can go anywhere except before the schema file name (which also ends with .json and would be treated as the output file name)
- -o {output-file-name}.json ; creates a json file with the report results
- -o {output-file-name}.csv ; creates a comma separated values file with the report results
- -p {product-info-file-name}.json ; Provides product dimensions to check against
- -s {schema-file-name}.json ; using the -s flag is optional, but highly recommended if providing other .json files
- -q ; quiet mode, console output will be suppressed

### Output

The report will be printed to the console by default and will show PASS / FAIL / NOT TESTED for each test available. It also shows how long it took to run.

Example output:

```
-- glTF Asset Auditor --
* Version: 1.0.0
==== Audit Report ====
                              glTF Validator: PASS       | Errors: 0, Warnings: 0, Hints: 4, Info: 0
                                   File Size: NOT TESTED | 9kb
                              Triangle Count: NOT TESTED | 12
                              Material Count: NOT TESTED | 1
                                  Node Count: NOT TESTED | 1
                                  Mesh Count: NOT TESTED | 1
                             Primitive Count: NOT TESTED | 1
               Root Node has Clean Transform: NOT TESTED | true
                       Require Beveled Edges: NOT TESTED | Not Computed (slow)
                      Require Manifold Edges: NOT TESTED | Not Computed (slow)
                          Overall Dimensions: NOT TESTED | (L:2.00 x W:2.00 x H:2.00)
                    Dimensions Match Product: NOT TESTED | No Product Info Loaded
 Maximum HSV color value for PBR safe colors: PASS       | 240 <= 240
 Minimum HSV color value for PBR safe colors: PASS       | 30 >= 30
                       Texture Height <= Max: NOT TESTED | 256
                       Texture Height >= Min: NOT TESTED | 256
                        Texture Width <= Max: NOT TESTED | 256
                        Texture Width >= Min: NOT TESTED | 256
          Texture Dimensions are Powers of 2: NOT TESTED | true
Texture Dimensions are Square (width=height): NOT TESTED | true
                    Maximum Pixels per Meter: NOT TESTED | 1,024
                    Minimum Pixels per Meter: NOT TESTED | 1,024
                         UVs in 0 to 1 Range: NOT TESTED | u: 0.13 to 0.88, v: 0.00 to 1.00
                                Inverted UVs: NOT TESTED | 0
                             Overlapping UVs: NOT TESTED | Not Computed (slow)
                       UV Gutter Wide Enough: NOT TESTED | Not Computed (slow)
===========================
Total Time: 0.125 seconds.
```
