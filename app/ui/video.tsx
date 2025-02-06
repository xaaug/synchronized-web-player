"use client";

import {
  ComputerDesktopIcon,
  PauseIcon,
  PlayIcon,
  TvIcon,
} from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import io from "socket.io-client"; // <-- Import socket.io-client

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

type Room = {
  roomId: string;
  url: string;
};

export default function Video() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);  // Track if component is on client-side
  const pathname = isClient ? usePathname() : '';  // Ensure usePathname runs on client-side
  const roomId = pathname.split("/")[2];
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // WebSocket client instance
  const socketRef = useRef<any>(null);

  const roomObj: Room[] = JSON.parse(
      localStorage.getItem("rooms") || "[]"
  ).filter((room: Room) => room.roomId === roomId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);  // Enable client-side rendering when mounted
    }
  }, []);

  useEffect(() => {
    if (isClient && roomObj.length > 0) {  // Ensure that usePathname() is available
      const link = roomObj[0].url;

      if (link) {
        const youtubeRegex =
            /(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|v\/|.+?[?&]v=))([^"&?\/\s]{11})/;
        const match = link.match(youtubeRegex);
        if (match && match[1]) {
          setVideoId(
              `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&controls=0&rel=0&autohide=1&disablekb=1&autoplay=1`
          );
        } else if (link.trim()) {
          notFound();
        } else {
          notFound();
        }
      }
    }
  }, [roomObj, isClient]);

  // Initialize WebSocket connection
  useEffect(() => {
    socketRef.current = io("http://localhost:4000"); // Your server URL

    socketRef.current.on("connect", () => {
      console.log("WebSocket connected!");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    // Handle events from the server
    socketRef.current.on("play", () => {
      console.log("Received play event");
      if (playerRef.current) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    });

    socketRef.current.on("pause", () => {
      console.log("Received pause event");
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    });

    socketRef.current.on("seek", (time: number) => {
      console.log(`Received seek event to ${time}`);
      if (playerRef.current) {
        playerRef.current.seekTo(time, true);
        setProgress(time);
      }
    });

    return () => {
      socketRef.current.disconnect(); // Clean up WebSocket connection on component unmount
    };
  }, []);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.body.appendChild(tag);
      } else {
        onYouTubeIframeAPIReady();
      }
    };

    const onYouTubeIframeAPIReady = () => {
      if (window.YT && iframeRef.current) {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          videoId: videoId?.split("/embed/")[1]?.split("?")[0] || "",
          playerVars: { controls: 0, modestbranding: 1, rel: 0 },
          events: {
            onReady: (event: any) => {
              setInterval(() => {
                setProgress(event.target.getCurrentTime());
              }, 1000);
            },
            onStateChange: (event: any) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            },
          },
        });
      }
    };

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    loadYouTubeAPI();
  }, [videoId]);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        socketRef.current.emit("pause"); // Emit pause to the server
      } else {
        playerRef.current.playVideo();
        socketRef.current.emit("play"); // Emit play to the server
      }
    }
  }, [isPlaying]);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);
    playerRef.current?.seekTo(newTime, true);
    setProgress(newTime);
    socketRef.current.emit("seek", newTime); // Emit seek event to server
  };

  const handleFullScreen = () => {
    const iframe = playerRef.current?.getIframe();
    if (!document.fullscreenElement) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowLeft":
          playerRef.current?.seekTo(progress - 5, true);
          break;
        case "ArrowRight":
          playerRef.current?.seekTo(progress + 5, true);
          break;
        case "f":
        case "F":
          handleFullScreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, progress, togglePlay]);

  return (
      <div className="h-[90vh]">
        <div ref={iframeRef} className="w-full h-full"></div>

        {progress > 0.01 && (
            <div className="flex justify-between gap-4 mt-4 w-full">
              <button onClick={togglePlay} className=" px-4 py-2 rounded">
                {isPlaying ? (
                    <PauseIcon className="size-5" />
                ) : (
                    <PlayIcon className="size-5" />
                )}
              </button>
              <input
                  type="range"
                  min="0"
                  max={playerRef.current?.getDuration() || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full"
              />
              <button
                  onClick={handleFullScreen}
                  className=" text-black px-4 py-2 rounded"
              >
                {isFullScreen ? (
                    <TvIcon className="size-5" />
                ) : (
                    <ComputerDesktopIcon className="size-5" />
                )}
              </button>
            </div>
        )}
      </div>
  );
}
