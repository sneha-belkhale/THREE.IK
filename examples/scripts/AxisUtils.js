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

  function getOriginalWorldPositions(rootBone, worldPos) {
    rootBone.children.forEach((child) => {
      var childWorldPos = child.getWorldPosition(new THREE.Vector3())
      worldPos[child.id] = childWorldPos;
      getOriginalWorldPositions(child, worldPos)
    })
  }

  function setZForward(rootBone) {
    var worldPos = {}
    getOriginalWorldPositions(rootBone, worldPos)
    updateTransformations(rootBone, worldPos);
  }

  function updateTransformations(parentBone, worldPos) {

      var averagedDir = new THREE.Vector3();
      parentBone.children.forEach((childBone) => {
        //average the child bone world pos
        var childBonePosWorld = worldPos[childBone.id];
        averagedDir.add(childBonePosWorld);
      });

      averagedDir.multiplyScalar(1/(parentBone.children.length));

      //set quaternion
      parentBone.quaternion.copy(RESETQUAT);
      parentBone.updateMatrixWorld();
      //get the child bone position in local coordinates
      var childBoneDir = parentBone.worldToLocal(averagedDir).normalize();
      //set the direction to child bone to the forward direction
      var quat = getAlignmentQuaternion(FORWARD, childBoneDir);
      if (quat) {
        //rotate parent bone towards child bone
        parentBone.quaternion.premultiply(quat);
        parentBone.updateMatrixWorld();
        //set child bone position relative to the new parent matrix.
        parentBone.children.forEach((childBone) => {
          var childBonePosWorld = worldPos[childBone.id].clone();
          parentBone.worldToLocal(childBonePosWorld);
          childBone.position.copy(childBonePosWorld);
        });
      }

      parentBone.children.forEach((childBone) => {
        updateTransformations(childBone, worldPos);
      })
  }
