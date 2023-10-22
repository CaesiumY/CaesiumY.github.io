"use client";

import { Search } from "lucide-react";
import { Modal, ModalBackdrop, ModalContent } from "../ui/modal";
import { useEffect, useState } from "react";
import { getOS } from "@/lib/utils";

const CommandMenu = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleModalCommandKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleModalCommandKeyDown);

    return () => {
      window.removeEventListener("keydown", handleModalCommandKeyDown);
    };
  }, []);

  return (
    <>
      <CommandMenuTrigger onClick={() => setOpen(true)} />

      <Modal open={open} className="h-screen">
        <ModalContent>hello</ModalContent>
        <ModalBackdrop onClick={() => setOpen(false)}>Close</ModalBackdrop>
      </Modal>
    </>
  );
};

interface CommandMenuTriggerProps {
  onClick: () => void;
}

const CommandMenuTrigger = ({ onClick }: CommandMenuTriggerProps) => {
  const [commandShortcut, setCommandShortcut] = useState("");

  useEffect(() => {
    const userOS = getOS();

    switch (userOS) {
      case "mac":
        setCommandShortcut("⌘ K");
        break;
      case "windows":
        setCommandShortcut("Ctrl K");
        break;
      default:
        setCommandShortcut("");
        break;
    }
  }, []);

  return (
    <button
      className="btn flex flex-row gap-2 active:scale-90"
      onClick={onClick}
    >
      <Search size={16} />
      <p className="font-medium">Search</p>
      {commandShortcut ? (
        <kbd className="kbd kbd-xs bg-white font-light">{commandShortcut}</kbd>
      ) : null}
    </button>
  );
};

export { CommandMenu, CommandMenuTrigger };
