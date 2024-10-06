"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { MdVideocam, MdVideocamOff } from "react-icons/md";
import { Input } from "./ui/input";
import axios, { AxiosError } from "axios";
import { Button } from "./ui/button";
import { PlatformStreamUrls } from "@/utils/platform";

const VideoScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [platform, setPlatform] = useState('');
  const [screenStream, setScreenStream] = useState<MediaStream|null>(null)
  const [shareScreenState, setShareScreenState] = useState(false);
  const [name, setName] = useState('')
  

  useEffect(() => {
    const socketInstance = io("http://localhost:8000");
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("WebSocket connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(()=>{
    const Url = localStorage.getItem("platform")??''
    setPlatform(Url);
  },[])
  
  // useEffect(()=>{
  //   console.log(PlatformStreamUrls[platform]+secretKey)

  // },[platform, secretKey])

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            frameRate: { ideal: 25 },
          },
          audio: true,
        })
        .then((stream) => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 128;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          analyserRef.current = analyser;
          audioContextRef.current = audioContext;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMicLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const maxLevel = Math.max(...Array.from(dataArray));
            setMicLevel(maxLevel);
            requestAnimationFrame(updateMicLevel);
          };
          updateMicLevel();
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
        });
    }
  }, []);

  const handleMute = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  };

  const startRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else if (mediaStream) {
      const mediaRecorder = new MediaRecorder(mediaStream, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        console.log("Binary stream available", event.data);
        if (socket) {
          socket.emit("binary stream", event.data);
        }
      };

      mediaRecorder.start(25);
      setIsRecording(true);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstop = () => {
        setIsRecording(false);
      };
    }
  };

  const handleSecretKey = async (secret: string) => {
    try {
      if(platform){

        const response = await axios.post("http://localhost:8000/getKey", {
          key: PlatformStreamUrls[platform]+secret,
        });
        console.log(response);
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  const shareScreen = async () => {
  try {
    setShareScreenState(true);
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: true, 
      audio: true 
    });
    
    setScreenStream(screen);

    if (screenShareRef.current) {

      if (screenShareRef.current.srcObject) {
        (screenShareRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }

      screenShareRef.current.srcObject = screen;
    }


    screen.getVideoTracks()[0].addEventListener('ended', () => {
      console.log('Screen sharing stopped');
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
      setScreenStream(null);
      setShareScreenState(false);
    });

  } catch (error) {
    console.error("Error starting screen sharing:", error);
  }
};


  return (
    <div className="w-full h-full flex justify-evenly items-center gap-6 p-6 bg-gray-100">
      <div className="flex flex-col gap-5 justify-center items-center bg-white p-6 rounded-lg shadow-md">
      <div className="relative min-w-[550px] min-h-[400px]">
        {shareScreenState&&(
          
      <video ref={screenShareRef} autoPlay
          width={"800px"}
          height={"700px"}
          className="user-video rounded-xl shadow-lg"/>
      )}
         <video
          ref={videoRef}
          autoPlay
          muted={isVideoOff}
          width={`${shareScreenState?"80px":"550px"}`}
          height={"550px"}
          className={`user-video rounded-xl shadow-lg ${shareScreenState?"absolute top-0 left-0":""}`}
          />
        {/* <span className="absolute bottom-0 left-0 bg-yellow-600 p-2 min-w-[80px] text-center font-bold text-white">{name}</span> */}
      </div>
          
        <div className="controls mt-4">
          <Button
            disabled={secretKey.length === 0 ? true : false}
            onClick={startRecording}
            className={`cursor-pointer ${isRecording?'bg-red-500 hover:bg-red-400':'bg-blue-500 hover:bg-blue-400'}`}
          >
            {isRecording ? "Stop Streaming" : "Start Streaming"}
          </Button>
        </div>

        <div className="flex gap-4 mt-4">
          <span
            onClick={handleMute}
            className="cursor-pointer text-2xl bg-slate-200 p-2 rounded-full"
          >
            {isMuted ? <AiOutlineAudioMuted /> : <AiOutlineAudio />}
          </span>
          <span
            onClick={toggleVideo}
            className="cursor-pointer text-2xl bg-slate-200 p-2 rounded-full"
          >
            {isVideoOff ? <MdVideocamOff /> : <MdVideocam />}
          </span>
          <Button onClick={shareScreen}>Start Screen Sharing</Button>
        </div>
      </div>
      
      

      <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md">
        <label htmlFor="secret-key" className="text-gray-600">
          Secret Key:
        </label>
        <Input
          id="secret-key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Enter your secret key"
          className="mb-4"
        />
        <span
          onClick={() => {
            handleSecretKey(secretKey);
            console.log("Secret Key:", secretKey);
          }}
          className="bg-[#1461E1] hover:bg-[#4377cc] text-white text-center py-2 rounded cursor-pointer"
        >
          Continue
        </span>

        <div className="mic-settings mt-6 flex flex-col items-center">
          <label className="text-gray-600 mb-2">Mic Level: {Math.floor(micLevel)}</label>
          <div className="w-4 h-40 bg-gray-200 rounded-lg relative">
            <div
              className="bg-blue-500 w-full absolute bottom-0 rounded-lg transition-all duration-300"
              style={{ height: `${Math.min(micLevel, 100)}%` }}
            ></div>
          </div>
        </div>
        <Input placeholder="Enter your display name" id="name" value={name} onChange={(e)=>setName(e.target.value)}></Input>
        <Button>Select Name</Button>
      </div>
    </div>
  );
};

export default VideoScreen;
