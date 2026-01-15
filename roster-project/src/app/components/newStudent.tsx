import { useState } from "react";
import {
  Button,
  Modal,
  addToast,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  useDisclosure,
} from "@heroui/react";

interface newStudentProps {
  onUpdate?: () => void;
}

export default function NewStudent({ onUpdate }: newStudentProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [studentFirstName, setStudentFirstName] = useState<string>("");
  const [studentLastName, setStudentLastName] = useState<string>("");
  const [studentGradYear, setStudentGradYear] = useState<string>("");
  const [studentMajor, setStudentMajor] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=43200",
        },
        body: JSON.stringify({
          first: studentFirstName,
          last: studentLastName,
          grad: studentGradYear,
          major: studentMajor,
        }),
      });

      if (onUpdate) {
        onUpdate();
      }

      if (res.ok) {
        setStudentFirstName("");
        setStudentLastName("");
        setStudentGradYear("");
        setStudentMajor("");
        addToast({
          title: "Student Created!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        addToast({
          title: "Error!",
          description: "Error Creating Student!",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      console.error(`Error adding student: ${error}`);
    }
  };

  return (
    <>
      <Button color="success" onPress={onOpen}>
        Add new student
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form onSubmit={handleSubmit}>
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Create New Student
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      isRequired
                      className="w-[400px]"
                      label="First Name"
                      type="text"
                      value={studentFirstName}
                      onValueChange={setStudentFirstName}
                    />
                    <Input
                      isRequired
                      className="w-[400px]"
                      label="Last Name"
                      type="text"
                      value={studentLastName}
                      onValueChange={setStudentLastName}
                    />
                    <Input
                      isRequired
                      className="w-[400px]"
                      label="Class Of"
                      type="text"
                      value={studentGradYear}
                      onValueChange={setStudentGradYear}
                    />
                    <Input
                      isRequired
                      className="w-[400px]"
                      label="Major"
                      type="text"
                      value={studentMajor}
                      onValueChange={setStudentMajor}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" type="submit">
                      Create
                    </Button>
                  </ModalFooter>
                </>
              );
            }}
          </ModalContent>
        </Form>
      </Modal>
    </>
  );
}
