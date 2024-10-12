import { ObjectId } from "mongodb";

export interface FilterOptions {
    dateRange?: {
      start: Date;
      end: Date;
    };  // Filter by a date range (e.g., last week, month)
    location?: {
      latitude: number;
      longitude: number;
      radius?: number;  // Radius in meters to search for observations
    };  // Filter by location, with optional radius
    organismType?: string;  // Filter by specific organism type (e.g., "bird", "tree")
    authorId?: ObjectId;  // Filter by the author (user) who made the observation
  }
  