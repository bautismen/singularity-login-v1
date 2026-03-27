// src/types/company.ts
export interface Company {
  _Id?: string;
  Business_name: string;
  Rfc_taxid: string;
  Nationality: 'nacional' | 'extranjero';
  Country: string;  
  Status: number;
  Archived: boolean;
  Data_state: number;
  Created_at?: Date;
  Created_by?: {
    User_id: string;
    Name: string;
  };
  Sector_id: number;
  Sector: string;
}
