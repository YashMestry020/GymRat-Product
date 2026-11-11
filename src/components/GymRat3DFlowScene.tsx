import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { WORKFLOW_STAGES } from '../data/gymRatData';

export type CameraPreset = 'arena' | 'hardware' | 'track';
export type CharacterPhase = 'STAND_GROUND' | 'ON_BAR' | 'PULLING' | 'OFF_BAR';

export interface SceneVisualState {
  activeStageId: number;
  completedStages: number[];
  isPowered: boolean;
  characterPhase: CharacterPhase;
  isLocked: boolean;
  lcdLine1: string;
  lcdLine2: string;
  repTriggerCounter: number;
  halfRepTriggerCounter: number;
  camFlashCounter: number;
  speakerPulseCounter: number;
  inactivitySeconds: number;
  cameraPreset: CameraPreset;
}

interface GymRat3DFlowSceneProps {
  state: SceneVisualState;
  onSelectStage: (stageId: number) => void;
}

// Pre-allocated math helpers at module scope (zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mouse = new THREE.Vector2();

function createLcdCanvasTexture(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, texture };
}

function drawLcdTexture(
  ctx: CanvasRenderingContext2D,
  texture: THREE.CanvasTexture,
  isPowered: boolean,
  line1: string,
  line2: string
) {
  if (!isPowered) {
    ctx.fillStyle = '#1D2026';
    ctx.fillRect(0, 0, 512, 192);
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OFF', 256, 92);
    ctx.font = '22px monospace';
    ctx.fillText('PRESS POWER ON', 256, 136);
    texture.needsUpdate = true;
    return;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, 192);
  grad.addColorStop(0, '#FAD02C');
  grad.addColorStop(1, '#E2A400');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 192);

  // Subtle LCD pixel grid
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let x = 0; x < 512; x += 8) {
    ctx.fillRect(x, 0, 1, 192);
  }
  for (let y = 0; y < 192; y += 8) {
    ctx.fillRect(0, y, 512, 1);
  }

  ctx.strokeStyle = 'rgba(20, 21, 23, 0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 176);

  ctx.fillStyle = '#111214';
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px monospace';
  ctx.fillText(line1.slice(0, 18), 256, 86);

  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#1F2126';
  ctx.fillText(line2.slice(0, 24), 256, 142);

  texture.needsUpdate = true;
}

function createNodeBadgeTexture(num: number, title: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#141517';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#F5B800';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#F5B800';
  ctx.font = 'bold 84px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`0${num}`, 128, 128);

  ctx.fillStyle = '#F6F6F4';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(title.toUpperCase().slice(0, 12), 128, 184);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(15, 17, 21, 0.55)');
  grad.addColorStop(0.55, 'rgba(15, 17, 21, 0.22)');
  grad.addColorStop(1, 'rgba(15, 17, 21, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const GymRat3DFlowScene: React.FC<GymRat3DFlowSceneProps> = ({
  state,
  onSelectStage,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<SceneVisualState>(state);
  const onSelectStageRef = useRef(onSelectStage);

  stateRef.current = state;
  onSelectStageRef.current = onSelectStage;

  // Refs to trigger imperative animations cleanly when props increment
  const lcdUpdaterRef = useRef<((powered: boolean, l1: string, l2: string) => void) | null>(
    null
  );
  const cameraTargetPresetRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(0, 6.2, 12.6),
    lookAt: new THREE.Vector3(0, 1.35, 0),
  });

  useEffect(() => {
    if (lcdUpdaterRef.current) {
      lcdUpdaterRef.current(state.isPowered, state.lcdLine1, state.lcdLine2);
    }
  }, [state.isPowered, state.lcdLine1, state.lcdLine2]);

  useEffect(() => {
    const target = cameraTargetPresetRef.current;
    const isMobile = (mountRef.current?.clientWidth ?? 1024) < 768;
    if (state.cameraPreset === 'arena') {
      target.pos.set(0, isMobile ? 6.6 : 6.2, isMobile ? 16.2 : 12.6);
      target.lookAt.set(0, isMobile ? 1.6 : 1.35, 0);
      target.active = true;
    } else if (state.cameraPreset === 'hardware') {
      target.pos.set(0.35, 3.85, isMobile ? 3.9 : 3.2);
      target.lookAt.set(0, 3.65, 0);
      target.active = true;
    } else if (state.cameraPreset === 'track') {
      target.pos.set(0, isMobile ? 11.2 : 9.8, isMobile ? 11.5 : 9.2);
      target.lookAt.set(0, 0.8, 0);
      target.active = true;
    }
  }, [state.cameraPreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL guard (SwiftShader / llvmpipe / WARP)
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 1024;
    const height = container.clientHeight || 640;
    const isMobile = width < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefefe9);
    scene.fog = new THREE.FogExp2(0xefefe9, 0.022);

    const fov = isMobile ? 58 : 44;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 120);
    if (isMobile) {
      camera.position.set(0, 6.6, 16.2);
    } else {
      camera.position.set(0, 6.2, 12.6);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Three-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0xd4d0c5, 0.9);
    hemiLight.position.set(0, 18, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e4, 1.45);
    keyLight.position.set(6.5, 11, 7.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    const d = 9.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    rimLight.position.set(-7, 6, -6);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xfffbeb, 2.2, 5, 2.5);
      softbox.position.set(0, 6.2, 4.2);
      softbox.lookAt(0, 3.2, 0);
      scene.add(softbox);
    }

    // Studio Floor & Architectural Grid
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe9e8e1,
      roughness: 0.88,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(new THREE.CircleGeometry(24, 64), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(22, 22, 0xc9c6bc, 0xdad7ce);
    gridHelper.position.y = 0.006;
    const gridMats = Array.isArray(gridHelper.material)
      ? gridHelper.material
      : [gridHelper.material];
    gridMats.forEach((m) => {
      m.polygonOffset = true;
      m.polygonOffsetFactor = -1;
      m.polygonOffsetUnits = -1;
    });
    scene.add(gridHelper);

    // Radial Contact Shadow beneath Central Pull-Up Rig
    const contactShadowTex = createContactShadowTexture();
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.2),
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.012;
    scene.add(contactShadow);

    // =========================================================================
    // 1. CENTRAL COMPOSITE PULL-UP RIG & GYMRAT HARDWARE UNIT
    // =========================================================================
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const matteSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.48,
      metalness: 0.65,
    });
    const chromeBarMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4d8de,
      roughness: 0.18,
      metalness: 0.94,
      anisotropy: 0.75,
    });
    const rubberFootMat = new THREE.MeshStandardMaterial({
      color: 0x111214,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Base Stabilizer Feet (grounded at y = 0)
    const footGeo = new THREE.BoxGeometry(0.24, 0.08, 1.85);
    const leftFoot = new THREE.Mesh(footGeo, rubberFootMat);
    leftFoot.position.set(-1.35, 0.04, 0);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    const rightFoot = new THREE.Mesh(footGeo, rubberFootMat);
    rightFoot.position.set(1.35, 0.04, 0);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    rigGroup.add(leftFoot, rightFoot);

    // Vertical Uprights
    const postGeo = new THREE.CylinderGeometry(0.065, 0.075, 3.35, 20);
    const leftPost = new THREE.Mesh(postGeo, matteSteelMat);
    leftPost.position.set(-1.35, 1.715, 0);
    leftPost.castShadow = true;
    const rightPost = new THREE.Mesh(postGeo, matteSteelMat);
    rightPost.position.set(1.35, 1.715, 0);
    rightPost.castShadow = true;
    rigGroup.add(leftPost, rightPost);

    // Knurled Chrome Pull-Up Bar (y = 3.28)
    const barY = 3.28;
    const pullUpBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 2.86, 24),
      chromeBarMat
    );
    pullUpBar.rotation.z = Math.PI / 2;
    pullUpBar.position.set(0, barY, 0);
    pullUpBar.castShadow = true;
    rigGroup.add(pullUpBar);

    // Composite 10-Part 3D GymRat Hardware Device mounted on the Pull-Up Bar
    const deviceGroup = new THREE.Group();
    deviceGroup.position.set(0, barY + 0.42, 0.04);
    rigGroup.add(deviceGroup);

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x181a1e,
      roughness: 0.58,
      metalness: 0.12,
    });
    const gymRatYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf5b800,
      roughness: 0.34,
      metalness: 0.08,
    });
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f1012,
      roughness: 0.72,
      metalness: 0.2,
    });

    // Articulated Bar Clamp
    const clampCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.24, 20),
      matteSteelMat
    );
    clampCollar.rotation.z = Math.PI / 2;
    clampCollar.position.set(0, -0.42, -0.04);
    const clampNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.14), matteSteelMat);
    clampNeck.position.set(0, -0.32, -0.02);
    deviceGroup.add(clampCollar, clampNeck);

    // Extruded Rounded Main Enclosure
    const bodyShape = new THREE.Shape();
    const bw = 0.62;
    const bh = 0.76;
    const br = 0.11;
    bodyShape.moveTo(-bw / 2 + br, -bh / 2);
    bodyShape.lineTo(bw / 2 - br, -bh / 2);
    bodyShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
    bodyShape.lineTo(bw / 2, bh / 2 - br);
    bodyShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
    bodyShape.lineTo(-bw / 2 + br, bh / 2);
    bodyShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
    bodyShape.lineTo(-bw / 2, -bh / 2 + br);
    bodyShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 4,
    });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, chassisMat);
    bodyMesh.castShadow = true;
    deviceGroup.add(bodyMesh);

    // Safety-Yellow Top Bumper & Bottom Sensor Chin
    const topBumper = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.07, 0.17),
      gymRatYellowMat
    );
    topBumper.position.set(0, 0.37, 0);
    const bottomChin = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.11, 0.175),
      gymRatYellowMat
    );
    bottomChin.position.set(0, -0.31, 0.005);
    deviceGroup.add(topBumper, bottomChin);

    // Dynamic Backlit LCD Screen
    const lcdBezel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.19, 0.03), darkTrimMat);
    lcdBezel.position.set(0, 0.13, 0.085);
    deviceGroup.add(lcdBezel);

    const { ctx: lcdCtx, texture: lcdTex } = createLcdCanvasTexture();
    lcdTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    drawLcdTexture(
      lcdCtx,
      lcdTex,
      stateRef.current.isPowered,
      stateRef.current.lcdLine1,
      stateRef.current.lcdLine2
    );
    lcdUpdaterRef.current = (powered, l1, l2) => {
      drawLcdTexture(lcdCtx, lcdTex, powered, l1, l2);
    };

    const lcdPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.155),
      new THREE.MeshBasicMaterial({ map: lcdTex })
    );
    lcdPlane.position.set(0, 0.13, 0.102);
    deviceGroup.add(lcdPlane);

    // Tactile Buttons (Power, Restart, Start Key, Restart Key)
    const btnGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16);
    const pwrBtn = new THREE.Mesh(btnGeo, darkTrimMat);
    pwrBtn.rotation.x = Math.PI / 2;
    pwrBtn.position.set(-0.16, -0.02, 0.092);
    const rstCircleBtn = new THREE.Mesh(btnGeo, darkTrimMat);
    rstCircleBtn.rotation.x = Math.PI / 2;
    rstCircleBtn.position.set(-0.06, -0.02, 0.092);

    const keyGeo = new THREE.BoxGeometry(0.09, 0.048, 0.024);
    const startKeyMesh = new THREE.Mesh(keyGeo, gymRatYellowMat);
    startKeyMesh.position.set(-0.16, -0.1, 0.092);
    const restartKeyMesh = new THREE.Mesh(keyGeo, gymRatYellowMat);
    restartKeyMesh.position.set(-0.055, -0.1, 0.092);
    deviceGroup.add(pwrBtn, rstCircleBtn, startKeyMesh, restartKeyMesh);

    // Circular Speaker Grille + Acoustic Wave Ring
    const speakerDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.095, 0.022, 24),
      gymRatYellowMat
    );
    speakerDisc.rotation.x = Math.PI / 2;
    speakerDisc.position.set(0.13, -0.06, 0.09);
    deviceGroup.add(speakerDisc);

    const speakerWaveMat = new THREE.MeshBasicMaterial({
      color: 0xf5b800,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const speakerWaveRing = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.135, 28),
      speakerWaveMat
    );
    speakerWaveRing.position.set(0.13, -0.06, 0.115);
    deviceGroup.add(speakerWaveRing);

    // Bottom IR Sensor & Optical Camera Lenses
    const irLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.028, 16),
      darkTrimMat
    );
    irLens.rotation.x = Math.PI / 2;
    irLens.position.set(-0.06, -0.31, 0.095);

    const camLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.03, 16),
      darkTrimMat
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0.06, -0.31, 0.095);
    deviceGroup.add(irLens, camLens);

    // Translucent IR Optical Detection Cone projecting downward to Bar Level
    const irBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const irBeamCone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.05, 24, 1, true), irBeamMat);
    irBeamCone.position.set(-0.06, -0.82, 0.08);
    deviceGroup.add(irBeamCone);

    // Optical Camera Capture Flash Ring
    const camFlashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const camFlashRing = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.14, 24), camFlashMat);
    camFlashRing.position.set(0.06, -0.31, 0.118);
    deviceGroup.add(camFlashRing);

    // =========================================================================
    // 2. ARTICULATED 3D ATHLETE PERFORMING PULL-UPS
    // =========================================================================
    const athleteGroup = new THREE.Group();
    rigGroup.add(athleteGroup);

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x262930,
      roughness: 0.62,
      metalness: 0.15,
    });
    const accentTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf5b800,
      roughness: 0.4,
      metalness: 0.1,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd6a682,
      roughness: 0.55,
      metalness: 0.04,
    });

    // Upper Body Group (translates vertically based on 4 character phases)
    const athleteTorsoGroup = new THREE.Group();
    const hangTorsoY = 2.02;
    const groundTorsoY = 1.05;
    athleteTorsoGroup.position.set(0, groundTorsoY, 0);
    athleteGroup.add(athleteTorsoGroup);

    const torsoMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.52, 8, 16), suitMat);
    torsoMesh.scale.set(1.25, 1, 0.72);
    torsoMesh.castShadow = true;
    athleteTorsoGroup.add(torsoMesh);

    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.31), accentTrimMat);
    chestStripe.position.set(0, 0.12, 0);
    athleteTorsoGroup.add(chestStripe);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), skinMat);
    headMesh.position.set(0, 0.55, 0);
    headMesh.castShadow = true;
    athleteTorsoGroup.add(headMesh);

    // Legs hanging from torso (feet touch ground y = 0 when standing)
    const legGeo = new THREE.CapsuleGeometry(0.085, 0.66, 6, 12);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.13, -0.72, 0);
    leftLeg.castShadow = true;
    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.13, -0.72, 0);
    rightLeg.castShadow = true;
    athleteTorsoGroup.add(leftLeg, rightLeg);

    // Hands and dynamic connecting arms
    const handGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const leftHand = new THREE.Mesh(handGeo, accentTrimMat);
    leftHand.position.set(-0.32, 0.95, 0);
    const rightHand = new THREE.Mesh(handGeo, accentTrimMat);
    rightHand.position.set(0.32, 0.95, 0);
    athleteGroup.add(leftHand, rightHand);

    const armGeo = new THREE.CylinderGeometry(0.055, 0.05, 1, 12);
    armGeo.translate(0, 0.5, 0);
    armGeo.rotateX(Math.PI / 2);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.castShadow = true;
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.castShadow = true;
    athleteGroup.add(leftArmMesh, rightArmMesh);

    function updateAthleteArms() {
      const shoulderY = athleteTorsoGroup.position.y + 0.32;
      // Left arm from shoulder to left hand
      _vec3A.set(-0.28, shoulderY, 0);
      _vec3B.copy(leftHand.position);
      leftArmMesh.position.copy(_vec3A);
      leftArmMesh.lookAt(_vec3B);
      leftArmMesh.scale.set(1, 1, Math.max(0.2, _vec3A.distanceTo(_vec3B)));

      // Right arm from shoulder to right hand
      _vec3A.set(0.28, shoulderY, 0);
      _vec3B.copy(rightHand.position);
      rightArmMesh.position.copy(_vec3A);
      rightArmMesh.lookAt(_vec3B);
      rightArmMesh.scale.set(1, 1, Math.max(0.2, _vec3A.distanceTo(_vec3B)));
    }
    updateAthleteArms();

    // =========================================================================
    // 3. 8-NODE 3D FLOWCHART CIRCUIT TRACK & SIGNAL ORB
    // =========================================================================
    const flowchartGroup = new THREE.Group();
    scene.add(flowchartGroup);

    const curvePoints = WORKFLOW_STAGES.map(
      (s) => new THREE.Vector3(s.nodePosition[0], s.nodePosition[1], s.nodePosition[2])
    );
    const flowCurve = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.45);
    const tubeGeo = new THREE.TubeGeometry(flowCurve, 120, 0.055, 12, true);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x3b3f47,
      roughness: 0.4,
      metalness: 0.6,
    });
    const flowTube = new THREE.Mesh(tubeGeo, tubeMat);
    flowTube.receiveShadow = true;
    flowchartGroup.add(flowTube);

    // Traveling Glowing Signal Orb along Flowchart Curve
    const signalOrbMat = new THREE.MeshStandardMaterial({
      color: 0xf5b800,
      emissive: 0xf5b800,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.1,
    });
    const signalOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), signalOrbMat);
    flowchartGroup.add(signalOrb);

    const clickableProxies: THREE.Object3D[] = [];
    const nodeRingMats: THREE.MeshStandardMaterial[] = [];
    const nodeCaps: THREE.Mesh[] = [];

    WORKFLOW_STAGES.forEach((stage, idx) => {
      const [nx, ny, nz] = stage.nodePosition;
      const stationGroup = new THREE.Group();
      stationGroup.position.set(nx, 0, nz);
      flowchartGroup.add(stationGroup);

      // Grounded Base Plinth
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.76, 0.18, 8),
        matteSteelMat
      );
      plinth.position.y = 0.09;
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      stationGroup.add(plinth);

      // Support Pylon up to Node Height
      const pylonH = Math.max(0.15, ny - 0.18);
      const pylon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.26, pylonH, 16),
        matteSteelMat
      );
      pylon.position.y = 0.18 + pylonH / 2;
      pylon.castShadow = true;
      stationGroup.add(pylon);

      // Glowing Status Ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x52555a,
        emissive: 0x000000,
        roughness: 0.3,
        metalness: 0.5,
      });
      nodeRingMats.push(ringMat);
      const statusRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.045, 12, 28), ringMat);
      statusRing.rotation.x = Math.PI / 2;
      statusRing.position.y = ny + 0.02;
      stationGroup.add(statusRing);

      // Numbered Top Badge Cap
      const badgeTex = createNodeBadgeTexture(stage.id, stage.shortTitle);
      badgeTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const capMat = new THREE.MeshStandardMaterial({
        map: badgeTex,
        roughness: 0.38,
        metalness: 0.15,
      });
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.1, 24), capMat);
      capMesh.position.y = ny + 0.05;
      capMesh.castShadow = true;
      nodeCaps.push(capMesh);
      stationGroup.add(capMesh);

      // Invisible Raycast Hit Proxy on Layer 1
      const proxy = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.78, ny + 0.65, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      proxy.position.y = (ny + 0.65) / 2;
      proxy.layers.set(1);
      proxy.userData.stageId = stage.id;
      proxy.userData.nodeIndex = idx;
      clickableProxies.push(proxy);
      stationGroup.add(proxy);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.4;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(0, isMobile ? 1.6 : 1.35, 0);
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    controls.addEventListener('start', () => {
      cameraTargetPresetRef.current.active = false;
    });

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drags

      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      if (hits.length > 0) {
        const stageId = hits[0].object.userData.stageId as number;
        if (stageId) {
          onSelectStageRef.current(stageId);
        }
      }
    };

    let lastHoverCheck = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 60) return;
      lastHoverCheck = now;

      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // 5. ANIMATION LOOP (WITH SOFTWARE-WEBGL PACING & SMOOTH DAMPING)
    // =========================================================================
    let prevTimeMs = performance.now();
    let elapsedTimeSec = 0;
    let frameId = 0;
    let disposed = false;

    let currentOrbT = 0;
    let lastRepCounter = stateRef.current.repTriggerCounter;
    let lastHalfRepCounter = stateRef.current.halfRepTriggerCounter;
    let lastCamFlashCounter = stateRef.current.camFlashCounter;
    let lastSpeakerCounter = stateRef.current.speakerPulseCounter;

    let pullAnimTimer = -1; // >= 0 means active full pull-up animation
    let halfRepTimer = -1; // >= 0 means active half-rep anti-cheat animation
    let camFlashAlpha = 0;
    let speakerWaveAlpha = 0;
    let speakerWaveScale = 1;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - prevTimeMs) / 1000, 0.1);
      prevTimeMs = nowMs;
      elapsedTimeSec += dt;
      const s = stateRef.current;

      // Detect newly triggered events
      if (s.repTriggerCounter !== lastRepCounter) {
        lastRepCounter = s.repTriggerCounter;
        pullAnimTimer = 0;
        halfRepTimer = -1;
      }
      if (s.halfRepTriggerCounter !== lastHalfRepCounter) {
        lastHalfRepCounter = s.halfRepTriggerCounter;
        halfRepTimer = 0;
        pullAnimTimer = -1;
      }
      if (s.camFlashCounter !== lastCamFlashCounter) {
        lastCamFlashCounter = s.camFlashCounter;
        camFlashAlpha = 1.0;
      }
      if (s.speakerPulseCounter !== lastSpeakerCounter) {
        lastSpeakerCounter = s.speakerPulseCounter;
        speakerWaveAlpha = 0.95;
        speakerWaveScale = 1.0;
      }

      // 1. Animate 3D Athlete 4-Phase Lifecycle:
      // Phase 1: STAND_GROUND -> feet on floor, hands at side
      // Phase 2: ON_BAR -> hands on bar, hanging dead-hang
      // Phase 3: PULLING -> chin clears bar and lowers
      // Phase 4: OFF_BAR -> drops off bar, feet on floor, hands at side
      const phase = s.characterPhase;
      let targetTorsoY = groundTorsoY;
      const targetLeftHand = _vec3A.set(-0.32, 0.95, 0);
      const targetRightHand = _vec3B.set(0.32, 0.95, 0);

      if (phase === 'STAND_GROUND' || phase === 'OFF_BAR') {
        targetTorsoY = groundTorsoY + Math.sin(elapsedTimeSec * 1.8) * 0.012;
        targetLeftHand.set(-0.32, targetTorsoY - 0.1, 0);
        targetRightHand.set(0.32, targetTorsoY - 0.1, 0);
        irBeamMat.opacity = s.isPowered ? 0.08 : 0.02;
      } else {
        // Character is on the bar (ON_BAR or active PULLING)
        targetLeftHand.set(-0.42, barY - 0.02, 0);
        targetRightHand.set(0.42, barY - 0.02, 0);

        if (pullAnimTimer >= 0) {
          pullAnimTimer += dt * 1.45;
          if (pullAnimTimer >= 1) {
            pullAnimTimer = -1;
            targetTorsoY = hangTorsoY;
            irBeamMat.color.setHex(0x10b981);
            irBeamMat.opacity = 0.16;
          } else {
            // Smooth sin bell curve up to chin-over-bar (+0.86m elevation) and back down
            const pullHeight = Math.sin(pullAnimTimer * Math.PI) * 0.86;
            targetTorsoY = hangTorsoY + pullHeight;
            irBeamMat.color.setHex(0xf5b800);
            irBeamMat.opacity = 0.38;
          }
        } else if (halfRepTimer >= 0) {
          halfRepTimer += dt * 1.6;
          if (halfRepTimer >= 1) {
            halfRepTimer = -1;
            targetTorsoY = hangTorsoY;
            irBeamMat.color.setHex(0x10b981);
            irBeamMat.opacity = 0.16;
          } else {
            // Stops at 44% height (fails to reach top chin-clearance threshold!)
            const halfHeight = Math.sin(halfRepTimer * Math.PI) * 0.38;
            targetTorsoY = hangTorsoY + halfHeight;
            irBeamMat.color.setHex(0xdc2626);
            irBeamMat.opacity = 0.42;
          }
        } else {
          // Subtle idle breathing / micro-swing in dead-hang
          targetTorsoY = hangTorsoY + Math.sin(elapsedTimeSec * 2.2) * 0.015;
          if (s.inactivitySeconds >= 9) {
            irBeamMat.color.setHex(0xd97706);
            irBeamMat.opacity = 0.25;
          } else if (s.isPowered) {
            irBeamMat.color.setHex(0x10b981);
            irBeamMat.opacity = 0.16;
          } else {
            irBeamMat.opacity = 0.03;
          }
        }
      }

      athleteTorsoGroup.position.y = THREE.MathUtils.damp(
        athleteTorsoGroup.position.y,
        targetTorsoY,
        12,
        dt
      );
      leftHand.position.lerp(targetLeftHand, 1 - Math.exp(-14 * dt));
      rightHand.position.lerp(targetRightHand, 1 - Math.exp(-14 * dt));
      updateAthleteArms();

      // 2. Camera Flash & Speaker Wave Decay
      if (camFlashAlpha > 0.01) {
        camFlashAlpha = THREE.MathUtils.damp(camFlashAlpha, 0, 10, dt);
        camFlashMat.opacity = camFlashAlpha;
        const fScale = 1 + (1 - camFlashAlpha) * 1.4;
        camFlashRing.scale.set(fScale, fScale, 1);
      } else {
        camFlashMat.opacity = 0;
      }

      if (speakerWaveAlpha > 0.01) {
        speakerWaveAlpha = THREE.MathUtils.damp(speakerWaveAlpha, 0, 5.5, dt);
        speakerWaveScale = THREE.MathUtils.damp(speakerWaveScale, 2.3, 5.5, dt);
        speakerWaveMat.opacity = speakerWaveAlpha;
        speakerWaveRing.scale.set(speakerWaveScale, speakerWaveScale, 1);
      } else {
        speakerWaveMat.opacity = 0;
      }

      // 3. Flowchart Node Highlights & Traveling Signal Orb
      const activeIdx = Math.max(0, Math.min(7, s.activeStageId - 1));
      const targetOrbT = activeIdx / 8;
      // Shortest-path interpolation around closed loop [0, 1)
      let diff = targetOrbT - currentOrbT;
      if (diff > 0.5) diff -= 1;
      if (diff < -0.5) diff += 1;
      currentOrbT = (currentOrbT + diff * (1 - Math.exp(-7 * dt)) + 1) % 1;

      flowCurve.getPointAt(currentOrbT, _vec3A);
      signalOrb.position.copy(_vec3A);
      signalOrb.position.y += 0.28;

      WORKFLOW_STAGES.forEach((stage, i) => {
        const isCurrent = stage.id === s.activeStageId;
        const isDone = s.completedStages.includes(stage.id);
        const rMat = nodeRingMats[i];
        const cap = nodeCaps[i];

        if (isCurrent) {
          rMat.color.setHex(0xf5b800);
          rMat.emissive.setHex(0xf5b800);
          rMat.emissiveIntensity = 1.25;
          cap.position.y = THREE.MathUtils.damp(
            cap.position.y,
            stage.nodePosition[1] + 0.14,
            10,
            dt
          );
        } else if (isDone) {
          rMat.color.setHex(0x10b981);
          rMat.emissive.setHex(0x059669);
          rMat.emissiveIntensity = 0.6;
          cap.position.y = THREE.MathUtils.damp(
            cap.position.y,
            stage.nodePosition[1] + 0.05,
            10,
            dt
          );
        } else {
          rMat.color.setHex(0x52555a);
          rMat.emissive.setHex(0x000000);
          rMat.emissiveIntensity = 0;
          cap.position.y = THREE.MathUtils.damp(
            cap.position.y,
            stage.nodePosition[1] + 0.05,
            10,
            dt
          );
        }
      });

      // 4. Smooth Camera Preset Damping
      if (cameraTargetPresetRef.current.active) {
        camera.position.lerp(cameraTargetPresetRef.current.pos, 1 - Math.exp(-5.5 * dt));
        controls.target.lerp(cameraTargetPresetRef.current.lookAt, 1 - Math.exp(-5.5 * dt));
        if (
          camera.position.distanceTo(cameraTargetPresetRef.current.pos) < 0.04 &&
          controls.target.distanceTo(cameraTargetPresetRef.current.lookAt) < 0.04
        ) {
          cameraTargetPresetRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 1024;
      const h = container.clientHeight || 640;
      const mobile = w < 768;
      camera.fov = mobile ? 58 : 44;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      lcdTex.dispose();
      contactShadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full select-none"
      aria-label="Interactive 3D GymRat Workflow Flowchart and Pull-Up Rig"
    />
  );
};
