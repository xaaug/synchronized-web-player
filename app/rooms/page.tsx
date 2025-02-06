'use client'

import Link from "next/link";

type Room = {
  roomId: string;
  url: string;
};

export default function Rooms() {
  const rooms = JSON.parse(localStorage.getItem("rooms") || "[]");
  return rooms.map((room: Room) => (
    <Link href={`/rooms/${room.roomId}`} key={room.roomId}>
      {room.roomId}
    </Link>
  ));
}
