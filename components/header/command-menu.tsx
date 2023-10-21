"use client";

import { Search } from "lucide-react";
import { Modal, ModalClose, ModalContent } from "../ui/modal";
import { useState } from "react";

const CommandMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CommandMenuTrigger onClick={() => setOpen(true)} />

      <Modal open={open} className="h-screen">
        <ModalContent>hello</ModalContent>
        <ModalClose onClick={() => setOpen(false)}>Close</ModalClose>
      </Modal>
    </>
  );
};

interface CommandMenuTriggerProps {
  onClick: () => void;
}

const CommandMenuTrigger = ({ onClick }: CommandMenuTriggerProps) => {
  return (
    <button
      className="btn flex flex-row gap-2 active:scale-90"
      onClick={onClick}
    >
      <Search size={16} />
      <p className="font-medium">Search</p>
      <kbd className="kbd kbd-sm bg-white">⌘ K</kbd>
    </button>
  );
};

export { CommandMenu, CommandMenuTrigger };
