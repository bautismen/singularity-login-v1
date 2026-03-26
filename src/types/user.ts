export interface User {
  _Id: string;
  Email: string;
  Name: string | null;
  Roles: string[];
  CreatedAt: string;
  UpdatedAt: string;
}