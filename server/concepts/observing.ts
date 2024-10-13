import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Content, Location, Observation } from "./adts/observation";
import { NotAllowedError, NotFoundError } from "./errors";


export default class ObservingConcept {
  public readonly observations: DocCollection<Observation>;

  constructor(collectionName: string) {
    this.observations = new DocCollection<Observation>(collectionName);
  }

  async create(author: ObjectId, content: Content, location: Location) {
    const _id = await this.observations.createOne({ userId: author, author, content, location, timestamp: new Date() });
    return { msg: "Observation successfully created!", observation: await this.observations.readOne({ _id }) };
  }

  async getObservations() {
    return await this.observations.readMany({}, { sort: { _id: -1 } });
  }

  async addSharedObservation(userId: ObjectId, observation: Observation) {

    const location: Location = observation.location;
    const newObservation = {
      userId, // Store the userId of the person sharing
      author: observation.author, // The user who created the observation
      content: observation.content,
      location: location, 
      timestamp: new Date(),
      // imageUrl: undefined, // Uncomment if you want to allow images
    };

    const _id = await this.observations.createOne(newObservation);
    return { msg: "Observation successfully shared!", observation: await this.observations.readOne({ _id }) };
  }

  async getByAuthor(author: ObjectId) {
    return await this.observations.readMany({ author });
  }

  async update(_id: ObjectId, content?: Content, location?: Location) {
    await this.observations.partialUpdateOne({ _id }, { content, location });
    return { msg: "Observation successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.observations.deleteOne({ _id });
    return { msg: "Observation deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const observation = await this.observations.readOne({ _id });
    if (!observation) {
      throw new NotFoundError(`Observation ${_id} does not exist!`);
    }
    if (observation.author.toString() !== user.toString()) {
      throw new ObservationAuthorNotMatchError(user, _id);
    }
  }
}

export class ObservationAuthorNotMatchError extends NotAllowedError {
  constructor(public readonly author: ObjectId, public readonly _id: ObjectId) {
    super("{0} is not the author of observation {1}!", author, _id);
  }
}
