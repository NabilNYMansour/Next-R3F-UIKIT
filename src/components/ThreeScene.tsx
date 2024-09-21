"use client";

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Center, Environment, OrbitControls, Shadow, Text3D, useGLTF } from '@react-three/drei'
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { easing } from 'maath'
import * as THREE from 'three';
import dynamic from 'next/dynamic';
// import * as UIKIT from '@react-three/uikit';
const UIKIT = require('@react-three/uikit');

// config
const origin = { x: 0, y: 1 };
const target = { x: 0, y: 1, z: 0.1 };
const possibleColors = [
  "#FF6347", // Tomato
  "#FFD700", // Gold
  "#B0B0B0", // Titanium
  "#1E90FF", // Dodger Blue
  "#32CD32", // Lime Green
  "#8A2BE2", // Blue Violet
  "#FF69B4", // Hot Pink
  "#A52A2A", // Brown
  "#2F4F4F", // Dark Slate Gray
  "#FF4500", // Orange Red
];
const thumbnailLink = "https://www.youtube.com/watch?v=cxdWPDXUodU&ab_channel=NabilMansour"
const contacts = [
  { link: "https://nabilmansour.com/", icon: "/nabil.png" },
  { link: "https://x.com/nabilnymansour", icon: "/twitter-x.png" },
  { link: "https://github.com/NabilNYMansour", icon: "/github.png" },
  { link: "https://buymeacoffee.com/nabilmansour", icon: "/coffee.png" }
]

const CameraController = () => {
  const [usingOrbit, setUsingOrbit] = useState(false);

  useFrame((state, delta) => {
    if (!usingOrbit) {
      const offsetX = origin.x - state.pointer.x;
      easing.damp3(state.camera.position, [offsetX, origin.y, 2], 0.35, delta);
      state.camera.lookAt(target.x, target.y, target.z);
    }
  })

  return <OrbitControls makeDefault target={[target.x, target.y, target.z]}
    onStart={() => setUsingOrbit(true)}
    onEnd={() => setUsingOrbit(false)}
    maxAzimuthAngle={Math.PI / 2.5}
    minAzimuthAngle={-Math.PI / 2.5}
    maxPolarAngle={0}
    minPolarAngle={Math.PI / 2}
    enableZoom={false}
  />;
}
const IPhoneModel = ({ backgroundColor }: { backgroundColor: string }) => {
  const texture = useLoader(THREE.TextureLoader, '/background.jpg');
  const { scene, materials }: any = useGLTF("/iphone.glb");
  const [screenMaterial, setScreenMaterial] = useState<any>();

  const resetMaterial = () => {
    if (materials) {
      materials["Mat.10"].color = new THREE.Color(backgroundColor);
      materials["Mat.1"].color = new THREE.Color(backgroundColor);
      materials["Mat.6_2_1"].color = new THREE.Color(backgroundColor);
      materials["Mat.6"].color = new THREE.Color(backgroundColor);
      materials["Material.011"].color = new THREE.Color(backgroundColor);
      materials["Material.010"].color = new THREE.Color(backgroundColor);
      materials["Mat.7"].color = new THREE.Color(backgroundColor);
      materials["Mat.6_1"].color = new THREE.Color(backgroundColor);
    }

    if (screenMaterial) {
      screenMaterial.color = new THREE.Color(backgroundColor);
    }
  }

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === "Screen") {
          child.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0, color: backgroundColor });
          setScreenMaterial(child.material);
        }
      }
    });
    resetMaterial();
  }, [scene, materials])

  useEffect(() => {
    resetMaterial();
  }, [backgroundColor]);

  return <primitive object={scene} scale={0.5} castShadow />;
}

const UI = ({ backgroundColor, setBackgroundColor, writing, setWriting }:
  {
    backgroundColor: string, setBackgroundColor: Dispatch<SetStateAction<string>>,
    writing: string, setWriting: Dispatch<SetStateAction<string>>
  }) => {

  return (
    <group position={[0, 0, 0.07]}>
      <UIKIT.Root sizeX={0.85} sizeY={1.6}
        flexDirection="column" justifyContent="center" alignItems="center" overflow="hidden">
        <UIKIT.Container justifyContent="center" flexWrap="wrap" margin={5} gap={5}>
          {possibleColors.map((color, index) => (
            <UIKIT.Container key={index}
              borderColor={color === backgroundColor ? "white" : "transparent"}
              borderWidth={color === backgroundColor ? 1 : 0}
              backgroundColor={color} width={12} height={12} borderRadius={5}
              hover={{ borderColor: "white", borderWidth: 1 }} cursor='pointer'
              onClick={() => setBackgroundColor(color)} />
          ))}
        </UIKIT.Container>
        <UIKIT.Container alignItems="center" flexDirection="column" margin={5} gap={5}>
          <UIKIT.Input selectionColor={backgroundColor} backgroundColor={"white"} color={"black"}
            textAlign="center" fontWeight="bold" overflow="hidden"
            fontSize={6} defaultValue={writing} paddingY={2} borderRadius={2} backgroundOpacity={0.9}
            onValueChange={(value: string) => setWriting(value)} width={75} />
        </UIKIT.Container>
        <UIKIT.Container justifyContent="center" margin={5} gap={5} cursor='pointer'>
          <UIKIT.Image src="/thumbnail.png" width={75} height={80} borderRadius={2} color="red"
            borderColor="black" borderWidth={1} onClick={() => window.open(thumbnailLink, "_blank")}
            hover={{ borderColor: "white" }} />
        </UIKIT.Container>
        <UIKIT.Container justifyContent="center" alignItems="flex-end"
          width={75} height={20} margin={5} gap={5} cursor='pointer'>
          {contacts.map((contact, index) => (
            <UIKIT.Image key={index} src={contact.icon} width={15} height={15} borderRadius={2} color="red"
              borderColor="black" borderWidth={1} onClick={() => window.open(contact.link, "_blank")}
              hover={{ borderColor: "white" }} />
          ))}
        </UIKIT.Container>
      </UIKIT.Root>
    </group>
  )
}

const ThreeScene = () => {
  const [backgroundColor, setBackgroundColor] = useState(possibleColors[0]);
  const [writing, setWriting] = useState("Hello UIKIT!");

  return (
    <Canvas camera={{ position: [1, 1, 2] }}
      shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
      frameloop="always" style={{ height: '100vh' }}>

      <color attach="background" args={[backgroundColor]} />
      <CameraController />
      <Environment preset="city" />

      <Center top>
        <IPhoneModel backgroundColor={backgroundColor} />
        <UI backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
          writing={writing} setWriting={setWriting} />
      </Center>

      <Center position={[0, 1, -3]}>
        <Text3D size={1.5} font="/Inter_Bold.json">
          {writing}
          <meshStandardMaterial color={backgroundColor} />
        </Text3D>
      </Center>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />

      <Shadow
        color="black"
        colorStop={0}
        opacity={0.7}
        scale={[1, 0.5, 0]}
      />

    </Canvas>
  );
}

const ThreeSkeleton = () => {
  return (
    <div className='w-screen h-screen flex justify-center items-center text-4xl'>
      Loading...
    </div>
  );
}

// For Next to not load server side
export default dynamic(() => Promise.resolve(ThreeScene), {
  ssr: false,
  loading: () => <ThreeSkeleton />,
});
