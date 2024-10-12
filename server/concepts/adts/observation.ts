import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";

export interface Observation extends BaseDoc{
    author: ObjectId;        // ID of the user who made the observation
    content: Content;       // The observed content (e.g., species, post)
    location: Location;    // Where the observation was made (latitude, longitude)
    timestamp: Date;       // When the observation was made
    imageUrl?: string; 
  }
  
export interface Location {
    latitude: number;
    longitude: number;
  }

export interface Content {
    id: string;           // Unique identifier for the content
    type: string;         // Type of content (e.g., "organism", "structure")
  }


export interface Organism  extends Content{
    id: string;             // A unique identifier for the organism (could be from iNaturalist or your system)
    commonName: string;     // Common name of the organism (e.g., "Red Maple")
    scientificName: string; // Scientific name of the organism (e.g., "Acer rubrum")
    family?: string;        // Optional: The family the organism belongs to (e.g., "Aceraceae")
    taxonRank?: string;     // Optional: The taxonomic rank of the organism (e.g., "species", "genus")
    imageUrl?: string;      // Optional: A URL to an image of the organism
  }
  

export interface Structure extends Content {
    name: string;           // Name of the structure
    yearBuilt?: number;     // Year the structure was built
    imageUrl?: string; 
  }


  