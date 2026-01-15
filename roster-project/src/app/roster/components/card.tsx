"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Button,
} from "@heroui/react";
import type { classGet } from "@/api/types";
import Link from "next/link";

interface cardProps {
  name: string;
}

export default function ClassCard({ name }: cardProps) {
  const [info, setInfo] = useState<classGet>();

  useEffect(() => {
    fetch(`/api/classes/${name}`)
      .then((res) => res.json())
      .then((data) => setInfo(data));
  }, [name]);

  return (
    <>
      {info ? (
        <div className="pl-2 pb-[10px] w-[280px]">
          <Card className="py-1">
            <CardHeader className="pb-1 pt-2 px-4 flex-col items-start">
              <p className="text-3xl italic">{info["name"]}</p>
            </CardHeader>
            <Divider />
            <CardBody className="py-2">
              <p className="text-xl">Professor: {info["professor"]}</p>
              <p className="text-md">Credits: {info["credits"]}</p>
              <p className="text-md">
                Class Size: {info["students"] ? info["students"].length : 0}
              </p>
            </CardBody>
            <Divider />
            <CardFooter>
              <Link href={`/class/${name}`}>
                <Button className="hover:bg-color-purple-700" color="secondary">
                  {" "}
                  Manage{" "}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Spinner color="primary" label="loading" />
      )}
    </>
  );
}
