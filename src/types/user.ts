export interface User {
  _id: string;
  email: string;
  name: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}