export interface Report {
  id?: string;
  id_report: string;
  category: string;
  name_report: string;
  description: string;
  id_user: string;
  user_name: string;
  creation:Date;
  parameter: any;
  selected?: boolean;
  archived: false;
}