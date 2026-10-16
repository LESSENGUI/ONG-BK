"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";

const greetings = ["Bonjour", "Hello", "Mbote", "Hola", "Olá", "Jambo"];

type GlobeSceneProps = { onFailure: () => void };
type NetworkInformation = { effectiveType?: string; saveData?: boolean };
type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

function hasWebGL() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  if (!context) return false;
  const loseContext = context.getExtension("WEBGL_lose_context");
  loseContext?.loseContext();
  return true;
}

function canUseInteractiveGlobe() {
  const browser = navigator as NavigatorWithConnection;
  const connection = browser.connection;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowMemory = browser.deviceMemory !== undefined && browser.deviceMemory < 4;
  const lowCpu = browser.hardwareConcurrency > 0 && browser.hardwareConcurrency < 4;
  const slowConnection =
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "3g";
  return (
    window.matchMedia("(min-width: 900px) and (pointer: fine)").matches &&
    !reducedMotion &&
    !lowMemory &&
    !lowCpu &&
    !slowConnection &&
    hasWebGL()
  );
}

export function AboutGlobe() {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [Scene, setScene] = useState<ComponentType<GlobeSceneProps> | null>(null);
  const handleSceneFailure = useCallback(() => setSceneEnabled(false), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setGreetingIndex((index) => (index + 1) % greetings.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const element = document.querySelector(".about-globe-scene");
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !canUseInteractiveGlobe()) return;
        setSceneVisible(true);
        observer.disconnect();
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sceneVisible) return;
    let cancelled = false;
    import("@/components/about-globe-3d")
      .then(({ AboutGlobe3D }) => {
        if (cancelled) return;
        setScene(() => AboutGlobe3D);
        setSceneEnabled(true);
      })
      .catch((error: unknown) => {
        console.error("Le module du globe 3D n’a pas pu être chargé.", error);
        if (!cancelled) setSceneEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sceneVisible]);

  return (
    <div
      aria-label={`Globe terrestre animé, salutation : ${greetings[greetingIndex]}`}
      className={`about-globe-scene${sceneEnabled ? " about-globe-scene-3d" : ""}`}
      role="img"
    >
      <div aria-hidden="true" className="about-globe-halo" />
      <div aria-hidden="true" className="about-globe about-globe-fallback">
        <svg className="about-globe-map" viewBox="0 0 280 280">
          <defs>
            <clipPath id="about-globe-clip">
              <circle cx="140" cy="140" r="112" />
            </clipPath>
            <radialGradient id="about-globe-fill" cx="35%" cy="30%">
              <stop offset="0" stopColor="var(--bk-bleu-clair)" />
              <stop offset="1" stopColor="var(--bk-marine)" />
            </radialGradient>
            <radialGradient id="about-globe-shade" cx="34%" cy="28%">
              <stop offset="45%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--bk-marine)" stopOpacity="0.68" />
            </radialGradient>
          </defs>
          <circle cx="140" cy="140" r="112" fill="url(#about-globe-fill)" />
          <g clipPath="url(#about-globe-clip)">
            <svg height="224" preserveAspectRatio="none" viewBox="256 0 512 512" width="224" x="28" y="28">
              <image height="512" href="/images/earth-texture.svg" width="1024" x="0" y="0" />
            </svg>
            <circle cx="140" cy="140" fill="url(#about-globe-shade)" r="112" />
          </g>
          <g clipPath="url(#about-globe-clip)" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1">
            <ellipse cx="140" cy="140" rx="54" ry="112" />
            <ellipse cx="140" cy="140" rx="94" ry="112" />
            <ellipse cx="140" cy="140" rx="112" ry="42" />
            <ellipse cx="140" cy="140" rx="112" ry="78" />
          </g>
          <g className="about-globe-routes" clipPath="url(#about-globe-clip)">
            <path d="M71 116 Q137 57 204 109" />
            <path d="M105 190 Q149 118 211 161" />
            <path d="M88 91 Q127 153 176 199" />
          </g>
          <g className="about-globe-points">
            <circle cx="71" cy="116" r="4" />
            <circle cx="204" cy="109" r="4" />
            <circle cx="105" cy="190" r="4" />
            <circle cx="211" cy="161" r="4" />
            <circle cx="88" cy="91" r="3" />
            <circle cx="176" cy="199" r="3" />
          </g>
        </svg>
      </div>
      {Scene && sceneEnabled ? <Scene onFailure={handleSceneFailure} /> : null}
      <span aria-hidden="true" className="about-globe-greeting" key={greetings[greetingIndex]}>
        {greetings[greetingIndex]}
      </span>
      <span aria-hidden="true" className="about-globe-orbit about-globe-orbit-one" />
      <span aria-hidden="true" className="about-globe-orbit about-globe-orbit-two" />
      <span aria-hidden="true" className="about-globe-particle about-globe-particle-one" />
      <span aria-hidden="true" className="about-globe-particle about-globe-particle-two" />
      <span aria-hidden="true" className="about-globe-particle about-globe-particle-three" />
    </div>
  );
}
