import { SchemaJSONInterface } from '../node_modules/@mikefesta/3dc-validator/dist/SchemaJSON';
import { Validator } from '../node_modules/@mikefesta/3dc-validator/dist/Validator';
import { GltfValidatorReportIssuesMessageInterface } from '../node_modules/@mikefesta/3dc-validator/dist/GltfValidatorReport';
import {
  ArcRotateCamera,
  Color4,
  Engine,
  FilesInputStore,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
} from '../node_modules/@babylonjs/core/index';
import '@babylonjs/loaders/glTF/2.0/glTFLoader.js';

// Helper function
function $(id: string) {
  return document.getElementById(id);
}

// Highlight an element for drag and drop
function addHighlightClass(element: HTMLElement) {
  element.classList.add('highlight');
}

// Remove the child elements of the report
function clearReport() {
  const reportTable = $('report');
  while (reportTable.hasChildNodes()) {
    reportTable.removeChild(reportTable.firstChild);
  }
}

// Extract the csv data from the validator report and provide it as a file to the user
function downloadReportCsv(validator: Validator) {
  const csvString = validator.getReportCsv();
  const dataString = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
  const a = document.createElement('a');
  a.href = dataString;
  a.download = getFilenameWithTimestamp(validator.model.glb.filename) + '.csv';
  a.click();
}

// Extract the json data from the validator report and provide it as a file to the user
function downloadReportJson(validator: Validator) {
  const jsonString = validator.getReportJson();
  const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
  const a = document.createElement('a');
  a.href = dataString;
  a.download = getFilenameWithTimestamp(validator.model.glb.filename) + '.json';
  a.click();
}

// Extract the json object from the form inputs and provide it as a file to the user
function downloadSchemaJson() {
  const json = getSchemaFromForm();
  const jsonString = JSON.stringify(json);
  const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
  const a = document.createElement('a');
  a.href = dataString;
  a.download = '3dc-validator-schema.json';
  a.click();
}

// Gives a name + timestamp file name string
function getFilenameWithTimestamp(fileName: string) {
  const date = new Date();
  const timestamp = [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + date.getDate()).slice(-2),
    ('0' + date.getHours()).slice(-2),
    ('0' + date.getMinutes()).slice(-2),
    ('0' + date.getSeconds()).slice(-2),
  ].join('-');
  return fileName.substring(0, fileName.lastIndexOf('.')) + '-3DQC-' + timestamp;
}

// Read the input values and put them in a schema json object
function getSchemaFromForm() {
  return {
    version: ($('formVersion') as HTMLInputElement).value as string,
    fileSizeInKb: {
      maximum: parseInt(($('formFileSizeMax') as HTMLInputElement).value),
      minimum: parseInt(($('formFileSizeMin') as HTMLInputElement).value),
    },
    materials: {
      maximum: parseInt(($('formMaterialCountMax') as HTMLInputElement).value),
      minimum: parseInt(($('formMaterialCountMin') as HTMLInputElement).value),
    },
    model: {
      objectCount: {
        nodes: {
          maximum: parseInt(($('formNodeCountMax') as HTMLInputElement).value),
          minimum: parseInt(($('formNodeCountMin') as HTMLInputElement).value),
        },
        meshes: {
          maximum: parseInt(($('formMeshCountMax') as HTMLInputElement).value),
          minimum: parseInt(($('formMeshCountMin') as HTMLInputElement).value),
        },
        primitives: {
          maximum: parseInt(($('formPrimitiveCountMax') as HTMLInputElement).value),
          minimum: parseInt(($('formPrimitiveCountMin') as HTMLInputElement).value),
        },
      },
      requireBeveledEdges: ($('formBeveledEdgesYes') as HTMLInputElement).checked,
      requireCleanRootNodeTransform: ($('formCleanTransformsYes') as HTMLInputElement).checked,
      requireManifoldEdges: ($('formRequireManifoldEdgesYes') as HTMLInputElement).checked,
      triangles: {
        maximum: parseInt(($('formTriangleCountMax') as HTMLInputElement).value),
        minimum: parseInt(($('formTriangleCountMin') as HTMLInputElement).value),
      },
    },
    product: {
      dimensions: {
        height: {
          maximum: parseInt(($('formModelHeightMax') as HTMLInputElement).value),
          minimum: parseInt(($('formModelHeightMin') as HTMLInputElement).value),
          percentTolerance: parseInt(($('formModelHeightTolerance') as HTMLInputElement).value),
        },
        length: {
          maximum: parseInt(($('formModelLengthMax') as HTMLInputElement).value),
          minimum: parseInt(($('formModelLengthMin') as HTMLInputElement).value),
          percentTolerance: parseInt(($('formModelLengthTolerance') as HTMLInputElement).value),
        },
        width: {
          maximum: parseInt(($('formModelWidthMax') as HTMLInputElement).value),
          minimum: parseInt(($('formModelWidthMin') as HTMLInputElement).value),
          percentTolerance: parseInt(($('formModelWidthTolerance') as HTMLInputElement).value),
        },
      },
    },
    textures: {
      height: {
        maximum: parseInt(($('formTextureHeightMax') as HTMLInputElement).value),
        minimum: parseInt(($('formTextureHeightMin') as HTMLInputElement).value),
      },
      pbrColorRange: {
        maximum: parseInt(($('formPbrColorRangeMax') as HTMLInputElement).value),
        minimum: parseInt(($('formPbrColorRangeMin') as HTMLInputElement).value),
      },
      requireDimensionsBePowersOfTwo: ($('formTexturesPowerOfTwoYes') as HTMLInputElement).checked,
      requireDimensionsBeQuadratic: ($('formTexturesQuadraticYes') as HTMLInputElement).checked,
      width: {
        maximum: parseInt(($('formTextureWidthMax') as HTMLInputElement).value),
        minimum: parseInt(($('formTextureWidthMin') as HTMLInputElement).value),
      },
    },
    uvs: {
      gutterWidth: {
        resolution256: parseInt(($('formUvGutterWidth256') as HTMLInputElement).value),
        resolution512: parseInt(($('formUvGutterWidth512') as HTMLInputElement).value),
        resolution1024: parseInt(($('formUvGutterWidth1024') as HTMLInputElement).value),
        resolution2048: parseInt(($('formUvGutterWidth2048') as HTMLInputElement).value),
        resolution4096: parseInt(($('formUvGutterWidth4096') as HTMLInputElement).value),
      },
      pixelsPerMeter: {
        maximum: parseInt(($('formPixelsPerMeterMax') as HTMLInputElement).value),
        minimum: parseInt(($('formPixelsPerMeterMin') as HTMLInputElement).value),
      },
      requireNotInverted: ($('formUvsNotInvertedYes') as HTMLInputElement).checked,
      requireNotOverlapping: ($('formUvsNotOverlappingYes') as HTMLInputElement).checked,
      requireRangeZeroToOne: ($('formUvsInRange01Yes') as HTMLInputElement).checked,
    },
  };
}

// Load model action that loads a model (.glb or .gltf + files) from an <input> element
async function loadModel(validator: Validator): Promise<void> {
  try {
    // ensure the latest settings in the form are loaded, if the user did not save and close
    validator.schema.loadFromSchemaObject(getSchemaFromForm());
    const input = $('modelInput') as HTMLInputElement;
    const modelCubeSvg = $('modelCubeSvg');
    const modelLoadingSpinner = $('modelLoadingSpinner');

    // Show a loading spinner
    // Note the animation may not play smoothly if the validator is using all of the resources
    // V2: change the loading gif to something simpler. Perhaps use css to rotate it.
    modelCubeSvg.style.display = 'none';
    modelLoadingSpinner.style.display = 'block';

    // Use the validator to load the model from the files array (can be just a single .glb file or .gltf + files)
    await validator.model.loadFromFileInput(Array.from(input.files));

    // Remove the loading cube
    modelCubeSvg.style.display = '';
    modelLoadingSpinner.style.display = 'none';

    if (validator.model.loaded) {
      // Show the 3D viewer
      $('modelIcon').classList.remove('fail');
      $('modelLoader').style.display = 'none';
      $('model3dView').style.display = 'block';

      // Use Babylon with a white background to render the model
      const canvas = $('modelCanvas') as HTMLCanvasElement;
      const engine = new Engine(canvas);
      const scene = new Scene(engine);
      scene.clearColor = new Color4(1.0, 1.0, 1.0, 1.0);

      // Position the camera based on the model's bounding box
      const height = validator.model.height.value as number;
      const length = validator.model.length.value as number;
      const width = validator.model.width.value as number;
      const cameraRadius = height + width + length;
      const minDimension = Math.min(height, length, width);
      const maxDimension = Math.max(height, length, width);
      const camera = new ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 2.5,
        cameraRadius,
        new Vector3(0, height / 2, 0),
        scene,
      );
      camera.lowerRadiusLimit = cameraRadius / 2;
      camera.upperRadiusLimit = (cameraRadius * 3) / 2;
      camera.minZ = minDimension / 10;
      camera.maxZ = maxDimension * 10;
      camera.panningDistanceLimit = cameraRadius / 2;
      camera.attachControl(canvas, true);

      // Add a light at the top the same distance as the initial camera radius
      new HemisphericLight('light', new Vector3(0, cameraRadius, 0), scene);

      // Start Babylon
      engine.runRenderLoop(() => scene.render());

      // Load the model using the GLB data from the validator
      const assetArrayBuffer = validator.model.glb.getBytes();
      if (assetArrayBuffer) {
        // Single glb with data available from the validator
        const assetBlob = new Blob([assetArrayBuffer]);
        const assetUrl = URL.createObjectURL(assetBlob);
        await SceneLoader.AppendAsync(assetUrl, undefined, scene, undefined, '.glb');
        $('model3dView').scrollIntoView();
      } else {
        // glTF + files, load from the file input form element
        // The validator now converts .gltf multi-files into the .glb format, so
        // this else won't be called, but I'm leaving it as a demo of how to
        // load .gltf + files in Babylon
        const files = Array.from(input.files);
        let gltfFile = null as unknown as File;
        files.forEach(file => {
          FilesInputStore.FilesToLoad[file.name] = file;
          if (file.name.endsWith('gltf')) {
            gltfFile = file;
          }
        });
        if (gltfFile) {
          await SceneLoader.AppendAsync('file:', gltfFile, scene);
        }
      }
    } else {
      $('modelIcon').classList.add('fail');
    }

    // Show the report
    renderReport(validator);
  } catch (err) {
    $('modelIcon').classList.add('fail');
    reportError((err as Error).message);
  }
}

// Read product info from a json file
async function loadProductInfo(validator: Validator): Promise<void> {
  try {
    const input = $('productInfoInput') as HTMLInputElement;
    // V2: add another function that takes a json object with the product data
    // that would make it easier to add editable input fields on the frontend
    await validator.productInfo.loadFromFileInput(input.files[0]);
    if (validator.productInfo.loaded) {
      $('productInfoIcon').classList.remove('fail');
      $('productInfoIcon').classList.add('pass');
    } else {
      $('productInfoIcon').classList.remove('pass');
      $('productInfoIcon').classList.add('fail');
    }

    // Try to render the report, which will rerun it if already run
    // The report won't be ready if the model hasn't been loaded yet
    renderReport(validator);
  } catch (err) {
    $('productInfoIcon').classList.remove('pass');
    $('productInfoIcon').classList.add('fail');
    reportError((err as Error).message);
  }
}

// Read schema data from a json file
async function loadSchema(validator: Validator): Promise<void> {
  try {
    // If there is a report already shown, get rid of it
    clearReport();
    const input = $('schemaInput') as HTMLInputElement;
    await validator.schema.loadFromFileInput(input.files[0]);
    // V2: Additional front-end validation and error messaging would be helpful
    if (validator.schema.loaded) {
      setSchemaFormFromValidator(validator);
      $('schemaIcon').classList.remove('fail');
      $('schemaIcon').classList.add('pass');
    } else {
      $('schemaIcon').classList.remove('pass');
      $('schemaIcon').classList.add('fail');
    }

    // Show the report if, it is ready (model already loaded), but generally
    // it is recommended to load the model last, in which case this does nothing
    // Tests that need vertex indices calculated are slow, so they are not
    // enabled by default. If the model is loaded before the schema, those
    // indices are not calculated because the validator does not yet know
    // if they are required.
    // V2: take out renderReport and don't allow the schema to be changed after the model is loaded
    renderReport(validator);
  } catch (err) {
    $('schemaIcon').classList.remove('pass');
    $('schemaIcon').classList.add('fail');
    reportError((err as Error).message);
  }
}

// Stop event propagation
function preventDefaults(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

// Un-highlight drag and drop element
function removeHighlightClass(element: HTMLElement) {
  element.classList.remove('highlight');
}

// Show the report if both the schema and the model have been loaded
function renderReport(validator: Validator) {
  try {
    if (!validator.schema.loaded || !validator.model.loaded) {
      // the report requires both files to be loaded
      return;
    }
    // generate (or re-generate) the report
    validator.generateReport();

    // show the results
    const reportTable = $('report');
    clearReport();
    validator.report.getItems().forEach((item: any) => {
      const row = document.createElement('tr');
      const name = document.createElement('td');

      // Test Name
      name.setAttribute('class', 'report-item-name');
      name.appendChild(document.createTextNode(item.name + ':'));
      row.appendChild(name);

      // PASS | FAIL | NOT TESTED
      const result = document.createElement('td');
      result.setAttribute('class', 'report-item-value');
      result.setAttribute('class', !item.tested ? 'not-tested' : item.pass ? 'pass' : 'fail');
      const resultText = !item.tested ? 'NOT TESTED' : item.pass ? 'PASS' : 'FAIL';
      result.appendChild(document.createTextNode(resultText));
      row.appendChild(result);

      // Info Message
      const message = document.createElement('td');
      message.setAttribute('class', 'report-item-message');
      message.setAttribute('class', !item.tested ? 'not-tested' : item.pass ? 'not-tested' : 'fail');
      message.appendChild(document.createTextNode(item.message));
      // Display extra info from the glTF Validator report
      if (item.name == 'glTF Validator') {
        if (validator.model.gltfValidatorReport.issues.messages.length > 0) {
          const ul = document.createElement('ul');
          const error_names = ['Error', 'Warning', 'Info', 'Hint'];
          validator.model.gltfValidatorReport.issues.messages.forEach(
            (message: GltfValidatorReportIssuesMessageInterface) => {
              const li = document.createElement('li');
              li.appendChild(
                document.createTextNode(error_names[message.severity] + ': ' + message.message + ' ' + message.pointer),
              );
              ul.appendChild(li);
            },
          );
          message.appendChild(ul);
        }
      }
      row.appendChild(message);

      // Component specific message (such as which file failed). Not available for all tests.
      const componentMessage = document.createElement('td');
      componentMessage.appendChild(document.createTextNode(item.componentMessage));
      row.appendChild(componentMessage);

      // Link to more information about what the test covers
      const url = document.createElement('td');
      url.setAttribute('class', 'report-item-url');
      const urlLink = document.createElement('a');
      urlLink.setAttribute('href', item.guidelinesUrl);
      urlLink.appendChild(document.createTextNode('Reference Link'));
      url.appendChild(urlLink);
      row.appendChild(url);

      reportTable.appendChild(row);
    });

    // Download report (json / csv) buttons
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '5');
    td.setAttribute('style', 'text-align:center');

    // JSON
    const downloadJsonButton = document.createElement('button');
    downloadJsonButton.setAttribute('class', 'download');
    downloadJsonButton.onclick = () => {
      downloadReportJson(validator);
    };
    downloadJsonButton.appendChild(document.createTextNode('Download Report in JSON'));
    td.appendChild(downloadJsonButton);
    td.appendChild(document.createTextNode(' '));

    // CSV
    const downloadCsvButton = document.createElement('button');
    downloadCsvButton.setAttribute('class', 'download');
    downloadCsvButton.onclick = () => {
      downloadReportCsv(validator);
    };
    downloadCsvButton.appendChild(document.createTextNode('Download Report in CSV'));
    td.appendChild(downloadCsvButton);
    tr.appendChild(td);
    reportTable.appendChild(tr);
  } catch (err) {
    reportError((err as Error).message);
  }
}

// Log an error to the console
function reportError(message: string) {
  console.log('ERROR: ' + message);
}

// Action when the user clicks the save and close button
function saveAndCloseSchema(validator: Validator) {
  validator.schema.loadFromSchemaObject(getSchemaFromForm());
  renderReport(validator);
  toggleEditSchema(validator);
}

// The validator can provided 3D Commerce recommended values
function setSchemaWithRecommended(validator: Validator) {
  updateSchemaForm(validator.schema.getRecommended());
  validator.schema.loadFromSchemaObject(getSchemaFromForm());
  renderReport(validator); // if the model is already loaded
}

// Populates the form with the values already set in the validator
function setSchemaFormFromValidator(validator: Validator) {
  updateSchemaForm(validator.schema.getJsonObject());
}

// Action when the user clicks the Edit Schema button
function toggleEditSchema(validator: Validator) {
  if ($('editSchemaButton').style.display === 'none') {
    // Hide form
    $('schemaSettings').style.display = 'none';
    $('editSchemaButton').style.display = 'block';
  } else {
    // Show form
    setSchemaFormFromValidator(validator);
    $('schemaSettings').style.display = 'block';
    $('editSchemaButton').style.display = 'none';
  }
}

// Set all of the form inputs to match the provided schema values
function updateSchemaForm(schema: SchemaJSONInterface) {
  ($('formVersion') as HTMLInputElement).value = schema.version;
  // File Size
  ($('formFileSizeMax') as HTMLInputElement).value = schema.fileSizeInKb.maximum.toString();
  ($('formFileSizeMin') as HTMLInputElement).value = schema.fileSizeInKb.minimum.toString();
  // Number of Materials
  ($('formMaterialCountMax') as HTMLInputElement).value = schema.materials.maximum.toString();
  ($('formMaterialCountMin') as HTMLInputElement).value = schema.materials.minimum.toString();
  // Number of Nodes / Meshes / Primitives
  ($('formNodeCountMax') as HTMLInputElement).value = schema.model.objectCount.nodes.maximum.toString();
  ($('formNodeCountMin') as HTMLInputElement).value = schema.model.objectCount.nodes.minimum.toString();
  ($('formMeshCountMax') as HTMLInputElement).value = schema.model.objectCount.meshes.maximum.toString();
  ($('formMeshCountMin') as HTMLInputElement).value = schema.model.objectCount.meshes.minimum.toString();
  ($('formPrimitiveCountMax') as HTMLInputElement).value = schema.model.objectCount.primitives.maximum.toString();
  ($('formPrimitiveCountMin') as HTMLInputElement).value = schema.model.objectCount.primitives.minimum.toString();
  // Beveled Edges (also known as no hard edges)
  ($('formBeveledEdgesYes') as HTMLInputElement).checked = schema.model.requireBeveledEdges;
  ($('formBeveledEdgesNo') as HTMLInputElement).checked = !schema.model.requireBeveledEdges;
  // Clean Transform
  ($('formCleanTransformsYes') as HTMLInputElement).checked = schema.model.requireCleanRootNodeTransform;
  ($('formCleanTransformsNo') as HTMLInputElement).checked = !schema.model.requireCleanRootNodeTransform;
  // Manifold Edges
  ($('formRequireManifoldEdgesYes') as HTMLInputElement).checked = schema.model.requireManifoldEdges;
  ($('formRequireManifoldEdgesNo') as HTMLInputElement).checked = !schema.model.requireManifoldEdges;
  // Triangle Count
  ($('formTriangleCountMax') as HTMLInputElement).value = schema.model.triangles.maximum.toString();
  ($('formTriangleCountMin') as HTMLInputElement).value = schema.model.triangles.minimum.toString();
  // Height (bounds)
  ($('formModelHeightMax') as HTMLInputElement).value = schema.product.dimensions.height.maximum.toString();
  ($('formModelHeightMin') as HTMLInputElement).value = schema.product.dimensions.height.minimum.toString();
  ($('formModelHeightTolerance') as HTMLInputElement).value =
    schema.product.dimensions.height.percentTolerance.toString();
  // Length (bounds)
  ($('formModelLengthMax') as HTMLInputElement).value = schema.product.dimensions.length.maximum.toString();
  ($('formModelLengthMin') as HTMLInputElement).value = schema.product.dimensions.length.minimum.toString();
  ($('formModelLengthTolerance') as HTMLInputElement).value =
    schema.product.dimensions.length.percentTolerance.toString();
  // Width (bounds)
  ($('formModelWidthMax') as HTMLInputElement).value = schema.product.dimensions.width.maximum.toString();
  ($('formModelWidthMin') as HTMLInputElement).value = schema.product.dimensions.width.minimum.toString();
  ($('formModelWidthTolerance') as HTMLInputElement).value =
    schema.product.dimensions.width.percentTolerance.toString();
  // Texture Hight
  ($('formTextureHeightMax') as HTMLInputElement).value = schema.textures.height.maximum.toString();
  ($('formTextureHeightMin') as HTMLInputElement).value = schema.textures.height.minimum.toString();
  // Texture Width
  ($('formTextureWidthMax') as HTMLInputElement).value = schema.textures.width.maximum.toString();
  ($('formTextureWidthMin') as HTMLInputElement).value = schema.textures.width.minimum.toString();
  // PBR Range
  ($('formPbrColorRangeMax') as HTMLInputElement).value = schema.textures.pbrColorRange.maximum.toString();
  ($('formPbrColorRangeMin') as HTMLInputElement).value = schema.textures.pbrColorRange.minimum.toString();
  // Power of 2 Textures
  ($('formTexturesPowerOfTwoYes') as HTMLInputElement).checked = schema.textures.requireDimensionsBePowersOfTwo;
  ($('formTexturesPowerOfTwoNo') as HTMLInputElement).checked = !schema.textures.requireDimensionsBePowersOfTwo;
  // Quadratic Textures
  ($('formTexturesQuadraticYes') as HTMLInputElement).checked = schema.textures.requireDimensionsBeQuadratic;
  ($('formTexturesQuadraticNo') as HTMLInputElement).checked = !schema.textures.requireDimensionsBeQuadratic;
  // UV Spacing (gutter width)
  ($('formUvGutterWidth256') as HTMLInputElement).value = schema.uvs.gutterWidth.resolution256.toString();
  ($('formUvGutterWidth512') as HTMLInputElement).value = schema.uvs.gutterWidth.resolution512.toString();
  ($('formUvGutterWidth1024') as HTMLInputElement).value = schema.uvs.gutterWidth.resolution1024.toString();
  ($('formUvGutterWidth2048') as HTMLInputElement).value = schema.uvs.gutterWidth.resolution2048.toString();
  ($('formUvGutterWidth4096') as HTMLInputElement).value = schema.uvs.gutterWidth.resolution4096.toString();
  // Texel Density
  ($('formPixelsPerMeterMax') as HTMLInputElement).value = schema.uvs.pixelsPerMeter.maximum.toString();
  ($('formPixelsPerMeterMin') as HTMLInputElement).value = schema.uvs.pixelsPerMeter.minimum.toString();
  // Inverted UVs
  ($('formUvsNotInvertedYes') as HTMLInputElement).checked = schema.uvs.requireNotInverted;
  ($('formUvsNotInvertedNo') as HTMLInputElement).checked = !schema.uvs.requireNotInverted;
  // Overlapping UVs
  ($('formUvsNotOverlappingYes') as HTMLInputElement).checked = schema.uvs.requireNotOverlapping;
  ($('formUvsNotOverlappingNo') as HTMLInputElement).checked = !schema.uvs.requireNotOverlapping;
  // UVs in 0-1 Range
  ($('formUvsInRange01Yes') as HTMLInputElement).checked = schema.uvs.requireRangeZeroToOne;
  ($('formUvsInRange01No') as HTMLInputElement).checked = !schema.uvs.requireRangeZeroToOne;
}

// Main function
document.body.onload = () => {
  // Global validator object
  var validator = new Validator();

  // Setup Button Actions
  $('editSchemaButton').onclick = () => {
    toggleEditSchema(validator);
  };
  $('closeSchemaButton').onclick = () => {
    toggleEditSchema(validator);
  };
  $('saveAndCloseSchemaButton').onclick = () => {
    saveAndCloseSchema(validator);
  };
  $('schemaDefaults').onclick = () => {
    setSchemaWithRecommended(validator);
  };
  $('downloadSchemaJson').onclick = downloadSchemaJson;

  // Load default schema
  setSchemaWithRecommended(validator);

  // Show the version
  $('version').appendChild(document.createTextNode('Version: ' + validator.version));
  setSchemaFormFromValidator(validator);

  // Set up drag and drop area highlighting
  ['modelDropArea', 'productInfoDropArea', 'schemaDropArea'].forEach(elementName => {
    ['dragenter', 'dragover'].forEach(eventName => {
      $(elementName).addEventListener(eventName, ev => {
        preventDefaults(ev);
        addHighlightClass($(elementName));
      });
    });
    $(elementName).addEventListener('dragleave', ev => {
      preventDefaults(ev);
      removeHighlightClass($(elementName));
    });
  });

  // Set up drag and drop model load
  $('modelDropArea').addEventListener('drop', ev => {
    preventDefaults(ev);
    removeHighlightClass($('modelDropArea'));
    ($('modelInput') as HTMLInputElement).files = ev.dataTransfer.files;
    loadModel(validator);
  });

  // Set up drag and drop product info load
  $('productInfoDropArea').addEventListener('drop', ev => {
    preventDefaults(ev);
    removeHighlightClass($('productInfoDropArea'));
    ($('productInfoInput') as HTMLInputElement).files = ev.dataTransfer.files;
    loadProductInfo(validator);
  });

  // Set up drag and drop schema load
  $('schemaDropArea').addEventListener('drop', ev => {
    preventDefaults(ev);
    removeHighlightClass($('schemaDropArea'));
    ($('schemaInput') as HTMLInputElement).files = ev.dataTransfer.files;
    loadSchema(validator);
  });

  // Add listeners to traditional file input elements
  $('modelInput').addEventListener('change', ev => {
    loadModel(validator);
  });

  $('productInfoInput').addEventListener('change', ev => {
    loadProductInfo(validator);
  });

  $('schemaInput').addEventListener('change', ev => {
    loadSchema(validator);
  });
};
