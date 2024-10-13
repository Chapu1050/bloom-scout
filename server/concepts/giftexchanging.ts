import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Gift } from "./adts/scrapbookItems";
import { NotFoundError } from "./errors";

export default class GiftExchangeConcept {
  public gifts: DocCollection<Gift>;

  constructor(collectionName: string) {
    this.gifts = new DocCollection<Gift>(collectionName); // Use GiftDoc to include userId
  }

  async earnGift(userId: ObjectId, gift: { value: number, route: ObjectId }) {
    const giftDoc = { ...gift, userId }; // Include userId in the gift document
    const giftMongo = await this.gifts.createOne(giftDoc); // Save gift associated with user
    return { msg: `Gift earned! ${giftMongo}` };
  }

  async sendGift(senderId: ObjectId, recipientId: ObjectId, giftId: ObjectId) {
    const senderGift = await this.gifts.readOne({ _id: giftId, userId: senderId });

    if (!senderGift) {
      throw new NotFoundError(`Gift not found in sender's inventory, gift ID: ${giftId}`);
    }

    // Update the userId to the new recipientId
    senderGift.userId = recipientId;
    senderGift.dateUpdated = new Date(); // Update the timestamp

    // Save the updated gift in the database under the recipient's inventory
    await this.gifts.replaceOne({ _id: giftId}, senderGift);

    return { msg: `Gift sent to recipient: ${recipientId}!`, gift: senderGift };
  }


  async getGiftInventory(userId: ObjectId) {
    const gifts = await this.gifts.readMany({ userId }); // Fetch all gifts for the user
    return gifts; // Return the user's gift inventory
  }

}