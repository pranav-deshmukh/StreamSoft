import Navigation from "@/components/Navigation";
import TitleBar from "@/components/TitleBar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/6 h-full overflow-auto">
          <Navigation />
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
