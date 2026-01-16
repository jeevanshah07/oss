"use client";
import { useState, useEffect } from "react";
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
  Tooltip,
} from "@heroui/react";
import { MdModeEditOutline } from "react-icons/md";
import MajorSelect from "@/app/components/majorSelect";

interface newStudentProps {
  _id: string;
  onUpdate?: () => void;
}

export default function EditStudent({ _id, onUpdate }: newStudentProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [studentFirstName, setStudentFirstName] = useState<string>("");
  const [studentLastName, setStudentLastName] = useState<string>("");
  const [studentGradYear, setStudentGradYear] = useState<string>("");
  const [studentMajor, setStudentMajor] = useState<string>("");
  const [studentMinor, setStudentMinor] = useState<string>("");
  const [studentGPA, setStudentGPA] = useState<string>("");

  const handleMinorChange = (value: string) => {
    setStudentMajor(value);
  };

  const handleMajorChange = (value: string) => {
    setStudentMajor(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();

    try {
      const res = await fetch(`/api/students/${_id}`, {
        method: "PATCH",
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
        addToast({
          title: "Student Updated!",
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

  useEffect(() => {
    fetch(`/api/students/${_id}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentFirstName(data["firstName"]);
        setStudentLastName(data["lastName"]);
        setStudentGPA(data["gpa"]);
        setStudentGradYear(data["graduatingYear"]);
        setStudentMajor(data["major"]);
        setStudentMinor(data["minor"]);
      });
  }, [_id]);

  return (
    <>
      <Tooltip color="warning" content="Edit Student">
        <div className="text-lg text-danger cursor-pointer active:opacity-50">
          <Button variant="light" color="warning" isIconOnly onPress={onOpen}>
            <MdModeEditOutline />
          </Button>
        </div>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form onSubmit={handleSubmit}>
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Edit Student
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
                    <MajorSelect
                      value={studentMajor}
                      type="major"
                      onUpdate={handleMajorChange}
                    />
                    <MajorSelect
                      value={studentMinor}
                      type="minor"
                      onUpdate={handleMinorChange}
                    />
                    <Input
                      isReadOnly
                      className="w-[400px]"
                      label="GPA"
                      variant="bordered"
                      value={studentGPA}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" type="submit">
                      Update
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
