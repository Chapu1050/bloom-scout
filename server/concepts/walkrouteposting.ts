import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Observation } from "./adts/observation";
import { Location, RouteDoc } from "./adts/walkroute";
import { NotAllowedError, NotFoundError } from "./errors";

export default class PostingRouteConcept {
  public readonly routes: DocCollection<RouteDoc>;

  constructor(collectionName: string) {
    this.routes = new DocCollection<RouteDoc>(collectionName);
  }

  async startRoute(author: ObjectId, loc: Location) {
    const _id = await this.routes.createOne({ author, waypoints: [{ location: loc, description: "Start point" }], completed: false });
    return { msg: "Route started!", route: await this.routes.readOne({ _id }) };
  }

  async addPOI(_id: ObjectId, loc: Location, desc: string, obs?: Observation) {
    const route = await this.routes.readOne({ _id });
    if (!route || route.completed) throw new NotFoundError(`Route ${_id} not found or completed!`);
    route.waypoints.push({ location: loc, description: desc, observation: obs });
    await this.routes.replaceOne({ _id }, route);
    return { msg: "POI added to route!" };
  }

  async completeRoute(_id: ObjectId) {
    const route = await this.routes.readOne({ _id });
    if (!route || route.completed) throw new NotFoundError(`Route ${_id} not found or completed!`);
    route.completed = true;
    await this.routes.replaceOne({ _id }, route);
    return { msg: "Route completed!" };
  }

  async delete(_id: ObjectId) {
    await this.routes.deleteOne({ _id });
    return { msg: "Route deleted!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const route = await this.routes.readOne({ _id });
    if (!route) throw new NotFoundError(`Route ${_id} does not exist!`);
    if (route.author.toString() !== user.toString()) throw new RouteAuthorNotMatchError(user, _id);
  }
}

export class RouteAuthorNotMatchError extends NotAllowedError {
  constructor(public readonly author: ObjectId, public readonly _id: ObjectId) {
    super("{0} is not the author of route {1}!", author, _id);
  }
}
