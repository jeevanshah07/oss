"use client";

import { useMemo, useCallback, useEffect, useState, Key } from "react";
import {
  Input,
  Spinner,
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@heroui/react";
import { Search } from "lucide-react";
import { majorColumns } from "../lib/data";
import { majorStats } from "../lib/types";

export default function MajorTable() {
  const [stats, setStats] = useState<majorStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStats = stats.filter((stat) => {
    return stat._id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderCell = useCallback((rowValue: majorStats, columnKey: Key) => {
    switch (columnKey) {
      case "major":
        return rowValue._id;
      case "count":
        return rowValue.studentCount;
      case "gpa":
        return rowValue.averageGPA.toPrecision(3);
      default:
        return null;
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <Input
          isClearable
          placeholder="Search for a major..."
          startContent={<Search className="text-default-400" size={20} />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          className="max-w-xs"
        />
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {stats.length} majors
          </span>
        </div>
      </div>
    );
  }, [searchQuery, stats]);

  useEffect(() => {
    fetch("/api/stats/majors")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .then(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Table
        aria-label="Student Table"
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        isStriped
        isHeaderSticky
      >
        <TableHeader columns={majorColumns}>
          {(col) => <TableColumn key={col.key}>{col.label}</TableColumn>}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          items={filteredStats}
          emptyContent="No stats found!"
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
    </>
  );
}
