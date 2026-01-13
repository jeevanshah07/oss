"use client";
import React, { useState, useEffect } from "react";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Form,
} from "@heroui/react";
import ClassCard from "./components/card";

export default function Roster() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [classes, setClasses] = useState<string[]>([]);
  const [updated, setUpdated] = useState<boolean>(false);

  const [className, setClassName] = useState<string>("");
  const [professor, setProfessor] = useState<string>("");
  const [credits, setCredits] = useState<string>("1");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data));
  }, [updated]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (className !== "" && professor !== "") {
      onClose();
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: className,
          professor: professor,
          credits: credits,
          students: [],
        }),
      });

      const data = await res.json();
      if (data["id"] !== undefined && res.ok) {
        setClassName("");
        setProfessor("");
      } else if (res.status == 400) {
        addToast({
          title: "Error Creating Class",
          description: "Class Already Exists",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "danger",
        });
      } else {
        alert("Error creating class!");
      }
      setUpdated((prev) => !prev);
    }
  };

  return (
    <>
      <div>
        <Button
          className="fixed top-20 right-4 hover:bg-green-600"
          color="success"
          onPress={onOpen}
        >
          Create New Class
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <Form onSubmit={handleSubmit}>
            <ModalContent>
              {(onClose) => {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Create New Class
                    </ModalHeader>
                    <ModalBody>
                      <Input
                        isRequired
                        className="w-[400px]"
                        label="Course Name"
                        type="text"
                        value={className}
                        onValueChange={setClassName}
                      />
                      <Input
                        isRequired
                        className="w-[400px]"
                        label="Professor"
                        type="text"
                        value={professor}
                        onValueChange={setProfessor}
                      />
                      <Input
                        isRequired
                        className="w-[400px]"
                        label="Credits"
                        type="number"
                        value={credits}
                        onValueChange={setCredits}
                        min="0"
                        max="6"
                        step="0.5"
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
      </div>
      <div className="flex justify-center items-center pb-6">
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl_grid-cols-4 gap-x-5 gap-y-1">
          {classes.map((className, idx) => (
            <div key={idx}>
              <ClassCard name={className} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
