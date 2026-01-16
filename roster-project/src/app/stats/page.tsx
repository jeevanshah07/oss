"use client";
import { useEffect, useState } from "react";
import MajorTable from "./components/majorTable";
import { Accordion, AccordionItem, Tab, Tabs } from "@heroui/react";
import YearTable from "./components/yearTable";
import Chart from "./components/gradeChart";

export default function Page() {
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data));
  }, []);

  return (
    <div className="h-dvh">
      <div className="p-3 m-4 flex item-center justify-center">
        <Accordion defaultExpandedKeys={["1"]} variant="shadow">
          <AccordionItem key="1" title="Stats by Major">
            <MajorTable />
          </AccordionItem>
          <AccordionItem key="2" title="Stats by Graduating Year">
            <YearTable />
          </AccordionItem>
          <AccordionItem key="3" title="Breakdown by Course">
            <Tabs>
              {classes.map((course) => (
                <Tab key={course} title={course}>
                  <Chart course={course}/>
                </Tab>
              ))}
            </Tabs>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
