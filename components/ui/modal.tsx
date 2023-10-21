import { cn } from "@/lib/utils";
import { ReactNode, HTMLAttributes } from "react";

interface ModalProps extends HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  children: ReactNode;
}

const Modal = ({ open, children, className, ...props }: ModalProps) => {
  return (
    <dialog
      className={cn("modal", className, {
        "modal-open": open,
      })}
      {...props}
    >
      {children}
    </dialog>
  );
};

interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ModalContent = ({ children, className, ...props }: ModalContentProps) => {
  return (
    <div className={cn("modal-box", className)} {...props}>
      {children}
    </div>
  );
};

interface ModalBackdropProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const ModalClose = ({ children, className, ...props }: ModalBackdropProps) => {
  return (
    <form method="dialog" className="modal-backdrop">
      <button className={cn(className)} {...props}>
        {children}
      </button>
    </form>
  );
};

export { Modal, ModalContent, ModalClose };
