async function fetchObj(url) {
  const res = await fetch(url);
  const objString = await res.text();
  return expandVertexData(ParseWavefrontObj(objString), {facesToTriangles: true})
}

function fetchImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  })
}

function createLight({
  enabled,
  position,
  attenuation,
  ambient,
  diffuse,
  specular,
  parent,
} = {}) {
  return {
    enabled: enabled ?? false,
    position: position ?? [0, 0, 0],
    attenuation: attenuation ?? [1, 0, 0],
    ambient: ambient ?? [0, 0, 0],
    diffuse: diffuse ?? [0, 0, 0],
    specular: specular ?? [0, 0, 0],
    parent: parent,
  };
}

function createCamera({
  position,
  rotationY,
  rotationX,
  aspectRatio,
  fov,
  parent,
} = {}) {
  return {
    position: position ?? [0, 0, 0],
    rotationY: rotationY ?? 0,
    rotationX: rotationX ?? 0,
    aspectRatio: aspectRatio ?? 1,
    fov: fov ?? 75,
    parent: parent,
  };
}

async function fetchData() {
  const citybitsImage = await fetchImage("./img/citybits_texture.png");
  
  const ambulance = {
    // obj: await fetchObj("./obj/ambulance.obj"),
    obj: await fetchObj("./kenney_car-kit/Models/OBJ format/police.obj"),
    img: await fetchImage("./kenney_car-kit/Models/OBJ format/Textures/colormap.png"),
    mv: glMatrix.mat4.scale(
      glMatrix.mat4.create(),
      glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 0]),
      [0.125, 0.125, 0.125]
    ),
  };

  const roadObj = await fetchObj("./obj/road_straight.obj");
  const roadImage = citybitsImage;

  const roads = [
    {
      obj: roadObj,
      img: roadImage,
      mv: glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -0.0675, -2]),
    },
    {
      obj: roadObj,
      img: roadImage,
      mv: glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -0.0675, 0]),
    },
    {
      obj: roadObj,
      img: roadImage,
      mv: glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -0.0675, 2]),
    },
    {
      obj: roadObj,
      img: roadImage,
      mv: glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -0.0675, -4]),
    },
    {
      obj: roadObj,
      img: roadImage,
      mv: glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -0.0675, 4]),
    },
  ];

  const streets = [
    {
      obj: await fetchObj("./obj/building_A.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-2, -0.0675, -2]),
        glMatrix.glMatrix.toRadian(90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_B.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-2, -0.0675, 0]),
        glMatrix.glMatrix.toRadian(90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_C.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-2, -0.0675, 2]),
        glMatrix.glMatrix.toRadian(90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_D.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [2, -0.0675, -2]),
        glMatrix.glMatrix.toRadian(-90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_E.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [2, -0.0675, 0]),
        glMatrix.glMatrix.toRadian(-90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_F.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [2, -0.0675, 2]),
        glMatrix.glMatrix.toRadian(-90)
      ),
    },
    // EXT
    {
      obj: await fetchObj("./obj/building_G.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-2, -0.0675, -4]),
        glMatrix.glMatrix.toRadian(90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_H.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-2, -0.0675, 4]),
        glMatrix.glMatrix.toRadian(90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_B.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [2, -0.0675, -4]),
        glMatrix.glMatrix.toRadian(-90)
      ),
    },
    {
      obj: await fetchObj("./obj/building_H.obj"),
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [2, -0.0675, 4]),
        glMatrix.glMatrix.toRadian(-90)
      ),
    },
  ];

  const lampObj = await fetchObj("./obj/streetlight.obj");

  const lamps = [
    {
      obj: lampObj,
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 1]),
        glMatrix.glMatrix.toRadian(90)
      ),
      parent: streets[3],
    },
    {
      obj: lampObj,
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 1]),
        glMatrix.glMatrix.toRadian(90)
      ),
      parent: streets[1],
    },
    {
      obj: lampObj,
      img: citybitsImage,
      mv: glMatrix.mat4.rotateY(
        glMatrix.mat4.create(),
        glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 1]),
        glMatrix.glMatrix.toRadian(90)
      ),
      parent: streets[5],
    },
  ]

  const sphere = {
    obj: await fetchObj("./obj/sphere.obj"),
    img: await fetchImage("./img/uv.png"),
    mv: glMatrix.mat4.scale(
      glMatrix.mat4.create(),
      glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0, 0]),
      [0.0625, 0.0625, 0.0625]
    ),
  };
  
  const sedan = {
    obj: await fetchObj("./sedan.obj"),
    img: await fetchImage("./colormap.png"),
    mv: glMatrix.mat4.scale(
      glMatrix.mat4.create(),
      glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-0.25, 0, 0]),
      [0.125, 0.125, 0.125]
    ),
  };

  const sphere2 = {
    obj: await fetchObj("./obj/sphere.obj"),
    img: await fetchImage("./img/uv.png"),
    mv: glMatrix.mat4.scale(
      glMatrix.mat4.create(),
      glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0.5, 0.5, 1.25]),
      [
        2 ** -2,
        2 ** -2,
        2 ** -2,
      ]
      // [1, 1, 1]
    ),
    parent: sedan,
  };

  const camera = createCamera({
    position: [0, 2, -4],
    rotationY: Math.PI,
    fov: 75,
    parent: ambulance,
  });

  return {
    model: [
      ambulance,
      // sphere,
      ...roads,
      ...streets,
      ...lamps,
      sedan,
    ],
    light: [
    /* [0] <=>  1 */  createLight({enabled: false, ambient: [0.3, 0.3, 0.3]}),
    /* [1] <=>  2 */  createLight({enabled: true, position: [ 0.25, 1.3, -0.1], attenuation: [0, 1, 4], diffuse: [1, 0, 0], parent: ambulance}),
    /* [2] <=>  3 */  createLight({enabled: true, position: [-0.25, 1.3, -0.1], attenuation: [0, 1, 4], diffuse: [0, 0, 1], parent: ambulance}),
    /* [3] <=>  4 */  createLight({enabled: true, position: [-0.175, 0.8, 0], attenuation: [0, 2**-3, 0], diffuse: [0.5, 0.5, 0.5], parent: lamps[0]}),
    /* [4] <=>  5 */  createLight({enabled: true, position: [-0.175, 0.8, 0], attenuation: [0, 2**-3, 0], diffuse: [0.5, 0.5, 0.5], parent: lamps[1]}),
    /* [5] <=>  6 */  createLight({enabled: true, position: [-0.175, 0.8, 0], attenuation: [0, 2**-3, 0], diffuse: [0.5, 0.5, 0.5], parent: lamps[2]}),
    /* [6] <=>  7 */  createLight({enabled: true, position: [ 0.45, 0.65,  1.3], attenuation: [0.5, 2, 4], diffuse: [1, 1, 1], parent: sedan}),
    /* [7] <=>  8 */  createLight({enabled: true, position: [-0.45, 0.65,  1.3], attenuation: [0.5, 2, 4], diffuse: [1, 1, 1], parent: sedan}),
    /* [8] <=>  9 */  createLight({enabled: true, position: [ 0.45, 0.65, -1.3], attenuation: [0.5, 2, 4], diffuse: [1, 0, 0], parent: sedan}),
    /* [9] <=> 10 */  createLight({enabled: true, position: [-0.45, 0.65, -1.3], attenuation: [0.5, 2, 4], diffuse: [1, 0, 0], parent: sedan}),
    ],
    camera: camera,
  };
}
