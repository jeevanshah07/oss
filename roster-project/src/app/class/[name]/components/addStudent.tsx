"use client";
import { useState, useEffect, useCallback, Key } from "react";
import {
  Modal,
  addToast,
  Chip,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  useDisclosure,
  Tooltip,
  Button,
  Spacer,
  Divider,
} from "@heroui/react";
import { allColumns } from "../lib/data";
import { student } from "@/api/types";
import { FaPlus } from "react-icons/fa";
import NewStudent from "@/app/components/newStudent";

interface addStudentProps {
  course: string;
  onUpdate?: () => void;
}

export default function AddStudent({ course, onUpdate }: addStudentProps) {
  const [students, setStudents] = useState<student[]>([]);
  const [updated, setUpdated] = useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const refreshTable = () => {
    setUpdated((prev) => !prev);
  };

  const handleAdd = async (_id: String) => {
    try {
      const res = await fetch(`/api/classes/${course}/students`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: _id,
        }),
      });

      setUpdated((prev) => !prev);

      if (onUpdate) {
        onUpdate();
      }
      if (res.ok) {
        addToast({
          title: "Student Added!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else if (res.status == 400) {
        addToast({
          title: "Error!",
          description: "Student already in class",
          color: "warning",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const renderCell = useCallback(
    (rowValue: student, columnKey: Key) => {
      switch (columnKey) {
        case "first":
          return rowValue.firstName;
        case "last":
          return rowValue.lastName;
        case "graduatingYear":
          return rowValue.graduatingYear;
        case "major":
          return rowValue.major;
        case "classes":
          return (
            <div>
              {rowValue.classes.map((course) => (
                <Chip key={course} className="p-1 m-1 text-md">
                  {course}
                </Chip>
              ))}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="primary" content="Add to class">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Button
                    variant="light"
                    color="primary"
                    isIconOnly
                    onPress={() => handleAdd(rowValue._id)}
                  >
                    <FaPlus />
                  </Button>
                </span>
              </Tooltip>
            </div>
          );
        default:
          return null;
      }
    },
    [onOpen],
  );

  useEffect(() => {
    fetch(`/api/students`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const validStudents = data.filter((s: student) => s && s._id);
          setStudents(validStudents);
        } else {
          setStudents([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching students for modal:", err);
        setStudents([]);
      });
  }, [isOpen, updated]);

  return (
    <div>
      <Button
        className="fixed top-20 right-4 hover:bg-green-600"
        color="success"
        onPress={onOpen}
      >
        Add student to class
      </Button>
      <Spacer y={16} />

      <div>
        <Modal size="4xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-bold text-xl">
                  Add Students to Class
                </ModalHeader>
                <Divider />
                <ModalBody>
                  {students.length > 0 ? (
                    <div className="mx-5">
                      <Table aria-label="Add Student Table">
                        <TableHeader columns={allColumns}>
                          {(col) => (
                            <TableColumn key={col.key}>{col.label}</TableColumn>
                          )}
                        </TableHeader>
                        <TableBody
                          emptyContent="No students found!"
                          items={students}
                        >
                          {(item) => (
                            <TableRow key={String(item._id)}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(item, columnKey)}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-lg"> No students found!</h1>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <NewStudent onUpdate={refreshTable} />
                  <Button color="primary" onPress={onClose}>
                    Done
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
