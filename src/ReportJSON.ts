export interface ReportJSONInterface {
  version: string;
  pass: boolean;
  gltfValidator: {
    errors: number;
    hints: number;
    info: number;
    pass: boolean;
    warnings: number;
  };
  fileSizeInKb: {
    pass: boolean | null;
    tested: boolean;
    value: number | null;
  };
  materialCount: {
    pass: boolean | null;
    tested: boolean;
    value: number | null;
  };
  model: {
    objectCount: {
      nodes: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
      meshes: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
      primitives: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
    };
    requireBeveledEdges: {
      pass: boolean | null;
      tested: boolean;
    };
    requireCleanRootNodeTransform: {
      pass: boolean | null;
      tested: boolean;
    };
    requireManifoldEdges: {
      pass: boolean | null;
      tested: boolean;
    };
    triangles: {
      pass: boolean | null;
      tested: boolean;
      value: number | null;
    };
  };
  product: {
    overallDimensions: {
      pass: boolean | null;
      tested: boolean;
      height: {
        value: number | null;
      };
      length: {
        value: number | null;
      };
      width: {
        value: number | null;
      };
    };
    productDimensions: {
      pass: boolean | null;
      tested: boolean;
      height: {
        value: number | null;
      };
      length: {
        value: number | null;
      };
      width: {
        value: number | null;
      };
    };
  };
  textures: {
    height: {
      maximum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
      minimum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
    };
    pbrColorRange: {
      maximum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
      minimum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
    };
    requireDimensionsBePowersOfTwo: {
      pass: boolean | null;
      tested: boolean;
    };
    requireDimensionsBeQuadratic: {
      pass: boolean | null;
      tested: boolean;
    };
    width: {
      maximum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
      minimum: {
        pass: boolean | null;
        tested: boolean;
        value: number | null;
      };
    };
  };
  uvs: {
    gutterWidth: {
      pass: boolean | null;
      tested: boolean;
    };
    pixelsPerMeter: {
      maximum: {
        pass: boolean | null;
        tested: boolean;
        value: number;
      };
      minimum: {
        pass: boolean | null;
        tested: boolean;
        value: number;
      };
    };
    requireNotInverted: {
      pass: boolean | null;
      tested: boolean;
    };
    requireNotOverlapping: {
      pass: boolean | null;
      tested: boolean;
    };
    requireRangeZeroToOne: {
      pass: boolean | null;
      tested: boolean;
    };
  };
}

// Returns the report as a JSON object that can be ingested by other automated systems
export class ReportJSON implements ReportJSONInterface {
  version = '';
  pass = false;
  gltfValidator = {
    errors: 0,
    hints: 0,
    info: 0,
    pass: false,
    warnings: 0,
  };
  fileSizeInKb = {
    pass: null as unknown as boolean,
    tested: false,
    value: null as unknown as number,
  };
  materialCount = {
    pass: null as unknown as boolean,
    tested: false,
    value: null as unknown as number,
  };
  model = {
    objectCount: {
      nodes: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      meshes: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      primitives: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
    },
    requireBeveledEdges: {
      pass: null as unknown as boolean,
      tested: false,
    },
    requireCleanRootNodeTransform: {
      pass: null as unknown as boolean,
      tested: false,
    },
    requireManifoldEdges: {
      pass: null as unknown as boolean,
      tested: false,
    },
    triangles: {
      pass: null as unknown as boolean,
      tested: false,
      value: null as unknown as number,
    },
  };
  product = {
    overallDimensions: {
      pass: null as unknown as boolean,
      tested: false,
      height: {
        value: null as unknown as number,
      },
      length: {
        value: null as unknown as number,
      },
      width: {
        value: null as unknown as number,
      },
    },
    productDimensions: {
      pass: null as unknown as boolean,
      tested: false,
      height: {
        value: null as unknown as number,
      },
      length: {
        value: null as unknown as number,
      },
      width: {
        value: null as unknown as number,
      },
    },
  };
  textures = {
    height: {
      maximum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      minimum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
    },
    pbrColorRange: {
      maximum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      minimum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
    },
    requireDimensionsBePowersOfTwo: {
      pass: null as unknown as boolean,
      tested: false,
    },
    requireDimensionsBeQuadratic: {
      pass: null as unknown as boolean,
      tested: false,
    },
    width: {
      maximum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      minimum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
    },
  };
  uvs = {
    gutterWidth: {
      pass: null as unknown as boolean,
      tested: false,
    },
    pixelsPerMeter: {
      maximum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
      minimum: {
        pass: null as unknown as boolean,
        tested: false,
        value: null as unknown as number,
      },
    },
    requireNotInverted: {
      pass: null as unknown as boolean,
      tested: false,
    },
    requireNotOverlapping: {
      pass: null as unknown as boolean,
      tested: false,
    },
    requireRangeZeroToOne: {
      pass: null as unknown as boolean,
      tested: false,
    },
  };

  constructor(
    version: string,
    pass: boolean,
    gltfValidatorErrors: number,
    gltfValidatorHints: number,
    gltfValidatorInfo: number,
    gltfValidatorWarnings: number,
  ) {
    this.version = version;
    this.pass = pass;
    this.gltfValidator.errors = gltfValidatorErrors;
    this.gltfValidator.hints = gltfValidatorHints;
    this.gltfValidator.info = gltfValidatorInfo;
    this.gltfValidator.pass = gltfValidatorErrors === 0;
    this.gltfValidator.warnings = gltfValidatorWarnings;
  }
}
