export interface Executive {
  _id?: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  numero_nomina: string;
  fecha_ingreso: string;
  email: string;
  departamento: string;
  activo: boolean;
  archivado: boolean;
  estado: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ExecutiveFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  numero_nomina: string;
  fecha_ingreso: string;
  email: string;
  departamento: string;
  activo: boolean;
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
