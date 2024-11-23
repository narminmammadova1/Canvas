import Image from "next/image";
import { Inter } from "next/font/google";
import Canvas from "@/Components/Canvas/Canvas";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
   <div>
    <Canvas/>
   </div>
  );
}
