"use client";

import { useState } from "react";
import Modal from "react-modal";
import Link from "next/link";

type Room = {
    roomId: string;
    url: string;
};

export default function Home() {
    const [modal, setModal] = useState(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [randomId] = useState<string>(crypto.randomUUID());

    const openModal = () => {
        setModal(true);
    };

    const closeModal = () => {
        setModal(false);
    };

    const handleSubmit = (videoUrl: string) => {
        const rooms: Room[] = JSON.parse(localStorage.getItem("rooms") || "[]");
        localStorage.setItem(
            "rooms",
            JSON.stringify([...rooms, { roomId: randomId, url: videoUrl }])
        );
    };

    const customStyles = {
        content: {
            width: "70%",
            margin: "0 auto",
        },
        overlay: {
            background: "#0a0a0a56",
        },
    };

    return (
        <div className="flex flex-col items-center justify-center mt-[5rem] gap-6">
            <h2 className="text-5xl font-semibold">Watch together like never before.</h2>
            <button
                onClick={openModal}
                className="bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md"
            >
                Start a watch party
            </button>
            <Modal
                isOpen={modal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Watch Party"
                ariaHideApp={false}
            >
                <button onClick={closeModal}>Close</button>
                <div className="mt-6">
                    <h4 className="text-xl font-semibold">Paste Youtube Link to start the watch party</h4>
                    <form
                        className="flex flex-col gap-2 mt-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(inputValue);
                        }}
                    >
                        <input
                            type="text"
                            className="border-2 rounded-md border-black text-lg font-medium px-4 py-2"
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Link
                            href={`/rooms/${randomId}`}
                            passHref
                            className="bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md mt-4"
                        >
                            Start
                        </Link>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
