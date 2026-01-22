import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';

export interface Vector3LoadableAttributeInterface {
  x: LoadableAttributeInterface<number>;
  y: LoadableAttributeInterface<number>;
  z: LoadableAttributeInterface<number>;
}

export interface NodeTransformInterface {
  location: Vector3LoadableAttributeInterface;
  rotation: Vector3LoadableAttributeInterface;
  scale: Vector3LoadableAttributeInterface;
  isClean: () => boolean;
  locationIsZero: () => boolean;
  rotationIsZero: () => boolean;
  scaleIsOne: () => boolean;
}

// Location, Rotation, and Scale data, used to check the Root Node
export class NodeTransform implements NodeTransformInterface {
  location = {
    x: new LoadableAttribute('X Location', 0),
    y: new LoadableAttribute('Y Location', 0),
    z: new LoadableAttribute('Z Location', 0),
  };
  rotation = {
    x: new LoadableAttribute('X Rotation', 0),
    y: new LoadableAttribute('Y Rotation', 0),
    z: new LoadableAttribute('Z Rotation', 0),
  };
  scale = {
    x: new LoadableAttribute('X Scale', 1),
    y: new LoadableAttribute('Y Scale', 1),
    z: new LoadableAttribute('Z Scale', 1),
  };

  isClean = () => {
    // Location should be 0,0,0
    // Rotation should be 0,0,0
    // Scale should be 1,1,1
    return this.locationIsZero() && this.rotationIsZero() && this.scaleIsOne();
  };

  locationIsZero = () => {
    return this.location.x.value === 0 && this.location.y.value === 0 && this.location.z.value === 0;
  };
  rotationIsZero = () => {
    // Note: Rotation value appears to be 1/PI radians.
    return this.rotation.x.value === 0 && this.rotation.y.value === 0 && this.rotation.z.value === 0;
  };
  scaleIsOne = () => {
    return this.scale.x.value === 1 && this.scale.y.value === 1 && this.scale.z.value === 1;
  };
}
