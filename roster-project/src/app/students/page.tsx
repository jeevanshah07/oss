"use client";
import { useState, useEffect, useCallback, Key } from "react";
import {
  addToast,
  Chip,
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
} from "@heroui/react";
import { columns } from "./lib/data";
import { student } from "@/api/types";
import { MdDelete } from "react-icons/md";
import NewStudent from "../components/newStudent";
import EditStudent from "./components/editStudent";

export default function Page() {
  const [students, setStudents] = useState<student[]>([]);
  const [updated, setUpdated] = useState<boolean>(false);
  const { isOpen, onOpen } = useDisclosure();

  const refreshTable = () => {
    setUpdated((prev) => !prev);
  };

  const handleDelete = async (_id: String) => {
    refreshTable();

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
        case "gpa":
          return rowValue.gpa;
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
              <EditStudent _id={rowValue._id} onUpdate={refreshTable} />
              <Tooltip color="danger" content="Delete Student">
                <div className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Button
                    variant="light"
                    color="danger"
                    isIconOnly
                    onPress={() => handleDelete(rowValue._id)}
                  >
                    <MdDelete />
                  </Button>
                </div>
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
      <div className="fixed top-20 right-4 hover:bg-green-600">
        <NewStudent onUpdate={refreshTable} />
      </div>
      <Spacer y={16} />

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
    </div>
  );
}
