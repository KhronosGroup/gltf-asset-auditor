import chalk from "chalk"; // For colored output
import fs from "fs";
import path from "path";
import { Validator } from "@mikefesta/3dc-validator";
import { argv, exit } from "process";

let glbFilename = "";
let gltfFileName = "";
let gltfSupportingFiles = [];
let i = 0;
let jsonNoArgumentFileCount = 0;
let jsonNoArgumentFilename = "";
let outputIndex = -1;
let outputCsvFilename = "";
let outputJsonFilename = "";
let productInfoIndex = -1;
let productInfoFilename = "";
let schemaIndex = -1;
let schemaFilename = "";
let quietMode = false;

// Suppress console.log messages if the -q flag was set
const printIfNotQuiet = (message) => {
  if (!quietMode) {
    console.log(message);
  }
};

argv.forEach((arg) => {
  // 0: node full path
  // 1: index.js location
  // optional arguments:
  // -o output filename (ends with .json or .csv)
  // -p product dimensions (ends with .json)
  // required arguments:
  // -s schema (ends with .json)
  // -q quiet mode
  // .glb or .gltf + .bin (+ images)

  // Supported file extensions
  if (arg.endsWith(".csv")) {
    outputCsvFilename = arg;
  } else if (arg.endsWith(".glb")) {
    glbFilename = arg;
  } else if (arg.endsWith(".gltf")) {
    gltfFileName = arg;
  } else if (arg.endsWith(".json")) {
    // .json can be for the schema, product info, or output
    if (i == outputIndex) {
      // -o
      outputJsonFilename = arg;
    } else if (i == productInfoIndex) {
      // -p
      productInfoFilename = arg;
    } else if (i == schemaIndex) {
      // -s
      schemaFilename = arg;
    } else {
      // json file without an argument
      jsonNoArgumentFilename = arg;
      // If only one .json filename is provided without an argument, treat it as the schema
      jsonNoArgumentFileCount++;
    }
  } else if (
    [".bin", ".jpg", "jpeg", ".ktx", "ktx2", ".png", "webp"].includes(
      arg.slice(-4)
    )
  ) {
    // TODO: I believe these are the only file extensions supported, but user testing my reveal others
    gltfSupportingFiles.push(arg);
  }

  // Flags
  if (arg == "-o") {
    // output to a .csv or .json or both
    // If no file name is provided, it defaults to {model_name} + timestamp.json
    outputIndex = i + 1;
  }
  if (arg == "-p") {
    // specify product information (dimensions)
    productInfoIndex = i + 1;
  }
  if (arg == "-s") {
    // specify the schema (optional). A .json file without a preceding argument will be treated as the schema.
    schemaIndex = i + 1;
  }
  if (arg == "-q") {
    // Prevent console messages
    quietMode = true;
  }

  i++;
});

// Verify that either a glb or gltf was provided
if (glbFilename == "" && gltfFileName == "") {
  printIfNotQuiet(chalk.red("A .glb or .gltf file needs to be provided"));
  exit(1);
}

// If only one .json file name was provided without an argument, treat it as the schema
if (jsonNoArgumentFileCount == 1) {
  schemaFilename = jsonNoArgumentFilename;
}

// If just -o was provided without a filename ending in csv or json, generate a filename
if (outputIndex > 0 && outputJsonFilename == "" && outputCsvFilename == "") {
  const date = new Date();
  const timestamp = [
    date.getFullYear(),
    ("0" + (date.getMonth() + 1)).slice(-2),
    ("0" + date.getDate()).slice(-2),
    ("0" + date.getHours()).slice(-2),
    ("0" + date.getMinutes()).slice(-2),
    ("0" + date.getSeconds()).slice(-2),
  ].join("-");
  if (glbFilename) {
    outputJsonFilename =
      glbFilename.substring(
        glbFilename.lastIndexOf(path.sep) + 1,
        glbFilename.length - 4
      ) +
      "-3DQC-" +
      timestamp +
      ".json";
  } else if (gltfFileName) {
    outputJsonFilename =
      gltfFileName.substring(
        gltfFileName.lastIndexOf(path.sep) + 1,
        gltfFileName.length - 5
      ) +
      "-3DQC-" +
      timestamp +
      ".json";
  }
}

// Verify that a schema was provided
if (schemaFilename == "") {
  printIfNotQuiet(chalk.red("A schema file needs to be provided"));
  exit(1);
}

if (
  gltfFileName &&
  !gltfSupportingFiles.map((i) => i.slice(-4)).includes(".bin")
) {
  printIfNotQuiet(
    chalk.red(
      "Using a .gltf file also needs to include a .bin file plus external textures"
    )
  );
  exit(1);
}

// Print a message at the start of the program
const printWelcomeMessage = (version) => {
  printIfNotQuiet(chalk.green("-- 3D COMMERCE VALIDATOR --"));
  printIfNotQuiet(chalk.yellow("* Version: " + version));
};

// START
try {
  const startTime = Date.now();
  const validator = new Validator();
  validator.decimalDisplayPrecision = 2;
  printWelcomeMessage(validator.version);

  // 1. Load Schema (schema should be loaded before model to know if index calculation is required)
  await validator.schema.loadFromFileSystem(schemaFilename);

  // 2. Load GLB or GLTF + files
  // If a glb path exists, use it, otherwise use the gltf and supporting files
  let fileList = glbFilename
    ? [glbFilename]
    : [gltfFileName, ...gltfSupportingFiles];
  await validator.model.loadFromFileSystem(fileList);

  // 3. Load Product Info (optional)
  if (productInfoFilename) {
    await validator.productInfo.loadFromFileSystem(productInfoFilename);
  }

  // 4. Run Validation
  validator.generateReport();

  // Helpful to print the whole JSON object for testing during development
  //printIfNotQuiet(validator);

  // 5. Show Report
  // for formatting, find the length of the longest name
  let longestNameLength = 0;
  let hasNotTestedItems = false;
  validator.report.getItems().forEach((item) => {
    if (item.name.length > longestNameLength) {
      longestNameLength = item.name.length;
    }
    if (item.tested === false) {
      hasNotTestedItems = true;
    }
  });
  printIfNotQuiet(chalk.magenta("==== Validation Report ===="));
  // Loop through all available items in the report and print their status
  validator.report.getItems().forEach((item) => {
    let itemNameFormatted = item.name + ": ";
    for (let i = item.name.length; i < longestNameLength; i++) {
      itemNameFormatted = " " + itemNameFormatted;
    }
    printIfNotQuiet(
      itemNameFormatted +
        (item.tested
          ? item.pass
            ? chalk.green("PASS" + (hasNotTestedItems ? "      " : ""))
            : chalk.red("FAIL" + (hasNotTestedItems ? "      " : ""))
          : chalk.gray("NOT TESTED")) +
        " | " +
        chalk.gray(item.message)
    );
  });
  printIfNotQuiet(chalk.magenta("==========================="));
  printIfNotQuiet(
    "Total Time: " + ((Date.now() - startTime) / 1000).toFixed(3) + " seconds."
  );
  if (outputCsvFilename) {
    await fs.writeFileSync(
      outputCsvFilename,
      validator.getReportCsv(),
      {},
      (err) => {
        if (err) {
          printIfNotQuiet("there was an error writing the csv file");
        }
      }
    );
  }
  if (outputJsonFilename) {
    await fs.writeFileSync(
      outputJsonFilename,
      validator.getReportJson(),
      {},
      (err) => {
        if (err) {
          printIfNotQuiet("there was an error writing the csv file");
        }
      }
    );
  }
} catch (err) {
  if (err) {
    printIfNotQuiet(chalk.red("ERROR: " + err.message));
  } else {
    printIfNotQuiet(chalk.red("ERROR: unknown"));
  }
}

exit(0);
