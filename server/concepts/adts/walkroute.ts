import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";
import { Observation } from "./observation";


export interface Location {
    latitude: number;
    longitude: number;
  }

export interface PointOfInterest {
    location: Location;
    description: string;
    observation?: Observation;
  }

export interface RouteDoc extends BaseDoc {
    name: String;
    tags?: String[] 
    author: ObjectId;                  // The user who created the route
    waypoints: PointOfInterest[];       // List of Points of Interest (POIs)
    completed: boolean;                 // Whether the route is completed
    imageURL?: string;
    activeUsers: Set<ObjectId>;
  }