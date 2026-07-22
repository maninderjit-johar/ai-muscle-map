"use client";

import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo } from "react";

export type BodyType = "male" | "female";
export type ViewSide = "front" | "back" | "reset";

type Props = {
  scores: Record<string, number>;
  bodyType: BodyType;
  view: ViewSide;
  selected: string;
  onSelect: (name: string) => void;
};

const frontClickZones: Array<{ muscle: string; position: [number, number, number]; scale: [number, number, number] }> = [
  { muscle: "chest", position: [0, 1.23, .28], scale: [.76, .42, .25] },
  { muscle: "shoulders", position: [-.70, 1.82, .08], scale: [.28, .23, .26] },
  { muscle: "shoulders", position: [.70, 1.82, .08], scale: [.28, .23, .26] },
  { muscle: "biceps", position: [-1.02, 1.46, .12], scale: [.23, .29, .22] },
  { muscle: "biceps", position: [1.02, 1.46, .12], scale: [.23, .29, .22] },
  { muscle: "forearms", position: [-1.55, .82, .08], scale: [.26, .46, .22] },
  { muscle: "forearms", position: [1.55, .82, .08], scale: [.26, .46, .22] },
];

function activationColor(score: number) {
  if (score >= 80) return "#ff482b";
  if (score >= 60) return "#ff9f2f";
  if (score >= 40) return "#badb35";
  if (score >= 20) return "#28a69f";
  return "#315c59";
}

function AnatomicalBody({ bodyType, scores, onSelect }: Omit<Props, "view" | "selected">) {
  const male = useGLTF("/models/male-segmented.glb?v=back-traps-2");
  const female = useGLTF("/models/female-segmented.glb?v=back-traps-2");
  const scene = bodyType === "male" ? male.scene : female.scene;

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const region = mesh.name.startsWith("muscle__") ? mesh.name.slice(8) : null;

      if (region) {
        const score = scores[region] ?? 0;
        const color = new THREE.Color(activationColor(score));
        mesh.material = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: score >= 60 ? 0.32 : 0.18,
          roughness: 0.48,
          metalness: 0.02,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide,
        });
        mesh.renderOrder = 2;
        mesh.userData.muscle = region;
      } else {
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#aeb7b4",
          roughness: 0.62,
          metalness: 0.02,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // The skin remains visible but must not intercept clicks intended for
        // the selectable muscle surface immediately above it.
        mesh.raycast = () => null;
      }
    });
    clone.scale.setScalar(2.55);
    return clone;
  }, [scene, scores]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    let object: THREE.Object3D | null = event.object;
    while (object && !object.userData.muscle) object = object.parent;
    if (!object?.userData.muscle) return;
    event.stopPropagation();
    onSelect(object.userData.muscle);
  };

  return <group>
    <primitive object={model} onPointerDown={handleClick} />
    {frontClickZones.map((zone, index) => (
      <mesh key={`${zone.muscle}-${index}`} position={zone.position} scale={zone.scale}
        onPointerDown={(event) => { event.stopPropagation(); onSelect(zone.muscle); }}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    ))}
  </group>;
}

function Camera({ view }: { view: ViewSide }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.08, view === "back" ? -8.8 : 8.8);
    camera.lookAt(0, 0.04, 0);
  }, [view, camera]);
  return null;
}

export function MuscleMap(props: Props) {
  return <Canvas camera={{ position: [0, 0.08, 8.8], fov: 34 }} dpr={[1, 1.75]} shadows gl={{ antialias: true }}>
    <color attach="background" args={["#09100f"]} />
    <fog attach="fog" args={["#09100f", 8, 14]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[4, 6, 5]} intensity={2.25} color="#effff9" castShadow />
    <directionalLight position={[-5, 1, -3]} intensity={1.35} color="#ff8a68" />
    <AnatomicalBody bodyType={props.bodyType} scores={props.scores} onSelect={props.onSelect} />
    <ContactShadows position={[0, -2.58, 0]} opacity={0.7} scale={5} blur={2.3} />
    <OrbitControls enablePan={false} minDistance={6.8} maxDistance={12} target={[0, 0.04, 0]} enableDamping dampingFactor={0.06} />
    <Camera view={props.view} />
  </Canvas>;
}

useGLTF.preload("/models/male-segmented.glb?v=back-traps-2");
useGLTF.preload("/models/female-segmented.glb?v=back-traps-2");
