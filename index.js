const Elem = {
  getMv: function(elem) {
    const mv = glMatrix.mat4.create();
    const parentMv = elem.parent ? Elem.getMv(elem.parent) : glMatrix.mat4.create();
    const localMv = elem.mv ? elem.mv : glMatrix.mat4.create();
    return glMatrix.mat4.mul(mv, parentMv, localMv);
  }
}

const Model = {
  draw: function(gl, model, light, camera) {
    gl.useProgram(gl.program);

    if (!model._) {
      model._ = {};
    }

    if (!model._.elementBuffer) {
      model._.elementBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model._.elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.obj.positionIndices), gl.STATIC_DRAW);

    if (!model._.vertexPositionAttribute || !model._.vertexPositionBuffer) {
      model._.vertexPositionAttribute = gl.getAttribLocation(gl.program, "aVertexPosition");
      model._.vertexPositionBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, model._.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.obj.positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(model._.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(model._.vertexPositionAttribute);

    if (!model._.vertexNormalAttribute || !model._.vertexNormalBuffer) {
      model._.vertexNormalAttribute = gl.getAttribLocation(gl.program, "aVertexNormal");
      model._.vertexNormalBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, model._.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.obj.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(model._.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(model._.vertexNormalAttribute);

    if (!model._.textureCoordAttribute || !model._.textureCoordBuffer) {
      model._.textureCoordAttribute = gl.getAttribLocation(gl.program, "aTextureCoord");
      model._.textureCoordBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, model._.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.obj.uvs), gl.STATIC_DRAW);
    gl.vertexAttribPointer(model._.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(model._.textureCoordAttribute);

    if (!model._.pMatrixUniform) {
      model._.pMatrixUniform = gl.getUniformLocation(gl.program, "uPMatrix");
    }
    gl.uniformMatrix4fv(model._.pMatrixUniform, false, Camera.getP(camera));

    if (!model._.mvMatrixUniform) {
      model._.mvMatrixUniform = gl.getUniformLocation(gl.program, "uMvMatrix");
    } 
    const cameraInvMv = Camera.getInvMv(camera);
    const finalMatirx = glMatrix.mat4.mul(glMatrix.mat4.create(), cameraInvMv, Elem.getMv(model));
    gl.uniformMatrix4fv(model._.mvMatrixUniform, false, finalMatirx);

    if (!model._.nMatrixUniform) {
      model._.nMatrixUniform = gl.getUniformLocation(gl.program, "uNMatrix");
    } 
    gl.uniformMatrix3fv(model._.nMatrixUniform, false, glMatrix.mat3.normalFromMat4(glMatrix.mat3.create(), finalMatirx));

    if (!model._.light) {
      model._.light = [];
    }
    for (let i = 0; i < light.length; i++) {
      if (!model._.light[i]) {
        model._.light[i] = {};
      }
      if (!model._.light[i].enabledUniform) {
        model._.light[i].enabledUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].enabled`);
      }
      gl.uniform1f(model._.light[i].enabledUniform, light[i].enabled ? 1.0 : 0.0);
      // console.log(light[i].enabled ? 1.0 : 0.0);
      if (!model._.light[i].positionUniform) {
        model._.light[i].positionUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].position`);
      }
      const finalLightPositionMatirx = glMatrix.mat4.mul(glMatrix.mat4.create(), cameraInvMv, Elem.getMv(light[i]));
      gl.uniform3fv(model._.light[i].positionUniform, glMatrix.vec3.transformMat4(glMatrix.vec3.create(), light[i].position, finalLightPositionMatirx));
      if (!model._.light[i].attenuationUniform) {
        model._.light[i].attenuationUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].attenuation`);
      }
      gl.uniform3fv(model._.light[i].attenuationUniform, light[i].attenuation);
      if (!model._.light[i].ambientUniform) {
        model._.light[i].ambientUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].ambient`);
      }
      gl.uniform3fv(model._.light[i].ambientUniform, light[i].ambient);
      if (!model._.light[i].diffuseUniform) {
        model._.light[i].diffuseUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].diffuse`);
      }
      gl.uniform3fv(model._.light[i].diffuseUniform, light[i].diffuse);
      if (!model._.light[i].specularUniform) {
        model._.light[i].specularUniform = gl.getUniformLocation(gl.program, `uPointLights[${i}].specular`);
      }
      gl.uniform3fv(model._.light[i].specularUniform, light[i].specular);
    }
    
    if (!model._.textureUniform) {
      model._.textureUniform = gl.getUniformLocation(gl.program, "uTexture");
    }
    gl.uniform1i(model._.textureUniform, 0);
    gl.activeTexture(gl.TEXTURE0);

    if (!model._.texture) {
      model._.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, model._.texture);
      // const ext =
      //   gl.getExtension("EXT_texture_filter_anisotropic") ||
      //   gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      //   gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      // if (ext) {
      //   const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      //   gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      // }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, model.img);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, model._.texture);

    gl.drawElements(gl.TRIANGLES, model.obj.positionIndices.length, gl.UNSIGNED_SHORT, 0);
  }
}

const Camera = {
  getP: function(cam) {
    return glMatrix.mat4.perspective(glMatrix.mat4.create(), glMatrix.glMatrix.toRadian(cam.fov), cam.aspectRatio, 0.1, 1000)
  },
  getMv: function(cam) {
    const mv = glMatrix.mat4.create();
    const parentMv = cam.parent ? Elem.getMv(cam.parent) : glMatrix.mat4.create();
    const localMv = glMatrix.mat4.create();
    glMatrix.mat4.translate(localMv, localMv, cam.position);
    glMatrix.mat4.rotateY(localMv, localMv, cam.rotationY);
    glMatrix.mat4.rotateX(localMv, localMv, cam.rotationX);
    return glMatrix.mat4.mul(mv, parentMv, localMv);;
  },
  getInvMv: function(cam) {
    return glMatrix.mat4.invert(glMatrix.mat4.create(), Camera.getMv(cam));
  },
  go: function(cam, dir) {
    const deltaVec3 = glMatrix.vec3.fromValues(...dir);
    glMatrix.vec3.rotateY(deltaVec3, deltaVec3, [0, 0, 0], cam.rotationY);
    glMatrix.vec3.add(cam.position, cam.position, deltaVec3);
  },
  rotY: function(cam, grad) {
    cam.rotationY += glMatrix.glMatrix.toRadian(grad);
  },
  rotX: function(cam, grad) {
    cam.rotationX += glMatrix.glMatrix.toRadian(grad);
  },
  processKeyPress: function(cam, event) {
    const dict = {
      "a": () => Camera.go(cam, [-0.125, 0, 0]),
      "d": () => Camera.go(cam, [0.125, 0, 0]),
      "w": () => Camera.go(cam, [0, 0, -0.125]),
      "s": () => Camera.go(cam, [0, 0, 0.125]),
      "q": () => Camera.rotY(cam, 1),
      "e": () => Camera.rotY(cam, -1),
      "2": () => Camera.rotX(cam, 1),
      "x": () => Camera.rotX(cam, -1),
      "r": () => {
        cam.position = glMatrix.vec3.create();
        cam.rotationY = 0;
        cam.rotationX = 0;
      },
    }
    const key = event.key;
    for (const propKey in dict) {
      if (key === propKey) {
        dict[propKey].call();
      }
    }
  }
}

const Light = {
  getGlobalPos: function(light) {
    glMatrix.mat4.transformPoint(Elem.getMv(light), light.position);
  },
  toggle: function(light) {
    light.enabled = !light.enabled
  }
}

const Stars = {
  draw: function(gl, stars, camera) {
    gl.useProgram(gl.program);

    if (!stars._) {
      stars._ = {};
    }

    if (!stars._.positionAttribute || !stars._.positionBuffer) {
      stars._.positionAttribute = gl.getAttribLocation(gl.program, "aPosition");
      stars._.positionBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, stars._.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars.map((star)=>star.position).flat()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(stars._.positionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(stars._.positionAttribute);

    if (!stars._.sizeAttribute || !stars._.sizeBuffer) {
      stars._.sizeAttribute = gl.getAttribLocation(gl.program, "aSize");
      stars._.sizeBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, stars._.sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars.map((star)=>star.size).flat()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(stars._.sizeAttribute, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(stars._.sizeAttribute);

    if (!stars._.colorAttribute || !stars._.colorBuffer) {
      stars._.colorAttribute = gl.getAttribLocation(gl.program, "aColor");
      stars._.colorBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, stars._.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars.map((star)=>star.color).flat()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(stars._.colorAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(stars._.colorAttribute);

    if (!stars._.pMatrixUniform) {
      stars._.pMatrixUniform = gl.getUniformLocation(gl.program, "uPMatrix");
    }
    gl.uniformMatrix4fv(stars._.pMatrixUniform, false, Camera.getP(camera));

    if (!stars._.mvMatrixUniform) {
      stars._.mvMatrixUniform = gl.getUniformLocation(gl.program, "uMvMatrix");
    } 
    const cameraMv = Camera.getInvMv(camera);
    const cameraQuat = glMatrix.mat4.getRotation(glMatrix.quat.create(), cameraMv);
    const cameraAngleY = glMatrix.quat.getAxisAngle([0, 1, 0], cameraQuat);
    const mvMatrix = glMatrix.mat4.fromQuat(glMatrix.mat4.create(), cameraQuat);
    gl.uniformMatrix4fv(stars._.mvMatrixUniform, false, mvMatrix);

    gl.drawArrays(gl.POINTS, 0, stars.length);
  }
}

function fibonacciSphere(N, radius = 1) {
  const points = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < N; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / N);
    const phi_i = 2 * Math.PI * phi * i % (2 * Math.PI);

    const x = radius * Math.sin(theta) * Math.cos(phi_i);
    const y = radius * Math.sin(theta) * Math.sin(phi_i);
    const z = radius * Math.cos(theta);
    points.push([x, y, z]);
  }
  return points;
}

const stars = fibonacciSphere(500, 500).map((position) => {
  return {
    position: position,
    size: 4 + 4 * Math.random(),
    color: [1, 1, 1, Math.random()],
  }
});

const vsSource2 = `
  attribute vec3 aPosition;
  attribute float aSize;
  attribute vec4 aColor;
  uniform mat4 uPMatrix;
  uniform mat4 uMvMatrix;
  varying vec4 vColor;
  void main(void) {
    vColor = aColor;
    gl_PointSize = aSize;
    gl_Position = uPMatrix * uMvMatrix * vec4(aPosition, 1.0);
  }
`;

const fsSource2 = `
  #ifdef GL_ES
  precision highp float;
  #endif
  varying vec4 vColor;
  void main(void) {
    vec2 pc = gl_PointCoord * 2.0 - 1.0;
    gl_FragColor = vColor;
    gl_FragColor.a *= (1.0 - length(pc) * length(pc));
  }
`;

const vsSource = `
  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;
  uniform mat4 uPMatrix;
  uniform mat4 uMvMatrix;
  uniform mat3 uNMatrix;
  varying vec2 vTextureCoord;
  varying vec3 vertexPositionEye3;
  varying vec3 normalInterp;
  void main(void) {
    vTextureCoord = aTextureCoord;
    vec4 vertexPositionEye4 = uMvMatrix * vec4(aVertexPosition, 1.0);
    vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;
    normalInterp = uNMatrix * aVertexNormal;
    gl_Position = uPMatrix * uMvMatrix * vec4(aVertexPosition, 1.0);
  }
`;

const fsSource = `
  #ifdef GL_ES
  precision highp float;
  #endif
  #define NR_POINT_LIGHTS 10
  struct PointLight {
    float enabled;   
    vec3 position;
    vec3 attenuation;  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
  };
  uniform PointLight uPointLights[NR_POINT_LIGHTS];
  uniform sampler2D uTexture;
  varying vec2 vTextureCoord;
  varying vec3 vertexPositionEye3;
  varying vec3 normalInterp;
  vec3 computeLight(vec3 vertexPositionEye3, vec3 normalInterp, PointLight light) {
    vec3 lightDirection = normalize(light.position - vertexPositionEye3);
    vec3 viewVectorEye = -normalize(vertexPositionEye3);
    vec3 normal = normalize(normalInterp);
    float distance = length(light.position - vertexPositionEye3);
    float attenuation = 1.0 / (max(light.attenuation[0] + light.attenuation[1] * distance + light.attenuation[2] * (distance * distance), 0.01));
    
    float diffuseLightDot = max(dot(normal, lightDirection), 0.0);
    
    vec3 halfwayDir = normalize(lightDirection + viewVectorEye);
    float specularLightDot = max(dot(halfwayDir, normal), 0.0);
    float specularLightParam = pow(specularLightDot, 64.0);

    vec3 ambient = light.ambient;
    vec3 diffuse = light.diffuse * diffuseLightDot;
    vec3 specular = light.specular * specularLightParam;
    return ambient + attenuation * (diffuse + specular);
  }
  void main(void) {
    vec4 color = texture2D(uTexture, vTextureCoord);
    vec3 light = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < NR_POINT_LIGHTS; i++) {
      light += computeLight(vertexPositionEye3, normalInterp, uPointLights[i]) * uPointLights[i].enabled;
    }
    gl_FragColor = vec4(color.rgb * light, color.a);
  }
`;

const GOD_OBJECT = {
  amogus: 0
};

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');

const defaultProgram = webglUtils.createProgramFromSources(gl, [vsSource, fsSource]);
const particleProgram = webglUtils.createProgramFromSources(gl, [vsSource2, fsSource2]);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// gl.clearColor(0.84, 0.92, 0.98, 1.0);
gl.clearColor(0.039, 0.059, 0.008, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.code] = false; }
window.onkeydown = function(e) { pressedKeys[e.code] = true; }

fetchData().then((data) => {
  data.camera.aspectRatio = gl.canvas.width / gl.canvas.height;
  // document.addEventListener("keypress", (event) => Camera.processKeyPress(data.camera, event));
  document.addEventListener("keypress", (event) => {
    if (event.key === "1" && data.light[0]) Light.toggle(data.light[0]);
    if (event.key === "2" && data.light[1]) Light.toggle(data.light[1]);
    if (event.key === "3" && data.light[2]) Light.toggle(data.light[2]);
    if (event.key === "4" && data.light[3]) Light.toggle(data.light[3]);
    if (event.key === "5" && data.light[4]) Light.toggle(data.light[4]);
    if (event.key === "6" && data.light[5]) Light.toggle(data.light[5]);
    if (event.key === "7" && data.light[6]) Light.toggle(data.light[6]);
    if (event.key === "8" && data.light[7]) Light.toggle(data.light[7]);
    if (event.key === "9" && data.light[8]) Light.toggle(data.light[8]);
    if (event.key === "0" && data.light[9]) Light.toggle(data.light[9]);
  });

  data.light[1].delta = -1;
  data.light[2].delta = -0.666;

  const amogus = Math.random();
  GOD_OBJECT.amogus = amogus;
  let prev = performance.now();

  function drawScene(now) {
    if (GOD_OBJECT.amogus !== amogus) return;

    const delta = Math.min(now - prev, 0.08);
    if (delta >= 0.08) {
      prev = now;

      gl.colorMask(true, true, true, true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.colorMask(true, true, true, false);
      
      gl.program = defaultProgram;
      for (const model of data.model) {
        Model.draw(gl, model, data.light, data.camera);
      }

      gl.program = particleProgram;
      Stars.draw(gl, stars, data.camera);

      data.light[1].diffuse[0] += data.light[1].delta * delta;
      data.light[2].diffuse[2] += data.light[2].delta * delta;

      if (data.light[1].diffuse[0] < 0) {
        data.light[1].diffuse[0] = 0;
        data.light[1].delta = -data.light[1].delta;
      }
      if (data.light[1].diffuse[0] > 1) {
        data.light[1].diffuse[0] = 1;
        data.light[1].delta = -data.light[1].delta;
      }
      if (data.light[2].diffuse[2] < 0) {
        data.light[2].diffuse[2] = 0;
        data.light[2].delta = -data.light[2].delta;
      }
      if (data.light[2].diffuse[2] > 1) {
        data.light[2].diffuse[2] = 1;
        data.light[2].delta = -data.light[2].delta;
      }

      const amb = data.model[0];
      const sedan = data.model[data.model.length - 1];

      if (pressedKeys["KeyW"] || pressedKeys["KeyS"]) {
        const shift = pressedKeys["ShiftLeft"] ? 2.0 : 1.0;
        if (pressedKeys["KeyW"]) {
          glMatrix.mat4.translate(amb.mv, amb.mv, [0, 0, 0.5 * delta * shift]);
          if (pressedKeys["KeyA"]) glMatrix.mat4.rotateY(amb.mv, amb.mv, glMatrix.glMatrix.toRadian(4 * delta * shift));
          if (pressedKeys["KeyD"]) glMatrix.mat4.rotateY(amb.mv, amb.mv, glMatrix.glMatrix.toRadian(-4 * delta * shift));
        } 
        if (pressedKeys["KeyS"]) {
          glMatrix.mat4.translate(amb.mv, amb.mv, [0, 0, -0.25 * delta * shift]);
          if (pressedKeys["KeyA"]) glMatrix.mat4.rotateY(amb.mv, amb.mv, glMatrix.glMatrix.toRadian(-4 * delta * shift));
          if (pressedKeys["KeyD"]) glMatrix.mat4.rotateY(amb.mv, amb.mv, glMatrix.glMatrix.toRadian(4 * delta * shift));
        }
      }

      const ambPos = glMatrix.mat4.getTranslation([0, 0, 0], Elem.getMv(amb));
      const sedanPos = glMatrix.mat4.getTranslation([0, 0, 0], Elem.getMv(sedan));
      const deltaPos = [0, 0, delta * (ambPos[2] - sedanPos[2])];
      
      glMatrix.mat4.translate(sedan.mv, sedan.mv, deltaPos);
    }

    if (GOD_OBJECT.amogus === amogus)
      requestAnimationFrame(drawScene);
  }
  requestAnimationFrame(drawScene);
})