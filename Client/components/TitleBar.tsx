import Image from "next/image";
import Logo from "@/public/Screenshot_2024-09-21_185618-transformed.png"

export default function TitleBar(){
    return(
        <div className="w-full h-[55px] flex items-center border-[1px] border-gray-300 p-6">
            <Image src={Logo} alt="Logo" width={100}/>
        </div>
    )
}