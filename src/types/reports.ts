export interface Report {
  _id?: string;
  id_report: string;
  category: string;
  name_report: string;
  description: string;
  id_user: string;
  user_name: string;
  creation:Date;
  Dataset?: any;
  parameter: any[];
  selected?: boolean;
  Status: number;
  archived: false;
  Data_state: number;
}