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
  const pathname = usePathname();
  const roomId = pathname.split("/")[2];
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const roomObj: Room[] = JSON.parse(
    localStorage.getItem("rooms") || "[]",
  ).filter((room: Room) => room.roomId === roomId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = roomObj[0].url;
      if (link) {
        const youtubeRegex =
          /(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|v\/|.+?[?&]v=))([^"&?\/\s]{11})/;
        const match = link.match(youtubeRegex);
        if (match && match[1]) {
          setVideoId(
            `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&controls=0&rel=0&autohide=1&disablekb=1&autoplay=1`,
          );
        } else if (link.trim()) {
          notFound();
        } else {
          notFound();
        }
      }
    }
  }, [roomObj]);

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

  // Handle Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPlaying]);

  // Handle Seek (forward/backward)
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);
    playerRef.current?.seekTo(newTime, true);
    setProgress(newTime);
  };

  // Handle Fullscreen toggle
  const handleFullScreen = () => {
    const iframe = playerRef.current?.getIframe(); // Get the iframe
    if (!document.fullscreenElement) {
      // Enter Fullscreen
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
      // Exit Fullscreen
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

  // Listen to keypresses for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          togglePlay(); // Spacebar for play/pause
          break;
        case "ArrowLeft":
          playerRef.current?.seekTo(progress - 5, true); // Left arrow to seek backward 5 seconds
          break;
        case "ArrowRight":
          playerRef.current?.seekTo(progress + 5, true); // Right arrow to seek forward 5 seconds
          break;
        case "f":
        case "F":
          handleFullScreen(); // F key to toggle fullscreen
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
    <div className="h-[80vh] w-[80%] mt-8 mx-auto">
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
