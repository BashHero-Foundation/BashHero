import Link from 'next/link'
import { Menu } from "@/components/menu"; 

export default function NotFound() {
  return (
    <div className="flex h-screen">
      <div className="w-1/6 p-4 border-r border-gray-300">
        <Menu />
      </div>
    
      <div className="w-5/6 flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold"> Nie znaleziono tego zadania. </h1>
      </div>
    </div>
  )
}