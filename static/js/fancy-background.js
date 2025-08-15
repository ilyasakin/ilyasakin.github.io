
(function(){
  var started = false;
  function init(){
    if (started) return; started = true;
    var hasGL = !!(window.WebGLRenderingContext || window.WebGL2RenderingContext);
    if (!hasGL) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) return;

  var container = document.createElement('div');
  container.id = 'fancy-background';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '-1';
  container.style.pointerEvents = 'none';
  container.style.boxShadow = 'inset 0 0 100px rgba(0,0,0,0.5)';
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    container.style.filter = 'blur(20px)';
  } else {
    container.style.filter = 'blur(30px)';
  }
  document.body.appendChild(container);

  var width = window.innerWidth;
  var height = window.innerHeight;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(70, width/height, 1, 3000);
  camera.position.z = 200;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  if (renderer.setClearColor) renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio((/Android|iPhone|iPad/i.test(navigator.userAgent) ? 0.5 : 0.75) * (window.devicePixelRatio || 1));
  renderer.setSize(width, height);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  container.appendChild(renderer.domElement);

  var gridX = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 6 : 10;
  var gridY = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 4 : 7;
  var gridZ = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 6 : 10;

  // Environment map
  function supportsAvif(){
    try {
      var c = document.createElement('canvas');
      return c.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch(e){ return false; }
  }
  var urls = supportsAvif() ? [
    '/assets/textures/px.avif','/assets/textures/nx.avif','/assets/textures/py.avif','/assets/textures/ny.avif','/assets/textures/pz.avif','/assets/textures/nz.avif'
  ] : [
    '/assets/textures/px.jpg','/assets/textures/nx.jpg','/assets/textures/py.jpg','/assets/textures/ny.jpg','/assets/textures/pz.jpg','/assets/textures/nz.jpg'
  ];
  var textureCube = new THREE.CubeTextureLoader().load(urls);

  var geo = new THREE.SphereGeometry(1, /Android|iPhone|iPad/i.test(navigator.userAgent)?8:16, /Android|iPhone|iPad/i.test(navigator.userAgent)?4:8);
  var material = new THREE.MeshBasicMaterial({ color: 0xff4900, envMap: textureCube });

  var useInstanced = typeof THREE.InstancedMesh === 'function';
  var instanced = null;
  var group = null;
  var matrix = new THREE.Matrix4();
  var s = 60;
  var count = 0;
  if (useInstanced) {
    instanced = new THREE.InstancedMesh(geo, material, gridX*gridY*gridZ);
  } else {
    group = new THREE.Group();
  }
  for (var i=0;i<gridX;i++){
    for (var j=0;j<gridY;j++){
      for (var k=0;k<gridZ;k++){
        var x = 200*(i - gridX/2);
        var y = 200*(j - gridY/2);
        var z = 200*(k - gridZ/2);
        if (useInstanced) {
          matrix.makeTranslation(x,y,z);
          matrix.scale(new THREE.Vector3(s,s,s));
          instanced.setMatrixAt(count++, matrix);
        } else {
          var mesh = new THREE.Mesh(geo, material);
          mesh.position.set(x,y,z);
          mesh.scale.set(s,s,s);
          group.add(mesh);
        }
      }
    }
  }
  if (useInstanced) {
    instanced.instanceMatrix.needsUpdate = true;
    scene.add(instanced);
  } else {
    scene.add(group);
  }

  var mouseX = 0, mouseY = 0;
  var halfX = width/2, halfY = height/2;
  function onPointerMove(e){
    if (!e.isPrimary) return;
    mouseX = e.clientX - halfX;
    mouseY = e.clientY - halfY;
  }
  if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    window.addEventListener('pointermove', onPointerMove);
  } else {
    setInterval(function(){
      mouseX = Math.random()*window.innerWidth - halfX;
      mouseY = Math.random()*window.innerHeight - halfY;
    }, 1500);
  }

  function onResize(){
    width = window.innerWidth; height = window.innerHeight;
    halfX = width/2; halfY = height/2;
    camera.aspect = width/height; camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    container.style.width = '100vw';
    container.style.height = '100vh';
  }
  window.addEventListener('resize', onResize);

  var color = new THREE.Color();
  function render(){
    var time = Date.now()*0.00005;
    camera.position.x += (mouseX - camera.position.x)*0.036;
    camera.position.y += (-mouseY - camera.position.y)*0.036;
    camera.lookAt(scene.position);
    var h = time % 1;
    color.setHSL(h, 1, 0.5);
    if (useInstanced) {
      instanced.material.color.copy(color);
    } else if (material) {
      material.color.copy(color);
    }
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
  }

  function startWhenReady(){
    if (window.THREE) { init(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three-js@79.0.0/three.min.js';
    s.onload = init;
    s.async = true;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startWhenReady);
  } else {
    startWhenReady();
  }

  // Re-init after HTMX swaps when returning to home
  document.addEventListener('htmx:afterSwap', function(){
    if (document.querySelector('.hero__container')) {
      var existing = document.getElementById('fancy-background');
      if (!existing) {
        started = false;
        startWhenReady();
      }
    }
  });
})();


