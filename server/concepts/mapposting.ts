import DocCollection from "../framework/doc";
import { FilterOptions } from "./adts/filter";
import { Location, Observation } from "./adts/observation";
import { NotFoundError } from "./errors";

export default class InteractiveMapConcept {
  public readonly observations: DocCollection<Observation>;
  public map: Map<Location, Observation>;

  constructor(collectionName: string) {
    this.observations = new DocCollection<Observation>(collectionName);
    this.map = new Map();
  }

  async addObservation(loc: Location, obs: Observation) {
    await this.observations.createOne(obs);  // Save observation in DB
    this.map.set(loc, obs);  // Add to map
    return { msg: "Observation added to map!", obs };
  }

  async filter(options: FilterOptions) {
    // Create the filter logic based on provided options
    const filter: any = {};

    if (options.dateRange) {
      filter.timestamp = {
        $gte: options.dateRange.start,
        $lte: options.dateRange.end
      };
    }

    if (options.location) {
      // Implement location-based filtering (you may want to use geospatial queries here)
      filter["location.latitude"] = options.location.latitude;
      filter["location.longitude"] = options.location.longitude;
    }

    if (options.organismType) {
      filter["content.type"] = options.organismType;
    }

    if (options.authorId) {
      filter.author = options.authorId;
    }

    const filteredObservations = await this.observations.readMany(filter);

    // Update the map with filtered results
    this.map.clear();  // Clear map before adding filtered results
    filteredObservations.forEach(obs => this.map.set(obs.location, obs));

    return filteredObservations;
  }

  async viewObservation(loc: Location) {
    const observation = this.map.get(loc);
    if (!observation) {
      throw new NotFoundError(`No observation found at this location: ${loc}`);
    }
    return observation;
  }
}
