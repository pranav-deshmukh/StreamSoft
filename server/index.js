import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import { Server as SocketIo } from "socket.io";

const app = express();
const server = http.createServer(app);

// Define state object
const state = { key: null };

// Define allowed origins with proper protocols
const allowedOrigins = [
  "http://localhost:3000",
  "https://streamsoft-streamsoft-deploy.up.railway.app",
  "https://stream-soft-git-main-pranav-deshmukhs-projects.vercel.app",
];

// Configure CORS with dynamic origin checking
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Log attempted connection origin for debugging
    console.log("Connection attempt from origin:", origin);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Origin rejected by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configure Socket.IO with matching CORS settings
const io = new SocketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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
  `${key}`,
];

const startFfmpegProcess = (key) => {
  try {
    const options = createFfmpegOptions(key);
    ffmpegProcess = spawn("ffmpeg", options);

    ffmpegProcess.stdout.on("data", (data) => {
      console.log(`ffmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`ffmpeg stderr: ${data}`);
    });

    ffmpegProcess.on("close", (code) => {
      console.log(`ffmpeg process exited with code: ${code}`);
      ffmpegProcess = null;
    });

    ffmpegProcess.on("error", (error) => {
      console.error("FFmpeg process error:", error);
      ffmpegProcess = null;
    });

    // Add error handling for stdin
    ffmpegProcess.stdin.on("error", (error) => {
      console.error("FFmpeg stdin error:", error);
    });
  } catch (error) {
    console.error("Error starting FFmpeg:", error);
  }
};

app.post("/getKey", (req, res) => {
  try {
    const key = req.body.key;
    console.log("Received key:", key);

    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    state.key = key;

    if (ffmpegProcess) {
      console.log("Restarting FFmpeg with new key...");
      ffmpegProcess.kill("SIGTERM");
      startFfmpegProcess(key);
    } else {
      startFfmpegProcess(key);
    }

    res.status(200).json({ message: "Key received successfully" });
  } catch (error) {
    console.error("Error in /getKey endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  socket.on("binary stream", (stream) => {
    console.log("Binary stream incoming...");

    if (ffmpegProcess && ffmpegProcess.stdin && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) {
          console.error("Error writing stream to FFmpeg:", err);
          socket.emit("stream_error", { error: "Failed to process stream" });
        }
      });
    } else {
      console.error("FFmpeg process not available to handle the stream");
      socket.emit("stream_error", { error: "FFmpeg process not ready" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(express.static(path.resolve("./public")));

// Use PORT from environment variable or fallback to 8000
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGTERM");
  }
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
