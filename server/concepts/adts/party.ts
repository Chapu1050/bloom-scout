import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";
import { Observation } from "./observation";

export interface Party extends BaseDoc {
    leader: ObjectId;             // Party leader's user ID
    users: Set<ObjectId>;         // Set of user IDs in the party
    sharedObservations: Array<Observation>; // Shared observations within the party
  }