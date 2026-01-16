"use client";
import {
  addToast,
  Button,
  Tooltip,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { MdDelete } from "react-icons/md";

interface removeStudentProps {
  _id: string;
  onUpdate?: () => void;
}
export default function RemoveStudent({ _id, onUpdate }: removeStudentProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDelete = async () => {
    const res = await fetch("/api/students", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: _id,
      }),
    });
    if (res.ok) {
      if (onUpdate) {
        onUpdate();
      }
      addToast({
        title: "Student Deleted",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } else {
      const data = await res.json();
      addToast({
        title: "Error",
        description: data["error"],
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  return (
    <>
      <Tooltip color="danger" content="Delete Student">
        <div className="text-lg text-danger cursor-pointer active:opacity-50">
          <Button variant="light" color="danger" isIconOnly onPress={onOpen}>
            <MdDelete />
          </Button>
        </div>
      </Tooltip>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-xl">
                Confirm remove student?
              </ModalHeader>
              <ModalBody>
                <h1 className="text-md">
                  Are you sure you want to remove the selected student?
                </h1>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onPress={onClose}>
                  Go Back
                </Button>
                <Button color="danger" variant="ghost" onPress={handleDelete}>
                  Remove Student
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
