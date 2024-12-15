import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const RocketLogo = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(null);

  // Memoize geometry and materials
  const { bodyGeometry, bodyMaterial, noseGeometry, noseMaterial, finGeometry, finMaterial, flameGeometry, flameMaterial } = useMemo(() => ({
    bodyGeometry: new THREE.CylinderGeometry(0.2, 0.2, 1, 32),
    bodyMaterial: new THREE.MeshPhongMaterial({ 
      color: 0x6D28D9,
      shininess: 100
    }),
    noseGeometry: new THREE.ConeGeometry(0.2, 0.5, 32),
    noseMaterial: new THREE.MeshPhongMaterial({ 
      color: 0x4C1D95,
      shininess: 100
    }),
    finGeometry: new THREE.BoxGeometry(0.1, 0.3, 0.1),
    finMaterial: new THREE.MeshPhongMaterial({ 
      color: 0x34D399,
      shininess: 100
    }),
    flameGeometry: new THREE.ConeGeometry(0.15, 0.4, 32),
    flameMaterial: new THREE.MeshPhongMaterial({ 
      color: 0xEF4444,
      emissive: 0xEF4444,
      transparent: true,
      opacity: 0.8
    })
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(40, 40);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create rocket parts
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.y = 0.75;

    const fins = [];
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.y = -0.4;
      fin.position.x = Math.cos(i * Math.PI / 2) * 0.2;
      fin.position.z = Math.sin(i * Math.PI / 2) * 0.2;
      fins.push(fin);
    }

    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = -0.7;
    flame.rotation.x = Math.PI;

    // Group all parts
    const rocket = new THREE.Group();
    rocket.add(body);
    rocket.add(nose);
    fins.forEach(fin => rocket.add(fin));
    rocket.add(flame);
    scene.add(rocket);

    // Lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Position camera
    camera.position.z = 3;

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Animation
    let frame = 0;
    const animate = () => {
      frame += 0.02;
      
      if (rocket) {
        rocket.rotation.y = frame;
        rocket.position.y = Math.sin(frame) * 0.1;
        flame.scale.y = 1 + Math.sin(frame * 4) * 0.2;
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      frameIdRef.current && cancelAnimationFrame(frameIdRef.current);
      mountRef.current?.removeChild(renderer.domElement);
      
      // Dispose of geometries and materials
      [bodyGeometry, noseGeometry, finGeometry, flameGeometry].forEach(geometry => geometry.dispose());
      [bodyMaterial, noseMaterial, finMaterial, flameMaterial].forEach(material => material.dispose());
      
      renderer.dispose();
      scene.clear();
    };
  }, [bodyGeometry, bodyMaterial, noseGeometry, noseMaterial, finGeometry, finMaterial, flameGeometry, flameMaterial]);

  return (
    <div 
      ref={mountRef} 
      className="w-10 h-10 transform hover:scale-110 transition-transform duration-300"
      style={{ cursor: 'pointer' }}
    />
  );
};

export default React.memo(RocketLogo);
