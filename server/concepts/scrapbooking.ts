import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { ScrapbookItem } from "./adts/scrapbookItems"; // ScrapbookItem extends BaseDoc
import { NotFoundError } from "./errors";

export default class ScrapbookConcept {
  public posts: DocCollection<ScrapbookItem>;

  constructor(collectionName: string) {
    this.posts = new DocCollection<ScrapbookItem>(collectionName);
  }

  async addPost(userId: ObjectId, itemId: ObjectId, pageNumber: number, position: { x: number; y: number }) {
    // Create a new scrapbook entry with the itemID, page number, and position
    const scrapbookEntry = {
      itemId,
      page: pageNumber,
      position,
      userId: userId,
    };
    const scrapBookEntryMongo = await this.posts.createOne(scrapbookEntry);
    return { msg: "Post added to scrapbook!", post: scrapBookEntryMongo };
  }

  async removePost(postId: ObjectId) {
    const existingPost = await this.posts.readOne({ _id: postId });
    if (!existingPost) {
      throw new NotFoundError("Post not found in scrapbook.");
    }
    await this.posts.deleteOne({ _id: postId });
    return { msg: "Post removed from scrapbook!" };
  }

  async getPosts(userId: ObjectId) {
    return await this.posts.readMany({ userId });
  }
}
