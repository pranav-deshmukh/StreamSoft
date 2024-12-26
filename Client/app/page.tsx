import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[#ececf4] h-screen flex flex-col items-center pt-4">
      <nav className="bg-[#ffffff] p-4 w-[97%] text-[#565E6C] flex justify-between items-center rounded-lg">
        <h1 className="text-2xl font-bold text-[#333333]">StreamSoft</h1>
        <ul className="flex space-x-8 text-sm font-bold">
          <li className="hover:underline">
            <Link href="https://x.com/res_send_pranav">Twitter</Link>
          </li>
          <li className="hover:underline">
            <Link href="https://www.linkedin.com/in/pranavdeshmukh910/">
              LinkedIn
            </Link>
          </li>
          <li className="hover:underline">
            <Link href="https://github.com/pranav-deshmukh">Github</Link>
          </li>
        </ul>
      </nav>

      <section className="w-full h-full flex flex-col items-center justify-evenly">
        <text className="flex flex-col items-center gap-y-14">
          <h1 className="text-6xl font-bold">
            The easiest way to live stream{" "}
          </h1>
          <h2 className="text-2xl font-semibold w-[600px] text-center text-[#747474]">
            StreamSoft is a free web browser based tool to live stream on platforms like Youtube,
            Twitch, ...
          </h2>
        </text>
        <Button className="bg-blue-600 hover:bg-blue-700 p-6 text-md font-semibold"><Link href='/dashboard'>Get started - it&apos;s free!</Link></Button>
      </section>
    </div>
  );
}
