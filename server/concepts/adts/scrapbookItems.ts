import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";

export interface Item extends BaseDoc{
  userId: ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;  // Optional: image associated with the item
}

export interface Gift extends Item {
  value: number;  // Any additional properties specific to gifts
  route: ObjectId;
}

export interface Badge extends Item {
  criteria: string;  // Criteria for earning the badge
}

export interface ScrapbookItem extends BaseDoc{
  itemId: ObjectId;
  page: number;
  position: {x: number, y: number}
  userId?: ObjectId;
}