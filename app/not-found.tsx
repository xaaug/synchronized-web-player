import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-12 flex gap-5 mt-36 flex-col">
      <h2 className="text-5xl font-bold ">Well...This is awkward 😔</h2>
      <p className="text-2xl">
        Looks like the page you looking for is not available, let us take you{" "}
        <Link href="/" className="underline t">
          home
        </Link>
      </p>
    </div>
  );
}
