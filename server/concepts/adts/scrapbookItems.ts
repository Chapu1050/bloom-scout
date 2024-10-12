import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";

export interface ScrapbookItem extends BaseDoc {
  userId: ObjectId;
  id: ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;  // Optional: image associated with the item
}

export interface Gift extends ScrapbookItem {
  value: number;  // Any additional properties specific to gifts
}

export interface Badge extends ScrapbookItem {
  criteria: string;  // Criteria for earning the badge
}
