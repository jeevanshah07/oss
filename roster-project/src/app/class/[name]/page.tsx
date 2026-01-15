"use client";
import { use, useState, useEffect, useCallback, Key } from "react";
import {
  addToast,
  Dropdown,
  DropdownTrigger,
  Modal,
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
  Chip,
  Divider,
  Spacer,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@heroui/react";
import { columns } from "./lib/data";
import type { classGet, student, Course, Grade, GradesByID } from "@/api/types";
import { GRADES } from "@/api/types";
import { MdDelete } from "react-icons/md";
import AddStudent from "./components/addStudent";
import EditClass from "./components/editClass";

export default function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const decodedName = decodeURIComponent(name);

  const [info, setInfo] = useState<classGet>();
  const [students, setStudents] = useState<student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<String>();
  const [updated, setUpdated] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<boolean>(false);
  const [grades, setGrades] = useState<GradesByID>({});

  const updateGrade = async (_id: string, grade: Grade) => {
    setGrades((prev) => ({
      ...prev,
      [_id]: grade,
    }));
    const res = await fetch(`/api/classes/${decodedName}/students`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: _id,
        grade: grade,
      }),
    });

    if (res.ok) {
      addToast({
        title: "Grade Updated!",
        shouldShowTimeoutProgress: true,
        timeout: 3000,
        color: "success",
      });
    } else {
      addToast({
        title: "Error!",
        description: "Error updating grade!",
        shouldShowTimeoutProgress: true,
        timeout: 3000,
        color: "danger",
      });
    }
    refreshTable();
  };

  const refreshInfo = () => {
    setUpdateInfo((prev) => !prev);
  };

  const refreshTable = () => {
    setUpdated((prev) => !prev);
  };

  const handleOpen = useCallback(
    (_id: String) => {
      setSelectedStudent(_id);
      onOpen();
    },
    [onOpen],
  );

  const handleRemove = () => {
    fetch(`/api/classes/${decodedName}/students`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: selectedStudent,
      }),
    });
    refreshTable();
    onClose();
    addToast({
      title: "Student Removed!",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  };

  const renderCell = useCallback(
    (rowValue: student, columnKey: Key) => {
      const studentId = String(rowValue._id);

      switch (columnKey) {
        case "first":
          return rowValue.firstName;

        case "last":
          return rowValue.lastName;

        case "graduatingYear":
          return rowValue.graduatingYear;

        case "major":
          return rowValue.major;

        case "grade": {
          const currentGrade = grades[studentId];

          return (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="ghost">{currentGrade ?? "Select"}</Button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Grade Selection"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={
                  currentGrade ? new Set([currentGrade]) : new Set()
                }
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as Grade;
                  updateGrade(studentId, selected);
                }}
              >
                {GRADES.map((grade) => (
                  <DropdownItem key={grade}>{grade}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          );
        }

        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="danger" content="Remove from class">
                <Button
                  variant="light"
                  color="danger"
                  isIconOnly
                  onPress={() => handleOpen(studentId)}
                >
                  <MdDelete />
                </Button>
              </Tooltip>
            </div>
          );

        default:
          return null;
      }
    },
    [grades, handleOpen],
  );

  useEffect(() => {
    fetch(`/api/classes/${decodedName}`)
      .then((res) => res.json())
      .then((data) => setInfo(data));
  }, [decodedName, updateInfo]);

  useEffect(() => {
    fetch(`/api/classes/${decodedName}/students`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const validStudents = data.filter((s: any) => s && s._id);
          setStudents(validStudents);
          validStudents.map((student: student) => {
            const idx = student.classes.findIndex(
              (cls: Course) => cls.name === decodedName,
            );
            setGrades((prev) => ({
              ...prev,
              [student._id]: student["classes"][idx]["grade"] as Grade,
            }));
          });
        } else {
          setStudents([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
      });
  }, [updated]);

  return (
    <div className="h-dvh">
      {info ? (
        <>
          <div className="px-2">
            <EditClass course={decodedName} onUpdate={refreshInfo} />
          </div>
          <AddStudent
            credits={info.credits}
            course={decodedName}
            onUpdate={refreshTable}
          />
          <div className="pb-2 flex flex-col items-center justify-center">
            <h1 className="py-2 text-2xl font-bold underline">{decodedName}</h1>
            <Chip color="primary">Professor: {info?.professor}</Chip>
            <Spacer y={2} />
            <Chip color="secondary">Credits: {info?.credits}</Chip>
          </div>
          <Divider />
          <Spacer y={2} />
          <div className="mx-5">
            <Table aria-label="Student Table">
              <TableHeader columns={columns}>
                {(col) => (
                  <TableColumn
                    key={col.key}
                    {...(["first", "last"].includes(col.key)
                      ? { allowsSorting: true }
                      : {})}
                  >
                    {col.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={students} emptyContent="No students found!">
                {(item) => (
                  <TableRow key={item._id}>
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
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
                      <Button
                        color="danger"
                        variant="ghost"
                        onPress={handleRemove}
                      >
                        Remove Student
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </>
      ) : (
        <div>
          <Spinner color="primary" />
        </div>
      )}
    </div>
  );
}
