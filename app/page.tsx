"use client";

import { useState } from "react";
import Modal from "react-modal";
import Form from "next/form";

type Room = {
  roomId: string;
  url: string;
};

export default function Home() {
  const [modal, setModal] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [randomId] = useState<string>(crypto.randomUUID());
  // const [rooms, setRooms] = useState<Room[]>(() => {
  //   if (localStorage.length) {
  //     return JSON.parse(localStorage.getItem("rooms") || "[{}]");
  //   }
  // });

  const openModal = () => {
    setModal(true);
  };

  const rooms: Room[] = JSON.parse(localStorage.getItem("rooms") || "[]")

  const customStyles = {
    content: {
      width: "70%",
      margin: "0 auto",
    },
    overlay: {
      background: "#0a0a0a56",
    },
  };

  const closeModal = () => {
    setModal(false);
  };

  const handleSubmit = (videoUrl: string) => {
    // setRooms((prev) => {
    //   if (prev.length > 0) {
    //     return [...prev, { roomId: randomId, url: videoUrl }];
    //   } else {
    //     return [{ roomId: randomId, url: videoUrl }];
    //   }
    // });
    localStorage.setItem("rooms", JSON.stringify([...rooms, {roomId: randomId, url: videoUrl}]));
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-[5rem] gap-6">
        <h2 className="text-5xl font-semibold">
          Watch together like never before.
        </h2>
        <button
          onClick={openModal}
          className="bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md"
        >
          Start a watch party
        </button>
        <Modal
          isOpen={modal}
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
          ariaHideApp={false}
        >
          <button onClick={closeModal}>Close</button>
          <div className="mt-6">
            <h4 className="text-xl font-semibold">
              Paste Youtube Link to start the watch party
            </h4>
            <Form
              action={`/rooms/${randomId}`}
              className="flex flex-col gap-2 mt-6"
            >
              <input
                type="text"
                className="border-2 rounded-md border-black text-lg font-medium px-4 py-2"
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                className="bg-slate-950 text-white px-[1.5rem] py-[.5rem] rounded-md"
                onClick={() => handleSubmit(inputValue)}
              >
                Start
              </button>
            </Form>
          </div>
        </Modal>
      </div>
    </>
  );
}
