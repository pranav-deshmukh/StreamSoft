import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import { Server as SocketIo } from "socket.io";

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());

const state = { key: "your-initial-key-here" }; // Initial key value

const io = new SocketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Update to frontend URL in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// FFmpeg process variable
let ffmpegProcess = null;

const createFfmpegOptions = (key) => [
  "-i",
  "-",
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-tune",
  "zerolatency",
  "-r",
  `${25}`,
  "-g",
  `${25 * 2}`,
  "-keyint_min",
  25,
  "-crf",
  "25",
  "-pix_fmt",
  "yuv420p",
  "-sc_threshold",
  "0",
  "-profile:v",
  "main",
  "-level",
  "3.1",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-ar",
  "44100",
  "-f",
  "flv",
  `rtmp://a.rtmp.youtube.com/live2/${key}`, // Use the provided key
];

// Start FFmpeg process
const startFfmpegProcess = (key) => {
  const options = createFfmpegOptions(key);
  ffmpegProcess = spawn("ffmpeg", options);

  // Handle FFmpeg output and errors
  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.error(`ffmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`ffmpeg process exited with code: ${code}`);
    ffmpegProcess = null; // Reset process on exit
  });
};

// Route to receive new key and restart the FFmpeg process
app.post("/getKey", (req, res) => {
  const key = req.body.key;
  console.log("Received key:", key);
  state.key = key;

  // If FFmpeg is already running, restart it with the new key
  if (ffmpegProcess) {
    console.log("Restarting FFmpeg with new key...");
    ffmpegProcess.kill("SIGTERM"); // Gracefully stop the existing process
    startFfmpegProcess(key); // Start a new process with the updated key
  } else {
    startFfmpegProcess(key); // Start FFmpeg if it's not already running
  }

  res.status(200).send("Key received");
});

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  socket.on("binary stream", (stream) => {
    console.log("Binary stream incoming...");

    // Ensure FFmpeg process is running before writing to stdin
    if (ffmpegProcess && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) {
          console.error("Error writing stream to FFmpeg:", err);
        }
      });
    } else {
      console.error("FFmpeg process not available to handle the stream");
    }
  });
});

// Serve static files
app.use(express.static(path.resolve("./public")));

server.listen(8000, () => {
  console.log(`Server running on port 8000`);
});
