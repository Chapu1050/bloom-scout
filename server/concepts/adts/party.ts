import { ObjectId } from "mongodb";
import { BaseDoc } from "../../framework/doc";

export interface Party extends BaseDoc {
    leader: ObjectId;             // Party leader's user ID
    users: Array<ObjectId>;         // Set of user IDs in the party
    sharedObservations: Array<ObjectId>; // Shared observations within the party
  }