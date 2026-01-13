import React, { useState, useEffect } from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
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
import { RiDeleteBinFill } from "react-icons/ri";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

interface editClassProps {
  course: string;
  onUpdate?: () => void;
}

export default function EditClass({ course, onUpdate }: editClassProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  const [courseName, setCourseName] = useState<string>("");
  const [professor, setProfessor] = useState<string>("");
  const [credits, setCredits] = useState<string>("");
  const [_id, setID] = useState<string>("");

  useEffect(() => {
    fetch(`/api/classes/${course}`)
      .then((res) => res.json())
      .then((data) => {
        setCourseName(data["name"]);
        setProfessor(data["professor"]);
        setCredits(data["credits"]);
        setID(data["_id"]);
      });
  }, [course]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/classes/${course}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        addToast({
          title: "Class Deleted!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        addToast({
          title: "Error!",
          description: "Error editing class!",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
        const data = await res.json();
        console.error(`Error: ${data["error"]}`);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
    redirect("/roster");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();

    try {
      const res = await fetch(`/api/classes/${course}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=43200",
        },
        body: JSON.stringify({
          name: courseName,
          professor: professor,
          credits: credits,
          _id: _id,
        }),
      });

      if (onUpdate) {
        onUpdate();
      }

      if (res.ok) {
        addToast({
          title: "Class Edited!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        addToast({
          title: "Error!",
          description: "Error Editing Class!",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      console.error(`Error adding student: ${error}`);
    }
    router.push(`/class/${courseName}`);
  };

  return (
    <>
      <Button color="warning" onPress={onOpen}>
        Edit Class
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form onSubmit={handleSubmit}>
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Edit Class
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      isRequired
                      className="w-[400px]"
                      label="Course Name"
                      type="text"
                      value={courseName}
                      onValueChange={setCourseName}
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
                      min="0.5"
                      max="6"
                      step="0.5"
                      value={credits}
                      onValueChange={setCredits}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onPress={onClose}>
                      Close
                    </Button>
                    <Popover placement="right">
                      <PopoverTrigger>
                        <Button className="" color="danger">
                          Delete Class
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="px-1 py-2">
                          <Tooltip
                            placement="bottom-start"
                            color="danger"
                            content="Click to delete"
                          >
                            <span>
                              <Button
                                onPress={handleDelete}
                                color="danger"
                                isIconOnly
                              >
                                <RiDeleteBinFill />
                              </Button>
                            </span>
                          </Tooltip>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button color="primary" type="submit">
                      Done
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
