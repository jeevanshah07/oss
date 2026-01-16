export type classGet = {
  _id: string;
  name: string;
  students: string[];
  professor: string;
  credits: number;
};

export type student = {
  _id: string;
  firstName: string;
  lastName: string;
  graduatingYear: number;
  major: string;
  minor: string;
  classes: Course[];
  gpa: number;
}

export type Course = {
  name: string;
  credits: string;
  grade: string;
}

export type Grade = "A" | "B+" | "B" | "C+" | "C" | "D" | "F"

export type GradesByID = Record<string, Grade>

export const GRADES = ["A", "B+", "B", "C+", "C", "D", "F"]
