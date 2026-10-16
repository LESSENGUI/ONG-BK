"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type AboutGlobe3DProps = {
  onFailure: () => void;
};

const locations = [
  { latitude: 4.3, longitude: 15.3 },
  { latitude: 48.8, longitude: 2.3 },
  { latitude: 40.7, longitude: -74 },
  { latitude: -1.3, longitude: 36.8 },
  { latitude: 35.7, longitude: 139.7 },
];

function pointOnSphere(latitude: number, longitude: number, radius: number) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  );
}

function makeRoute(from: THREE.Vector3, to: THREE.Vector3) {
  const middle = from.clone().add(to).normalize().multiplyScalar(1.34);
  return new THREE.QuadraticBezierCurve3(from, middle, to).getPoints(48);
}

export function AboutGlobe3D({ onFailure }: AboutGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.error("Impossible d’initialiser le rendu du globe 3D.", error);
      onFailure();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const cssColors = getComputedStyle(document.documentElement);
    const brand = {
      sky: new THREE.Color(cssColors.getPropertyValue("--bk-ciel").trim()),
      rose: new THREE.Color(cssColors.getPropertyValue("--bk-rose").trim()),
      blue: new THREE.Color(cssColors.getPropertyValue("--bk-bleu-clair").trim()),
      marine: new THREE.Color(cssColors.getPropertyValue("--bk-marine").trim()),
      yellow: new THREE.Color(cssColors.getPropertyValue("--bk-jaune").trim()),
    };
    renderer.setClearColor(brand.marine, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.set(0, 0, 4.5);

    const earth = new THREE.Group();
    scene.add(earth);
    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(-3, 3, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(brand.sky, 2.4, 8);
    rimLight.position.set(3, -1, -2);
    scene.add(rimLight);

    const globeGeometry = new THREE.SphereGeometry(1.12, 88, 64);
    let earthTexture: THREE.Texture | null = null;
    let disposed = false;
    const textureRequest = new AbortController();
    const loadEarthTexture = async () => {
      try {
        const response = await fetch("/images/earth-texture.svg", { signal: textureRequest.signal });
        if (!response.ok) throw new Error(`Texture HTTP ${response.status}`);
        const source = await response.text();
        const svgDocument = new DOMParser().parseFromString(source, "image/svg+xml");
        if (svgDocument.querySelector("parsererror")) throw new Error("La texture SVG de la Terre est invalide.");

        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = 1024;
        textureCanvas.height = 512;
        const context = textureCanvas.getContext("2d");
        if (!context) throw new Error("Le contexte 2D nécessaire à la texture est indisponible.");
        const ocean = context.createRadialGradient(360, 140, 20, 512, 256, 760);
        ocean.addColorStop(0, brand.sky.getStyle());
        ocean.addColorStop(1, brand.marine.getStyle());
        context.fillStyle = ocean;
        context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
        context.fillStyle = brand.blue.getStyle();
        context.strokeStyle = brand.sky.getStyle();
        context.lineWidth = 1.1;
        svgDocument.querySelectorAll("path[d]").forEach((path) => {
          const outline = path.getAttribute("d");
          if (!outline) return;
          const land = new Path2D(outline);
          context.fill(land);
          context.stroke(land);
        });

        const texture = new THREE.CanvasTexture(textureCanvas);
        if (disposed) {
          texture.dispose();
          return;
        }
        earthTexture = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        earth.add(new THREE.Mesh(
          globeGeometry,
          new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 16,
            specular: brand.sky,
          }),
        ));
      } catch (error) {
        if (disposed || (error instanceof Error && error.name === "AbortError")) return;
        console.error("La texture de la Terre n’a pas pu être chargée.", error);
        onFailure();
      }
    };
    void loadEarthTexture();

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.17, 64, 48),
      new THREE.MeshBasicMaterial({
        color: brand.sky,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.17,
      }),
    );
    earth.add(atmosphere);

    const routeMaterials = [
      new THREE.LineBasicMaterial({ color: brand.sky, transparent: true, opacity: 0.8 }),
      new THREE.LineBasicMaterial({ color: brand.rose, transparent: true, opacity: 0.72 }),
    ];
    locations.slice(1).forEach((location, index) => {
      const routePoints = makeRoute(
        pointOnSphere(locations[0].latitude, locations[0].longitude, 1.14),
        pointOnSphere(location.latitude, location.longitude, 1.14),
      );
      earth.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(routePoints),
        routeMaterials[index % routeMaterials.length],
      ));
    });

    const markerGeometry = new THREE.SphereGeometry(0.025, 10, 8);
    locations.forEach((location, index) => {
      const marker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshBasicMaterial({ color: index % 2 ? brand.rose : brand.yellow }),
      );
      marker.position.copy(pointOnSphere(location.latitude, location.longitude, 1.17));
      earth.add(marker);
    });

    const particlePositions = new Float32Array(42 * 3);
    for (let index = 0; index < 42; index += 1) {
      const latitude = Math.asin(2 * Math.random() - 1);
      const longitude = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.12;
      particlePositions[index * 3] = radius * Math.cos(latitude) * Math.sin(longitude);
      particlePositions[index * 3 + 1] = radius * Math.sin(latitude);
      particlePositions[index * 3 + 2] = radius * Math.cos(latitude) * Math.cos(longitude);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: brand.blue,
      size: 0.018,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    earth.add(new THREE.Points(particleGeometry, particleMaterial));

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
      new THREE.EllipseCurve(0, 0, 1.52, 0.51, 0, Math.PI * 2, false)
        .getPoints(100)
        .map(({ x, y }) => new THREE.Vector3(x, y, 0)),
    );
    const orbit = new THREE.LineLoop(
      orbitGeometry,
      new THREE.LineBasicMaterial({ color: brand.sky, transparent: true, opacity: 0.48 }),
    );
    orbit.rotation.set(0.54, 0.12, -0.42);
    scene.add(orbit);

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      targetY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.46;
      targetX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -0.28;
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      earth.rotation.y += 0.00115;
      earth.rotation.x += (targetX - earth.rotation.x) * 0.025;
      earth.rotation.y += (targetY - earth.rotation.y) * 0.025;
      orbit.rotation.z += 0.0008;
      renderer.render(scene, camera);
    };
    frame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      textureRequest.abort();
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      earthTexture?.dispose();
      renderer.dispose();
    };
  }, [onFailure]);

  return (
    <div aria-hidden="true" className="about-globe-3d" ref={containerRef}>
      <canvas className="about-globe-canvas" ref={canvasRef} />
    </div>
  );
}
