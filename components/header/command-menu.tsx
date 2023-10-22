"use client";

import { getOS } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, ModalBackdrop, ModalContent } from "../ui/modal";

interface CommandMenuProps {
  userOS?: ReturnType<typeof getOS>;
}

const CommandMenu = ({ userOS }: CommandMenuProps) => {
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
      <CommandMenuTrigger onClick={() => setOpen(true)} userOS={userOS} />

      <Modal open={open} className="h-screen">
        <ModalContent>hello</ModalContent>
        <ModalBackdrop onClick={() => setOpen(false)}>Close</ModalBackdrop>
      </Modal>
    </>
  );
};

interface CommandMenuTriggerProps {
  onClick: () => void;
  userOS?: ReturnType<typeof getOS>;
}

const CommandMenuTrigger = ({ onClick, userOS }: CommandMenuTriggerProps) => {
  const getCommandShortcut = () => {
    const os = getOS(userOS);

    switch (os) {
      case "mac":
        return "⌘ K";
      case "windows":
        return "Ctrl K";
      default:
        return "";
    }
  };

  const commandShortcut = getCommandShortcut();

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
