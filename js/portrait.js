// The About portrait: code.html's scene, inlined. 20,000 tetrahedra ease out of a random cloud
// into a particle portrait, under fog and bloom, and a mouse drag orbits the camera (three.js
// 0.160.0, as in code.html). Changes for living inside the page: sized to its box instead of the
// window, the wheel keeps scrolling the page (no zoom or pan), touch keeps scrolling too (drag is
// mouse-only), three.js loads only as the section comes near, and it renders only while on screen
// and something is still moving. A classic script (not a module) so it also runs from file://.
(function () {
  const box = document.querySelector(".code-swarm");

  // code.html's POS_DATA / COL_DATA is a 141 x 141 grid spanning 70 units, one grey value
  // per particle, with the 119 spare particles parked at (0, -500, 0). Same data, packed:
  // the grey bytes in row order, base64.
  const COUNT = 20000;
  const GRID = 141;
  const SPAN = 70;
  const GREY = "7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7Orq6urq6+zs7Ozs7Ozt7e3t7e3t7ezt7e3t7Ozs7Ozs7Ozs7Ozs7O3s7Ozr7O3s7ezs7Ovs7Ovs6+vr6+vr6+vs6+vr6+vs6urr6Orr6err6urq6unr6+rq6unp6unp6Ofo6ejn6Ofo6Ofo6Ojn5+Xm5uXi7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7Orq6urq6+zs7Ozs7Ozt7e3s7e3t7O3t7e3s7Ozs7Ozs6+zs7Ozr7Ozs7Ozs7Ozs7Ozr6+vr6+zs6uzr6+vq6+rr6+rq6uvq6+vo6unq6evq6uvq6+np6urr6enp6Ojo5ujn5+Xn5+jo5ubn5+Lj6Ojk5eXk7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evq6uvr7Ozs7Ozs7Ozt7e3s7O3t7O3t7ezt7O3s7Ozs7Ovr7Ovs7ezs7Ozr6uzr7Ozr7Ozs7Ozs6+zq6+vp6+rq6+vq6uvr6+ro6uvr6uvr6erq6urq6urp6erq6Onp5+jp6ebm6Obn6Onn5ufn5+Xl5uXl7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evr6+vr7Ozs7Ozs7Ozt7Ozs7Ozs7O3s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozr6+zs7Ovs7Ozr6+vq6urp6urq6+vr7Ovr6+vq6uno7Ovq6urr6uvr6urp6ejq6+rl6erp6eno6ujp5efm5OTl5Ojn5OLk7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evr6+vr7Ozs7Ozs7Ozs7Ozs7Ozs7O3t7e3s7Ozs7Ozs7Ozs7Ozr7O3s7Ozs7Ozr6+zs7Ozr7Ozr6+zr6+vr6enq6uvq6+vr6urs6ufn6+vr6uvr6urq6+rr6ero6ejq6enm5+Xk5ujk6ebm6efq6ejo5+jn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7ezr6+vr7Ozs7Ozs7Ozs7Ozs7Ozs7O3s7e3s7Ozs6+zs7Ozt7O3s7O3s7Ozr7Ovr7Ozs7Ozs7Ozs6+vp6ujq6+vq7Ovq6+vq6uvq6+rr6enr6urq6urq6uvq6evp6unn5ejp5+rk5+jo6ujl5uTj4ufn6ebn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7ezr6+vr7Ozs7Ozs7Ozs7Ozs7Ozs7e3s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3s6uLK7Ozs7Ovr6+vp6+rr6urq6Ojq7Ovp5+nq6erq6uvr6urr6uno6urr6ujn6unr6Ojr6+jn6OXo5+nn6Orm6Ofm3eXk7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3q6+vr7Ozs7Ozs7Ozs7Ozs7Ozs7O3s7ezt7Ozs7Ozs7Ozt7ezs7OnbxKOFgpGkucJr2ezs7Ovr6+vr6enq6+rq6+vq6+rq6+rr6+vr6uvr6+vq6unq6urr6urq6ujp6unq6Orp5ejp5Onp6enq6ePp5+bo7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3r6+vr7Ozs7Ozs7Ozs7ezs7Ozs6+3s7O3s7Ovs7Ovl1LmbiIiarLS+ydjf5+XXyrpk0uzs6+vr6+zr6+rq6uvr6+vs6ero6unp7Orr6+vr6enq6urp6evq6urr6ejq6urq6+jo6+ro6Ojq5unn5Ojp5+fp7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3s6uvr7Ozs7Ozs7Ozs7Ozs6+zs7Ovq4s+3o5eVoKKqqL7U3+Tg18zAvbiuq6Wpq6xhzezr6+rr6+rq6Onp6+vr6+vq6uvr6+zr6u3s6+vs6+vr6uvq6uvq6+rp6unq6enq5+jn5OPj6Ofp6ejo5ufo5urn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t6uvr7Ozs7Ozs7Ozr6d7MtZ+WmpiWma3I2ebi5eDl4uHitK2sr7O2ury+v9jfzMJtyezr6+zr6+vq6ujr7Ovr6+zr6ujr6uvp6+zr6+vr6+vr6uvr6uvr6uvp6Onq6urp6+ro6Onp6unn6efo6Ojm6ejo7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t6+vr7Ozs7Ozs68dtipOxxNHf4drOycO+uNPX1s/Qxby7wsPDv76/vb6+u8Pe1Mxywuzs6+zp7Orq6+vr7Ovr7Ozr6+zs6+vr6+vq6+rs6+rr6+vq6uvr6evq5+rq6enp6evn6ujn6ern6Ofo6Ofn5+bm7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t6+vr7Ozs7Ovr68c/xdfDuK+mpa28xsvO19vg5N7aw8LCv76/v7/BwsPCwMHr4799vOzs6+rr6+nq7Ozr7Orr6+rr6+vr6+nr6+vo6+vr6+rr6ers6+vr6enr5+rp6ujo6+rq6+rp6OPp5ujn6efk5unm7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7Ovr7Ozs7Ovr69o5sr+5yLOrvcHc1c7Y2d/h6MbHyMfFxcTFxcPExcTFw8Lr48eIs+vr6+vq6+vr6+zq6ezq6uvq6+rr6+vm6uvp6urr6+vr6+vr6+rp6Orq6+rq6uro6uvq5+fp6Ono6eXl6OTo5+jn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7Ovr7Ozs6+vr6+U4zM7AxNXg4sDZx8zl6uTi3dPb383Gx8bFxcXFxcTFxcLr6L+Squvr6+nr6uvr7Ovs6uvr6ujq6Onq6uvr6+nr7Ovq6uvq6erq6unr6Ovq6urp6urp6+rp6ebo6ejp6ejq6ebn5+bj7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7err6+vr6+vr6+o3jLq50uKlp7zcyMfj6trk5ObeysbIyMjFxcXFxcXFxcbq4r6anevr6+vr6+rq6uzq6uvr6+vr6+vq6Ovr6+vr7Ozr6+vr6+vr6uvq6+rq6+nq6+vq6uno6url6evq6Obi6OXn6ejn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evr6+vr6+vr6+s4dMC6v6mspLbhx8bg29TN1tnh5OXk5OHb3svExsjFxsjp5MKjkezs6+vr6+vq6+rr7Ovr6+rq6uzq6+nr7Onq6ezr6+vr6+rq6urr6urr6unq6uvq6+rq6unp6Ofo5+Xi5+jn5ejp7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evr6+vs6+vr6+w8Y7uuybenra/fxsXi5NnUzcvM2+Pg4N/ExsTExcXIyMjp0b/GiOvq6+vs6+vq6uvo5+vr6uvp6+vr6uvq6+rq7Ovr6+vq6uvr6evr6+no6evr6urq6unq6ujo5+fm5Obh5Ojo6Ofn7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7evr6+vs7Ovr6+s6VcSn1tu9qKrixcfBw8jJyMrK3ObjzMnFxcXFxcXFxsXm5caxe+rr6+ro6+rq6+rs6+rr6+rq6+nq6+vr6+rs7Ovr6+vs6+vq6+vr6+jr6urr6erq6erp5+rp6efn5efm5uXo5+fp7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7ezr6+vr6+vr6+tHSb6iv9vQp6bfw8jD1N7h4tjg39fHyMjIxsXFxcXFxcbj3860cuvs6+rr6urr6+rp7Ozr6unr6Ors6uvr6+vr7Ovq6+vs6+rr6+vs6ejq6enp6uvq6ejq6Ojp5+jo5uXo6ufn5ebm7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7ezr6+vr6+vr6+tnPKecsM7PpKXVv8bQ4OLdxcTJztPU2Nnd4dDFxcXFxcXn3L21aevq6uvq6urq6erq6evq6+vs6urq6urq7Ozq6+zr6+vr6+zs6+zq6unr6+rp6unq6enp6enp6Ofo6efn5+bm6Ono7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3r6+vs7Ozr6+uWNbirqtXb083bvcPP2d/h3+ji4u3s6ebHxMLFxcXFxcXe5dK4Zurq6uvq6uro6urq6uvr6+zq6+rr6uvr6+rr6+vr6uvr6uvr6uvq6+rr6enq6urr6erq6Ofn6ufm5+bm5efn5+bl7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3s7Ozs7Ozr6+u3MpKjos3a0KXbusHJ0tPh5OPHvsbEw8HDxMPExMXEw8Xf3r66Yerq6unq6urr6ujo6evr6+rr6+vr6+vr6+rq6+zn6evr6unr6+vr6+vq6ujo6uvq6urn6Oro5+Xl5ubl5+bm5N/n7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3s7Ozs7Ozr6+vQL6y6teXn4NLNuLzK3NnbxMHCwcLCwcDCw8PCw8PDw8Pf5M64YOnq6erq6uro6evp6urr7Ovr6evr6+vq6+zs6+Xp6err6urq6+vq6+vr6unr6uvr6ujn6Orn5ufo6Ojp6efp6Obm7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3r7Ozs7Ozr6+vfMn+zzOPh29DHt7zBzdLOxsjDwcK/v7+/wMDBwcLCwr/S5c25Yufq6enq5+nn6+no6uvq6+rq6+vs6uvr6+rr6+fr6enr6+zr6+rq6urp6enp6uvq6unp6Ofn6Ofo5+no5efl4+Lg7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3s7Ozs7Ozr6+voN3W5l9nl4avBvrm82+no4uDRv7++wL2/v8DAwMDAwL7Y57+6VObp6eno6unq6Oro6erp6+zq7Ovq6+vs7Ovr6uvr6+rr5unq6uns6+rq6erq6err6urp6efo6Onp6ebm6eno5+Xj7e3t7e3t7e3t7e3t7e3t7e3s7O3t7e3t7e3t7e3t7Ozs7Ozs6+vqQWG/kdPV2KK7zrm8zuTp6MLLyMDAvr6+vr/AwMDAwMDW6tzFS+Tn6evo6ebo6Onq6unr6uvp6uvs7Ovq5ujr6uzr6unp7Orq7Ovo6+rr6unq6urq6eno6ebn6Ofo6OXn5eTi4OXm7e3t7e3t7e3t7e3r7Ovt7e3r7O3t7e3t7e3t7e3t7Ozs7Ozs6+vrSFSsksbf5dS21ri6vcHT59vj2b++vr6+vr6+v76+v8DT6dzeY+Tq6eno6ejo6Orn6Onq6urs7Ovq6uvr6efm6+rr6evo6unq6uvq6+rq6uvq6urp6ejm6uno5+nm6Ofo6Ojk5+bk7e3t7e3t7e3t7e3r6M/J393FvMjb5e3t7e3t7e3t7Ozs7Ozs7OzrTkWgk8ni2Z6s27y3vcvFwsLDwL++vr6+v7+/vr29vb7h5tHbc+Hn5Obp6Ojn6err6enr7Orq6err6urq6evo6Orp6+vq6urr6+vr6uvq7Ovq6uvp6ejo5ujo5ujm5+fo6Ofo5uXl7e3s7O3t7e3t7ezhu7CZdz44TGNVcL3s7e3t7e3t7Ozs7Ozs7OzrTz+ek629pZmk4b64vsO+wcPIy8LBwcHExMrL0L29vbvd47bQetzq6enm5ujo6Ofp6urq6uzr6evq6+vo6Ojp5ujo6enp6evo6uvr6+vr6unp5+Xo5+np6Ojo5+fo5uTm5efm4+fm7evp6+rs7Ozt7OS3uZR1ZluDn5CKhmiM6O3t7e3t7Ozs7Ozs7OzrYDmblrbSx8eq4b25zuPp4efs6eTm6NXc0c/Myb69vLm4t7TLftnp6Ofo6Obn5+jp5+fq6+vs6+rp6+vq6urq6Ono6Ono6ejp6ejp6urr6evr6Onp6enq6efp6ejo6ebl5+fl4ebm2NOupLjP4+vr68aVq21PT4PDwLSpm2lPbdTt7O3t7Ozs7Ozs7OzrfjSUlpq7zcGX4ry90uTn5NzK0tvTzr69uru7vb29vLm3t7PIf9Tp5+fm5+Xl5ebn6enp6uvr6+rq6+rq6urq6Ofq6ujq6Ojq5ebj5ufm6Ojl6efm5+bp6Ofn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";
  // code.html frames the portrait for a full window with a 60° lens. In this square box a
  // 44° lens fills it like the photo did, from the same distance, so the fog reads the same.
  const FOV = 44;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let onScreen = false;
  let kick = () => {};

  async function start() {
    const [THREE, { OrbitControls }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js")
    ]);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      return; // No WebGL: the box stays black
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    box.appendChild(renderer.domElement);

    // SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 2000);
    camera.position.set(0, 0, 100);

    let controls = null;
    if (finePointer) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !reduceMotion;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 2.0;
      controls.enableZoom = false;
      controls.enablePan = false;
      box.classList.add("is-draggable");
    }

    // POST PROCESSING
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.8;
    bloomPass.radius = 0.4;
    bloomPass.threshold = 0;
    composer.addPass(bloomPass);

    // INSTANCED MESH
    const geometry = new THREE.TetrahedronGeometry(0.25);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    // FORMATION: grid targets and colours, set once
    const grey = Uint8Array.from(atob(GREY), (ch) => ch.charCodeAt(0));
    const axis = [];
    for (let i = 0; i < GRID; i++) axis.push(Math.round((-SPAN / 2 + i * (SPAN / GRID)) * 100) / 100);
    const target = new Float32Array(COUNT * 3);
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      if (i < GRID * GRID) {
        target[i * 3] = axis[i % GRID];
        target[i * 3 + 1] = -axis[Math.floor(i / GRID)];
        color.setRGB(grey[i] / 255, grey[i] / 255, grey[i] / 255);
      } else {
        target[i * 3 + 1] = -500;
        color.setRGB(0, 1, 63 / 255);
      }
      mesh.setColorAt(i, color);
    }
    mesh.instanceColor.needsUpdate = true;

    // Start from code.html's random cloud (or already in place when motion is reduced)
    const pos = new Float32Array(COUNT * 3);
    for (let k = 0; k < pos.length; k++) pos[k] = reduceMotion ? target[k] : (Math.random() - 0.5) * 100;

    // Instances only ever translate, so write positions straight into the matrices
    const matrices = mesh.instanceMatrix.array;
    for (let i = 0; i < COUNT; i++) {
      matrices.fill(0, i * 16, i * 16 + 16);
      matrices[i * 16] = matrices[i * 16 + 5] = matrices[i * 16 + 10] = matrices[i * 16 + 15] = 1;
    }
    function writePositions() {
      for (let i = 0; i < COUNT; i++) {
        matrices[i * 16 + 12] = pos[i * 3];
        matrices[i * 16 + 13] = pos[i * 3 + 1];
        matrices[i * 16 + 14] = pos[i * 3 + 2];
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    writePositions();

    // LERP: code.html moves 10% of the way each frame at 60 fps; this is that, per second
    let settled = reduceMotion;
    function swarm(dt) {
      const k = 1 - Math.pow(0.9, dt * 60);
      let far = 0;
      for (let j = 0; j < pos.length; j++) {
        const d = target[j] - pos[j];
        pos[j] += d * k;
        if (Math.abs(d) > far) far = Math.abs(d);
      }
      if (far < 0.001) {
        pos.set(target);
        settled = true;
      }
      writePositions();
    }

    function resize() {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // ANIMATION LOOP: runs while the swarm is settling or the camera is moving
    let raf = 0;
    let last = 0;
    let dirty = true;
    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      let moving = false;
      if (!settled) {
        swarm(dt);
        moving = !settled;
        dirty = true;
      }
      if (controls && controls.update()) {
        moving = true;
        dirty = true;
      }
      if (dirty) {
        composer.render();
        dirty = false;
      }
      if (moving) kick();
      else last = 0;
    }
    kick = () => {
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
      if (!onScreen || document.hidden) last = 0;
    };

    if (controls) {
      controls.addEventListener("change", () => {
        dirty = true;
        kick();
      });
    }
    new ResizeObserver(() => {
      resize();
      dirty = true;
      kick();
    }).observe(box);
    document.addEventListener("visibilitychange", () => kick());

    resize();
    kick();
  }

  if (box) {
    // Load three.js as the section approaches; animate only while it is actually visible
    const near = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      start().catch(() => {}); // CDN unreachable: the box stays black
    }, { rootMargin: "400px 0px" });
    near.observe(box);

    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      kick();
    }).observe(box);
  }
})();
