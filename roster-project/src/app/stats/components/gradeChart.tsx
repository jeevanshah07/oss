"use client";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Spinner } from "@heroui/react";
import { generateColors } from "../lib/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

interface chartProps {
  course: string;
}

type majorGET = {
  count: number;
  major: string;
};

export default function Chart({ course }: chartProps) {
  const [grades, setGrades] = useState<number[]>([]);

  const [majors, setMajors] = useState<string[]>([]);
  const [majorCount, setMajorCount] = useState<number[]>([]);

  const [isGradesLoading, setIsGradesLoading] = useState<boolean>(true);
  const [isMajorLoading, setIsMajorLoading] = useState<boolean>(true);

  const majorColors = generateColors(66);
  const gradeColors = generateColors(7);

  useEffect(() => {
    fetch(`/api/classes/${course}/majors`)
      .then((res) => res.json())
      .then((data: majorGET[]) => {
        const majors: string[] = [];
        const counts: number[] = [];

        data.forEach((item) => {
          majors.push(item.major);
          counts.push(item.count);
        });

        setMajors(majors);
        setMajorCount(counts);
      })
      .finally(() => setIsMajorLoading(false));
  }, [course]);

  useEffect(() => console.log(majors, majorCount), [majors, majorCount]);

  useEffect(() => {
    fetch(`/api/classes/${course}/grades`)
      .then((res) => res.json())
      .then((data) => setGrades(data))
      .then(() => setIsGradesLoading(false));
  }, []);

  const majorData = {
    labels: majors,
    datasets: [
      {
        label: "# of Students",
        data: majorCount,
        backgroundColor: majorColors.backgroundColors,
        borderColor: majorColors.borderColors,
        borderWidth: 1,
      },
    ],
  };
  const gradeData = {
    labels: ["A", "B+", "B", "C+", "C", "D", "F"],
    datasets: [
      {
        label: "# of Students",
        data: grades,
        backgroundColor: gradeColors.backgroundColors,
        borderColor: gradeColors.backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-2">
      <div>
        {!isGradesLoading ? (
          <Pie
            width={300}
            height={300}
            options={{ maintainAspectRatio: false }}
            data={gradeData}
          />
        ) : (
          <Spinner content="Loading..." />
        )}
      </div>
      <div>
        {!isMajorLoading ? (
          <Pie
            width={300}
            height={300}
            options={{ maintainAspectRatio: false }}
            data={majorData}
          />
        ) : (
          <Spinner content="Loading..." />
        )}
      </div>
    </div>
  );
}
