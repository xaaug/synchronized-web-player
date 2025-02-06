import { ComputerDesktopIcon, PlayIcon } from "@heroicons/react/16/solid";

export function Play() {
  return (
    <button>
      <PlayIcon className="size-5"/>
    </button>
  );
}

export function Seek() {
  return (
    <input type="range" className="w-full"/>
  );
}

export function FullScreen() {
    return(
        <button>
            <ComputerDesktopIcon className="
        size-5"/>
        </button>
    )
}
