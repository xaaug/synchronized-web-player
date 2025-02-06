"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react"; // React Suspense for lazy loading
import Link from "next/link";
import {usePathname} from "next/navigation"; // Import Link for navigation

type Room = {
    roomId: string
    url: string
}

const Video = React.lazy(() => import("@/app/ui/video"));
const API_KEY = process.env.YOUTUBE_API
export default function RoomPage() {
    const pathname = usePathname()
    const roomId = pathname.split("/")[2];  // Extract roomId from the URL path

    const [videoData, setVideoData] = useState({ title: "", description: "" });
    const [error, setError] = useState(false);

    useEffect(() => {
        const rooms = JSON.parse(localStorage.getItem("rooms") || "[]");
        console.log(rooms.filter((room: Room) => room.roomId === roomId))
        const roomObj = rooms.filter((room: Room) => room.roomId === roomId);
        const room = roomObj[0]

        if (!room) {
            setError(true);
        } else {
            const youtubeRegex =
                /(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|v\/|.+?[?&]v=))([^"&?\/\s]{11})/;
            const match = room.url.match(youtubeRegex);

            if (match && match[1]) {
                fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match[1]}&key=${API_KEY}`
                )
                    .then((res) => res.json())
                    .then((data) => {console.log(data); setVideoData(data.items[0].snippet)})
                    .catch(() => setError(true));
            }
        }
    }, [roomId]);

    if (error) {
        return (
            <div>
                <p>Room not found</p>
                <Link href="/">Go back to home</Link> {/* Link back to homepage */}
            </div>
        );
    }

    return (
        <div className="w-[90%] mt-8 mx-auto">
            {videoData.title && (
                <div>
                    <h2>{videoData.title}</h2>
                    <p>{videoData.description}</p>
                </div>
            )}
            <Suspense fallback={<p>Loading...</p>}>
                <Video />
            </Suspense>
        </div>
    );
}
