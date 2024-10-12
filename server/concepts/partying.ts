import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Observation } from "./adts/observation";
import { Party } from "./adts/party";


export default class PartyModeConcept {
  public parties: DocCollection<Party>;

  constructor(collectionName: string) {
    this.parties = new DocCollection<Party>(collectionName);
  }

  async createParty(leader: ObjectId) {
    const newParty = {
      leader,
      users: new Set([leader]),   // Initialize with the leader as the first member
      sharedObservations: [],     // Empty list of shared observations
    };
    const _id = await this.parties.createOne(newParty);
    return { msg: "Party created!", partyId: _id };
  }

  async joinParty(userId: ObjectId, partyId: ObjectId) {
    const party = await this.parties.readOne({ _id: partyId });
    if (!party) {
      throw new Error("Party not found.");
    }

    party.users.add(userId); // Add user to the party
    party.dateUpdated = new Date(); // Update the timestamp
    await this.parties.replaceOne({ _id: partyId }, party);
    return { msg: "User joined the party!", party };
  }

  async shareObservation(obs: Observation, partyId: ObjectId) {
    const party = await this.parties.readOne({ _id: partyId });
    if (!party) {
      throw new Error("Party not found.");
    }

    party.sharedObservations.push(obs); // Add the observation to sharedObservations
    party.dateUpdated = new Date(); // Update the timestamp
    await this.parties.replaceOne({ _id: partyId }, party);
    return { msg: "Observation shared!", party };
  }

  async getParty(partyId: ObjectId) {
    const party = await this.parties.readOne({ _id: partyId });
    if (!party) {
      throw new Error("Party not found.");
    }
    return party;
  }
}
