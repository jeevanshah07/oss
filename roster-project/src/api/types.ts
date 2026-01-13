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
  classes: string[];
  gpa: number;
}
