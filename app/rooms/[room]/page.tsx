"use client";

// import Video from "@/app/ui/video";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react"

const Video = React.lazy(() => import("@/app/ui/video"));

function generateStaticParams() {}

generateStaticParams();

type Room = {
  roomId: string;
  url: string;
};

type VideoData = {
    title: string | null
    description: string | null
}

export  default function Page() {
  const pathname: string = usePathname();
  const roomId: string = pathname.split("/")[2];
  const [videoData, setVideoData] = useState<VideoData>({
      title: null, description: null
  })
    const [error, setError] = useState<boolean>(false)
    // const API_KEY = 'AIzaSyAaRuCq0XM-ywbjuLnvou_rQxOp6MNT0dc'
  const notFound = (
    <div className="flex flex-col gap-6 w-2/4 px-12 mt-[5rem] justify-center">
      <h2 className="text-3xl font-semibold">Room not found</h2>
      <Link
        href="/rooms"
        className="bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md text-center"
      >
        All Rooms
      </Link>
    </div>
  );

    useEffect(() => {

        async function getYoutubeData(videoId: string) {
            // TODO : Transfer API Key to .env
            const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items(snippet(title,description))&id=${videoId}&key=AIzaSyAaRuCq0XM-ywbjuLnvou_rQxOp6MNT0dc`)
    const data = await res.json()
            setVideoData(data.items[0].snippet)
            console.log(data.items[0].snippet)
        }

        if (JSON.parse(localStorage.getItem('rooms') || '[]').length > 0) {
            const rooms: Room[] = JSON.parse(localStorage.getItem("rooms") || '[]');
            const roomObj: Room[] = rooms.filter((room: Room): boolean => room.roomId === roomId)
            const youtubeRegex =
                /(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|v\/|.+?[?&]v=))([^"&?\/\s]{11})/;
            const match: RegExpMatchArray | null = roomObj[0].url.match(youtubeRegex);
            if (roomObj.length === 0) {
                console.error("Room not found");
                setError(true);
            } else {
                if (match && match[1]) {
                    getYoutubeData(match[1]).then(data => data)

                }
            }
        } else {
            setError(true)
        }
    }, [roomId]);

    if (error) {
        return  notFound
    }


  return (
    <>
      <Suspense
        fallback={<p className="px-12 font-semibold text-2xl">Loading...</p>}
      >
          {(videoData.title) && <div>
              <h2>{videoData.title}</h2>
              <p>{videoData.description}</p>
          </div>}
          <Video/>
      </Suspense>
    </>
  );
}
