export interface Executive {
  _id?: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  numero_nomina: string;
  fecha_ingreso: string;
  email: string;
  departamento: string;
  status: number;
  archivado: boolean;
  data_state: number;
  created_at?: Date;
  updated_at?: Date;
  _iduser?: string;
}

export interface ExecutiveFormData {
  _Id: String;
  Nombre: string;
  Apellido_paterno: string;
  Apellido_materno: string;
  Numero_nomina: string;
  Fecha_ingreso: string;
  Email: string;
  Departamento: string;
  Status: number;
  _Iduser?: string;
  data_state: Number;
  Archivado: boolean;
}

export const DEPARTMENTS = [
  'Operaciones',
  'Ventas',
  'Administración',
  'Finanzas',
  'Recursos Humanos',
  'Tecnología',
  'Logística',
  'Comercial',
  'Servicio al Cliente',
  'Pricing',
] as const;
