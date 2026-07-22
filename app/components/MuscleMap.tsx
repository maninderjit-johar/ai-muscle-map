"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export type BodyType = "male" | "female";
export type ViewSide = "front" | "back" | "reset";

type Props = { scores: Record<string, number>; bodyType: BodyType; view: ViewSide; selected: string; onSelect: (name: string) => void };
type PartProps = { name: string; score: number; selected: boolean; onSelect: (name: string) => void; position: [number,number,number]; scale: [number,number,number]; rotation?: [number,number,number] };

const scoreColor = (score: number) => score >= 80 ? "#ff4c3e" : score >= 60 ? "#ff9d2e" : score >= 40 ? "#c9d62e" : score >= 20 ? "#32a6a0" : "#293534";

function Muscle({ name, score, selected, onSelect, position, scale, rotation = [0,0,0] }: PartProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current && selected) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * .025;
      ref.current.scale.set(scale[0]*pulse, scale[1]*pulse, scale[2]*pulse);
    }
  });
  return <mesh ref={ref} position={position} scale={scale} rotation={rotation} onClick={(e: ThreeEvent<MouseEvent>) => {e.stopPropagation(); onSelect(name)}}>
    <sphereGeometry args={[1, 28, 28]} />
    <meshStandardMaterial color={scoreColor(score)} emissive={scoreColor(score)} emissiveIntensity={selected ? .38 : .08} roughness={.62} metalness={.03} />
  </mesh>;
}

function Camera({ view }: { view: ViewSide }) {
  const { camera } = useThree();
  useEffect(() => {
    const back = view === "back";
    camera.position.set(back ? 0 : 0, .25, back ? -8.2 : 8.2);
    camera.lookAt(0, .15, 0);
  }, [view, camera]);
  return null;
}

function Body({ scores, bodyType, selected, onSelect }: Omit<Props,"view">) {
  const female = bodyType === "female";
  const skin = "#39413f";
  const mat = <meshStandardMaterial color={skin} roughness={.82} />;
  const M = (name:string, position:[number,number,number], scale:[number,number,number], rotation?:[number,number,number]) => <Muscle key={`${name}-${position.join()}`} name={name} score={scores[name] ?? 10} selected={selected===name} onSelect={onSelect} position={position} scale={scale} rotation={rotation}/>;
  return <group position={[0,-.15,0]} scale={female ? [.92,1,.9] : [1,1,1]}>
    <mesh position={[0,3.08,0]} scale={[.52,.65,.48]}>{<sphereGeometry args={[1,32,32]}/>} {mat}</mesh>
    <mesh position={[0,2.44,0]} scale={[.27,.32,.27]}>{<cylinderGeometry args={[1,1,2,24]}/>} {mat}</mesh>
    <mesh position={[0,1.55,0]} scale={[female?.78:.88,1.05,.42]}>{<sphereGeometry args={[1,32,32]}/>} {mat}</mesh>
    <mesh position={[0,.42,0]} scale={[female?.68:.64,.68,.38]}>{<sphereGeometry args={[1,32,32]}/>} {mat}</mesh>
    <mesh position={[0,-.14,0]} scale={[female?.68:.57,.48,.39]}>{<sphereGeometry args={[1,32,32]}/>} {mat}</mesh>
    {[-1,1].map((side) => <group key={side}>
      <mesh position={[side*(female?.82:1.0),1.58,0]} rotation={[0,0,side*.13]} scale={[.24,.72,.25]}>{<capsuleGeometry args={[1,1.8,12,24]}/>} {mat}</mesh>
      <mesh position={[side*(female?.97:1.12),.48,0]} rotation={[0,0,side*.04]} scale={[.2,.62,.21]}>{<capsuleGeometry args={[1,1.8,12,24]}/>} {mat}</mesh>
      <mesh position={[side*(female?.39:.35),-.97,0]} rotation={[0,0,side*.02]} scale={[female?.34:.3,1.04,.34]}>{<capsuleGeometry args={[1,1.5,12,24]}/>} {mat}</mesh>
      <mesh position={[side*(female?.36:.33),-2.65,.01]} scale={[.25,.78,.27]}>{<capsuleGeometry args={[1,1.8,12,24]}/>} {mat}</mesh>
    </group>)}

    {M("chest",[-.34,1.7,.39],[.38,.42,.13],[0,.1,-.08])}{M("chest",[.34,1.7,.39],[.38,.42,.13],[0,-.1,.08])}
    {M("shoulders",[-(female?.76:.88),1.82,.12],[.27,.34,.31])}{M("shoulders",[(female?.76:.88),1.82,.12],[.27,.34,.31])}
    {M("biceps",[-(female?.88:1.03),1.03,.2],[.18,.41,.18],[0,0,-.1])}{M("biceps",[(female?.88:1.03),1.03,.2],[.18,.41,.18],[0,0,.1])}
    {M("triceps",[-(female?.9:1.05),1.0,-.19],[.19,.44,.18])}{M("triceps",[(female?.9:1.05),1.0,-.19],[.19,.44,.18])}
    {M("abs",[0,1.0,.4],[.3,.67,.11])}
    {M("lats",[-.39,1.24,-.37],[.35,.67,.13],[0,0,-.1])}{M("lats",[.39,1.24,-.37],[.35,.67,.13],[0,0,.1])}
    {M("glutes",[-.31,-.18,-.35],[.35,.43,.17])}{M("glutes",[.31,-.18,-.35],[.35,.43,.17])}
    {M("quads",[-(female?.39:.35),-.96,.28],[.27,.78,.15])}{M("quads",[(female?.39:.35),-.96,.28],[.27,.78,.15])}
    {M("hamstrings",[-(female?.39:.35),-1.05,-.28],[.25,.76,.14])}{M("hamstrings",[(female?.39:.35),-1.05,-.28],[.25,.76,.14])}
    {M("calves",[-.34,-2.64,-.22],[.2,.55,.14])}{M("calves",[.34,-2.64,-.22],[.2,.55,.14])}
  </group>;
}

export function MuscleMap(props: Props) {
  return <Canvas camera={{ position:[0,.25,8.2], fov:34 }} dpr={[1,1.75]} gl={{antialias:true}}>
    <color attach="background" args={["#09100f"]}/>
    <fog attach="fog" args={["#09100f",8,14]}/>
    <ambientLight intensity={1.45}/><directionalLight position={[4,6,5]} intensity={2.1} color="#dcfff2"/><directionalLight position={[-5,1,-3]} intensity={1.6} color="#ff6b42"/>
    <Body scores={props.scores} bodyType={props.bodyType} selected={props.selected} onSelect={props.onSelect}/>
    <ContactShadows position={[0,-3.62,0]} opacity={.65} scale={5} blur={2.2}/>
    <OrbitControls enablePan={false} minDistance={6.5} maxDistance={10} target={[0,.1,0]} enableDamping dampingFactor={.06}/>
    <Camera view={props.view}/>
  </Canvas>;
}
