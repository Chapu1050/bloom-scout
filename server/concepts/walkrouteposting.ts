import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Observation } from "./adts/observation";
import { Location, RouteDoc } from "./adts/walkroute";
import { NotFoundError } from "./errors";

export default class PostingRouteConcept {
  public readonly routes: DocCollection<RouteDoc>;

  constructor(collectionName: string) {
    this.routes = new DocCollection<RouteDoc>(collectionName);
  }

  async startRoute(userId: ObjectId, name: string, loc: Location) {
    const newRoute = {
      author: userId,
      waypoints: [{ location: loc, description: "Start point" }],
      completed: false,
      name: name,
      activeUsers: new Set([userId]), // Add user to active users
    };
    const dataRoute = await this.routes.createOne(newRoute);
    return { msg: "Route started!", route: dataRoute };
  }

  async addActiveUser(routeId: ObjectId, userId: ObjectId) {
    const route = await this.routes.readOne({ _id: routeId });
    if (!route || route.completed) throw new NotFoundError(`Route ${routeId} not found or completed!`);
    route.activeUsers.add(userId);
    await this.routes.replaceOne({ _id: routeId }, route);
    return { msg: "User added to active users!" };
  }

  async removeActiveUser(routeId: ObjectId, userId: ObjectId) {
    const route = await this.routes.readOne({ _id: routeId });
    if (!route || route.completed) throw new NotFoundError(`Route ${routeId} not found or completed!`);
    route.activeUsers.delete(userId);
    await this.routes.replaceOne({ _id: routeId }, route);
    return { msg: "User removed from active users!" };
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

    
    for (const userId of Array.from(route.activeUsers)) {
        await this.removeActiveUser(_id, userId); // Call removeActiveUser for each active user
    }

    route.completed = true;
    await this.routes.replaceOne({ _id }, route);
    return { msg: "Route completed!" };
  }

  async getRoutes() {
    // Fetch all routes, sorted by creation date or any other criteria
    return await this.routes.readMany({}, { sort: { _id: -1 } });
  }

  async delete(_id: ObjectId) {
    await this.routes.deleteOne({ _id });
    return { msg: "Route deleted!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const route = await this.routes.readOne({ _id });
    if (!route) throw new NotFoundError(`Route ${_id} does not exist!`);
    if (route.author.toString() !== user.toString()) throw new Error("Route does not match");
  }
}
