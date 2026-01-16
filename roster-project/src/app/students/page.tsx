"use client";
import { useMemo, useState, useEffect, useCallback, Key } from "react";
import {
  addToast,
  TableColumn,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  useDisclosure,
  Button,
  Input,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@heroui/react";
import { columns } from "./lib/data";
import { Search } from "lucide-react";
import NewStudent from "../components/newStudent";
import EditStudent from "./components/editStudent";
import CourseChip from "./components/courseChip";
import RemoveStudent from "./components/removeStudent";
import dynamic from "next/dynamic";

import type { student } from "@/api/types";
import type { Selection } from "@heroui/react";
import { FaChevronDown } from "react-icons/fa";
import DeleteMany from "./components/deleteAll";

const Table = dynamic(() => import("@heroui/table").then((c) => c.Table), {
  ssr: false,
});

const INITIAL_VISIBLE_COLUMNS = ["first", "last", "major", "gpa", "actions"];

function toTitleCase(str: string): string {
  if (str === "graduatingYear") return "Graduating Year";
  if (str === "gpa") return "GPA";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function Page() {
  const [students, setStudents] = useState<student[]>([]);
  const [updated, setUpdated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const { isOpen, onOpen } = useDisclosure();

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.key),
    );
  }, [visibleColumns]);

  const handleDelete = () => {
    fetch("/api/students/many", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _ids: selectedKeys === "all" ? "all" : Array.from(selectedKeys),
      }),
    }).then((res) => {
      if (res.ok) {
        addToast({
          title: "All Students Deleted",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        addToast({
          title: "Error",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    });
    refreshTable();
  };

  const refreshTable = () => {
    setUpdated((prev) => !prev);
    setSelectedKeys(new Set([]));
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const pages = Math.ceil(filteredStudents.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredStudents.slice(start, end);
  }, [page, filteredStudents, rowsPerPage]);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

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
        case "minor":
          return rowValue.minor;
        case "gpa":
          return rowValue.gpa.toPrecision(3);
        case "classes":
          return (
            <div>
              {rowValue.classes.map((course, idx) => (
                <CourseChip
                  key={idx}
                  onUpdate={refreshTable}
                  courseName={course.name}
                  _id={rowValue._id}
                />
              ))}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <EditStudent _id={rowValue._id} onUpdate={refreshTable} />
              <RemoveStudent _id={rowValue._id} onUpdate={refreshTable} />
            </div>
          );
        default:
          return null;
      }
    },
    [onOpen],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <Input
          isClearable
          placeholder="Search students..."
          startContent={<Search className="text-default-400" size={20} />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          className="max-w-xs"
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<FaChevronDown />} variant="flat">
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.key} className="capitalize">
                  {toTitleCase(column.key)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <NewStudent onUpdate={refreshTable} />
          <DeleteMany isDisabled={isDisabled} onUpdate={handleDelete} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {students.length} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-solid outline-transparent text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    handleDelete,
    searchQuery,
    visibleColumns,
    students.length,
    onRowsPerPageChange,
    isDisabled,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, page]);

  useEffect(() => {
    const isFull = selectedKeys === "all" ? true : selectedKeys.size > 0;
    setIsDisabled(!isFull);
  }, [selectedKeys]);

  useEffect(() => {
    setIsLoading(true);
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
    setIsLoading(false);
  }, [isOpen, updated]);

  return (
    <div>
      <div className="mx-5">
        <Table
          aria-label="Student Table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          isStriped
          isHeaderSticky
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={headerColumns}>
            {(col) => <TableColumn key={col.key}>{col.label}</TableColumn>}
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner label="Loading..." />}
            items={items}
            emptyContent="No students found!"
          >
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
      <div></div>
    </div>
  );
}
