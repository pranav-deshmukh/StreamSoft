"use client";
import { MdOutlineVideocam } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Create() {
  const Router = useRouter();
  const [visible, setVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRoute = async () => {
  if (selectedPlatform) {
    localStorage.setItem("platform", selectedPlatform);
    console.log("Selected Platform:", selectedPlatform);
    Router.push("/stream");
  } else {
    console.warn("No platform selected");
  }
};


  return (
    <div className="h-full p-12 flex flex-col gap-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Live Stream</DialogTitle>
            <DialogDescription className="text-red-400">
              You have to enter your secret key to start streaming after you continue.
            </DialogDescription>
            <DialogDescription>
              Select a platform to stream
            </DialogDescription>
            <Select onValueChange={(value) => setSelectedPlatform(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">Youtube</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
              </SelectContent>
            </Select>
          </DialogHeader>
          <Button
            className="bg-[#1461E1] hover:bg-[#4377cc]"
             onClick={handleRoute} disabled={!selectedPlatform}
          >
            Continue
          </Button>
        </DialogContent>

        <section>
          <span className="text-xl">Create</span>
        </section>
        <DialogTrigger>
          <div className="cursor-pointer">
            <section
              className="w-[300px] h-[75px] rounded-lg flex justify-between items-center p-2 border-[1.5px] group"
              onMouseEnter={() => setVisible(true)}
              onMouseLeave={() => setVisible(false)}
              onClick={() => setDialogOpen(true)}
            >
              <section className="flex gap-4 items-center group-hover:text-[#1461E1]">
                <section className="text-4xl w-14 h-14 bg-[#E4ECFF] rounded-lg flex justify-center items-center text-[#1461E1]">
                  <MdOutlineVideocam />
                </section>
                <section>
                  <span className="text-base font-semibold">Live Stream</span>
                </section>
              </section>

              <section>
                <FaPlus
                  className={`text-lg mr-2 text-[#1461E1] ${
                    visible ? "opacity-100" : "opacity-0"
                  }`}
                />
              </section>
            </section>
          </div>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
