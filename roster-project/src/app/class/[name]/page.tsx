"use client";
import { use, useState, useEffect, useCallback, Key } from "react";
import {
  addToast,
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
} from "@heroui/react";
import { columns } from "./lib/data";
import { classGet, student } from "@/api/types";
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
      switch (columnKey) {
        case "first":
          return rowValue.firstName;
        case "last":
          return rowValue.lastName;
        case "graduatingYear":
          return rowValue.graduatingYear;
        case "major":
          return rowValue.major;
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="danger" content="Remove from class">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Button
                    variant="light"
                    color="danger"
                    isIconOnly
                    onPress={() => handleOpen(rowValue._id)}
                  >
                    <MdDelete />
                  </Button>
                </span>
              </Tooltip>
            </div>
          );
        default:
          return null;
      }
    },
    [handleOpen],
  );

  useEffect(() => {
    fetch(`/api/classes/${decodedName}`)
      .then((res) => res.json())
      .then((data) => setInfo(data));
  }, [decodedName]);

  useEffect(() => {
    fetch(`/api/classes/${decodedName}/students`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const validStudents = data.filter((s: any) => s && s._id);
          setStudents(validStudents);
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
      <div className="px-2">
        <EditClass course={decodedName} />
      </div>
      <AddStudent course={decodedName} onUpdate={refreshTable} />
      <div className="pb-2 flex flex-col items-center justify-center">
        <h1 className="py-2 text-2xl font-bold underline">{decodedName}</h1>
        <Chip color="primary">Professor {info?.professor}</Chip>
        <Spacer y={2} />
        <Chip color="secondary">{info?.credits} Credits</Chip>
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
              <TableRow key={String(item._id)}>
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
                  <Button color="danger" variant="ghost" onPress={handleRemove}>
                    Remove Student
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
