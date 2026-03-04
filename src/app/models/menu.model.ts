import { MenuCategory } from '../enums/menu-category.enum';
import { FoodType } from '../enums/food-type.enum';

export interface Menu {
  _id: string;

  name: string;
  description?: string;

  price: number | null;

  category: MenuCategory;
  foodType: FoodType;

  isAvailable: boolean;

  image?: string;
  preparationTime?: number;

  createdAt?: string;
  updatedAt?: string;
}