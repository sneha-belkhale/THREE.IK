const t = new THREE.Vector3();
const q = new THREE.Quaternion();
const p = new THREE.Plane();
const FORWARD = new THREE.Vector3(0,0,1);
var RESETQUAT = new THREE.Quaternion();

function getAlignmentQuaternion(fromDir, toDir) {
  const adjustAxis = t.crossVectors(fromDir, toDir).normalize();
  const adjustAngle = fromDir.angleTo(toDir);
  if (adjustAngle) {
    const adjustQuat = q.setFromAxisAngle(adjustAxis, adjustAngle);
    return adjustQuat;
  }
  return null;
}

function getOriginalWorldPositions(rootBone) {
  var worldPositions = []
  var currentBone = rootBone;
  while(currentBone) {
    worldPositions.push(currentBone.getWorldPosition(new THREE.Vector3()))
    currentBone = currentBone.children[0];
  }
  return worldPositions;
}

function setZForward(rootBone) {
  //get a list of world positions
  var worldPositions = getOriginalWorldPositions(rootBone);
  var parentBone = rootBone;
  var i = 1;
  //iterate down the chain
  //TODO: support bone heirarchies -- only supports single chain now.
  while (parentBone) {
    var childBone = parentBone.children[0];
    if (childBone) {
      //reset parent bone quaternion
      parentBone.quaternion.copy(RESETQUAT);
      parentBone.updateMatrixWorld();
      //get the child bone position in local coordinates
      var childBonePosWorld = worldPositions[i].clone();
      var childBoneDir = parentBone.worldToLocal(childBonePosWorld.clone()).normalize();
      //set the direction to child bone to the forward direction
      var quat = getAlignmentQuaternion(FORWARD, childBoneDir);
      if (quat) {
        //rotate parent bone towards child bone
        parentBone.quaternion.premultiply(quat);
        parentBone.updateMatrixWorld();
        //set child bone position relative to the new parent matrix.
        parentBone.worldToLocal(childBonePosWorld);
        childBone.position.copy(childBonePosWorld);
      }
    }
    parentBone = parentBone.children[0];
    i++;
  }
}
