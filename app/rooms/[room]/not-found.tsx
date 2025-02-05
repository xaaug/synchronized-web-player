import Link from "next/link";

export default function NotFound() {
    return (
       <div className="flex flex-col gap-6 w-2/4 px-12 mt-[5rem] justify-center">
         <h2 className="text-3xl font-semibold">Oops! That’s not a valid <span className="text-red-500">YouTube</span> link. Try again, we promise we’re not picky… well, maybe just a little!</h2>
         <Link href='/' className='bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md text-center'>Try Again</Link>
       </div>
    )
}