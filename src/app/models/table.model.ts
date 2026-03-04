import { TableStatus } from '../enums/table-status.enum';

export interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  createdAt: string;
}