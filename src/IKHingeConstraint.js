import { Quaternion, Matrix4, Vector3, Plane, Math as ThreeMath } from 'three';
import { transformPoint, getCentroid, getWorldPosition, setQuaternionFromDirection } from './utils.js';

const Z_AXIS = new Vector3(0, 0, -1);
const X_AXIS = new Vector3(1, 0, 0);

const { DEG2RAD, RAD2DEG } = ThreeMath;

/**
 * A class for a constraint.
 */
class IKHingeConstraint {
  /**
   * Pass in an angle value in degrees.
   *
   * @param {number} angle
   */
  constructor(angle, axis, scene) {
    this.axis = axis;
    this.angle = angle;
    this.type = "hinge"
    this.rotationPlane = new Plane(this.axis);
    this.scene = scene;
  }

  /**
   * Applies a constraint to passed in IKJoint, updating
   * its direction if necessary. Returns a boolean indicating
   * if the constraint was applied or not.
   *
   * @param {IKJoint} joint
   * @private
   * @return {boolean}
   */
  _apply(joint) {
    // Get direction of joint and parent in world space
    const direction = new Vector3().copy(joint._getDirection());
    const parentDirection = joint._localToWorldDirection(new Vector3().copy(Z_AXIS)).normalize();
    const rotationPlaneNormal = joint._localToWorldDirection(new Vector3().copy(this.axis)).normalize();
    this.rotationPlane.normal = rotationPlaneNormal;
    var projectedDir = this.rotationPlane.projectPoint(direction, new Vector3())

    var parentDirectionProjected = this.rotationPlane.projectPoint(parentDirection, new Vector3())
    var currentAngle = projectedDir.angleTo(parentDirectionProjected) * RAD2DEG;

    var cross = new Vector3().crossVectors(projectedDir, parentDirectionProjected)
    if(cross.dot(rotationPlaneNormal) > 0){
      currentAngle += 180;
    }

    if(currentAngle > this.angle){
      parentDirectionProjected.applyAxisAngle(rotationPlaneNormal, this.angle/RAD2DEG);
      joint._setDirection(parentDirectionProjected);
    } else {
      joint._setDirection(projectedDir);
    }

  }
}

export default IKHingeConstraint;
