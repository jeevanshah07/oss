"use client";
import {
  Button,
  Tooltip,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@heroui/react";

interface deleteStudentProps {
  onUpdate?: () => void;
  isDisabled: boolean;
}
export default function DeleteMany({ isDisabled, onUpdate }: deleteStudentProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handlePress = () => {
    if (onUpdate) {
      onUpdate();
    }
    onClose();
  };

  return (
    <>
      <Tooltip color="danger" content="Delete Student">
        <div className="text-lg text-danger cursor-pointer active:opacity-50">
          <Button isDisabled={isDisabled} color="danger" onPress={onOpen}>
            Delete Selected Students
          </Button>
        </div>
      </Tooltip>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-bold text-xl">
                Confirm remove selected students?
              </ModalHeader>
              <ModalBody>
                <h1 className="text-md">
                  Are you sure you want to remove the selected student(s)?
                </h1>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onPress={onClose}>
                  Go Back
                </Button>
                <Button color="danger" variant="ghost" onPress={handlePress}>
                  Remove Students
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
