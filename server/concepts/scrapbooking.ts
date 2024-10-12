import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { ScrapbookItem } from "./adts/scrapbookItems"; // Assuming ScrapbookItem extends BaseDoc
import { NotFoundError } from "./errors";

export class ScrapbookConcept {
  public posts: DocCollection<ScrapbookItem>;

  constructor(collectionName: string) {
    this.posts = new DocCollection<ScrapbookItem>(collectionName);
  }

  async addPost(post: ScrapbookItem, pageNumber: number, coordinate: { x: number; y: number }) {
    // Create a new post object with additional page number and coordinates
    const scrapbookEntry = { 
      ...post, 
      pageNumber, 
      coordinate 
    };
    await this.posts.createOne(scrapbookEntry);
    return { msg: "Post added to scrapbook!", post: scrapbookEntry };
  }

  async removePost(postId: ObjectId) {
    const existingPost = await this.posts.readOne({ id: postId }); 
    if (!existingPost) {
      throw new NotFoundError("Post not found in scrapbook.");
    }
    await this.posts.deleteOne({ id: postId });
    return { msg: "Post removed from scrapbook!" };
  }

  async getPosts() {
    return await this.posts.readMany({}); 
  }
}
