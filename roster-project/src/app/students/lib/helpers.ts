import type { Course, Grade } from "@/api/types";

export function calculateGPA(courses: Course[]): number {
  let credits: number = 0;
  let points: number = 0;

  courses.map((course) => {
    credits += Number(course.credits);
    points += Number(course.credits) * switchGrade(course.grade as Grade);
  });

  return points / credits;
}

function switchGrade(grade: Grade): number {
  switch (grade) {
    case "A":
      return 4;
    case "B+":
      return 3.5;
    case "B":
      return 3;
    case "C+":
      return 2.5;
    case "C":
      return 2;
    case "D":
      return 1;
    case "F":
      return 0;
  }
}
