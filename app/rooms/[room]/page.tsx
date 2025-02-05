'use client'

import Video from "@/app/ui/video";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function generateStaticParams() {}

generateStaticParams()

export default function Page() {

    const pathname = usePathname()
    const roomId = pathname.split('/')[2]

    if (typeof window !== 'undefined') {
        const room = localStorage.getItem(roomId)
        if (room === null) {
           return (
            <div className="flex flex-col gap-6 w-2/4 px-12 mt-[5rem] justify-center">
         <h2 className="text-3xl font-semibold">Room not found</h2>
         <Link href='/rooms' className='bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md text-center'>All Rooms</Link>
       </div>
           )
        }
    }

  return (
    <>
     <Suspense fallback={<p className="px-12 font-semibold text-2xl">Loading...</p>}>
     <Video />
     </Suspense>
    </>
  );
}