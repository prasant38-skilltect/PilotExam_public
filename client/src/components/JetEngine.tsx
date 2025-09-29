"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function JetEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canWidth = window.innerWidth - 200;
  const canHeight = window.innerHeight;

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      canWidth / canHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(canWidth, canHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // === Controls (optional) ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // === Lights ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // === Load GLTF model ===
    const loader = new GLTFLoader();
    loader.load("/test/jet_engine_animation/Rotating_Jet_Engine.glb", (gltf) => {
        const model = gltf.scene;
        model.position.y -= 2.5; // adjust this value to move it down
        model.position.x += 1; // adjust this value to move it left

        // Compute bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale model to fit inside a 1x1x1 box (or desired scale)
        const scale = .55; // adjust 1 to smaller/larger if needed
        model.scale.set(scale, scale, scale);

        // Center the model
        box.getCenter(size);
        // model.position.sub(size); // move center to origin

        scene.add(model);
    });


    // === Animate ===
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // === Handle resize ===
    const handleResize = () => {
      camera.aspect = canWidth / canHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canWidth, canHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative max-w-12xl mx-auto px-4 sm:px-12 lg:px-12">
      <canvas ref={canvasRef} id="c" />
      <div
        id="info"
        className="absolute bottom-2 w-full text-center text-white text-base z-50"
      >
        Jet Engine Animation
      </div>
    </div>
  );
}
