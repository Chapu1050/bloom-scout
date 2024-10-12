import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import {
  Authing,
  Badging,
  Friending,
  Observing,
  PartyMode,
  Posting,
  PostingRoute,
  Scrapbooking,
  Sessioning
} from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }


  // Observing routes
  @Router.get("/observations")
  async getObservations() {
    return await Observing.getObservations();
  }

  @Router.post("/observations")
  async createObservation(session: SessionDoc, content: string, location: { latitude: number; longitude: number }) {
    const user = Sessioning.getUser(session);
    return await Observing.create(user, { id: new ObjectId().toString(), type: "organism" }, location);
  }

  // Posting Route routes
  @Router.post("/routes")
  async createRoute(session: SessionDoc, location: { latitude: number; longitude: number }) {
    const user = Sessioning.getUser(session);
    return await PostingRoute.startRoute(user, location);
  }

  @Router.patch("/routes/:id/poi")
  async addPOI(session: SessionDoc, id: string, location: { latitude: number; longitude: number }, description: string) {
    const user = Sessioning.getUser(session);
    //return await PostingRoute.addPOI(new ObjectId(id), location, undefined, description);
  }

  // Gift Exchange routes
  @Router.post("/gifts")
  async earnGift(session: SessionDoc, gift: { name: string, value: number }) {
    const user = Sessioning.getUser(session);
    //return await GiftExchange.earnGift(user, gift);
  }

  @Router.post("/gifts/send/:to")
  async sendGift(session: SessionDoc, to: string, gift: { name: string, value: number }) {
    const user = Sessioning.getUser(session);
    const recipient = await Authing.getUserByUsername(to);
   // return await GiftExchange.sendGift(user, recipient._id, gift);
  }

  // Scrapbook routes
  @Router.post("/scrapbook")
  async addScrapbookItem(session: SessionDoc, pageNumber: number, coordinate: { x: number; y: number }, postId: ObjectId) {
    const user = Sessioning.getUser(session);
    return await Scrapbooking.addPost(postId, pageNumber, coordinate);
  }

  @Router.delete("/scrapbook/:id")
  async removeScrapbookItem(session: SessionDoc, id: string) {
    return await Scrapbooking.removePost(new ObjectId(id));
  }

  // Badge routes
  @Router.post("/badges")
  async earnBadge(session: SessionDoc, badge: { name: string, criteria: string }) {
    const userId = Sessioning.getUser(session);
    return await Badging.earnBadge(userId, { ...badge, userId, _id: new ObjectId(), dateCreated: new Date(), dateUpdated: new Date() });
  }

  @Router.get("/badges")
  async viewBadges(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Badging.viewBadges(user);
  }

  // Party Mode routes
  @Router.post("/party")
  async createParty(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await PartyMode.createParty(user);
  }

  @Router.patch("/party/:id/join")
  async joinParty(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    return await PartyMode.joinParty(user, new ObjectId(id));
  }

  @Router.patch("/party/:id/share")
  async shareObservationWithParty(session: SessionDoc, id: string, observationId: string) {
    // const observation = await Observing.getObservations().find(obs => obs._id.equals(observationId));
    // return await PartyMode.shareObservation(observation, new ObjectId(id));
  }


}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
