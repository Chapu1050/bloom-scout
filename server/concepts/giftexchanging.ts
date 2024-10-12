import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Gift } from "./adts/scrapbookItems";
import { NotFoundError } from "./errors";

export class GiftExchangeConcept {
  public gifts: DocCollection<Gift>;

  constructor(collectionName: string) {
    this.gifts = new DocCollection<Gift>(collectionName); // Use GiftDoc to include userId
  }

  async earnGift(userId: ObjectId, gift: Gift) {
    const giftDoc: Gift = { ...gift, userId }; // Include userId in the gift document
    await this.gifts.createOne(giftDoc); // Save gift associated with user
    return { msg: "Gift earned!", gift };
  }

  async sendGift(senderId: ObjectId, recipientId: ObjectId, gift: Gift) {
    const senderGift = await this.gifts.readOne({ userId: senderId, id: gift.id });
    
    if (!senderGift) {
      throw new NotFoundError("Gift not found in sender's inventory");
    }

    await this.gifts.deleteOne({ userId: senderId, id: gift.id }); // Remove gift from sender
    const recipientGiftDoc: Gift = { ...gift, userId: recipientId }; // Create a new gift document for recipient
    await this.gifts.createOne(recipientGiftDoc); // Add gift to recipient's inventory

    return { msg: `Gift sent to recipient!`, gift };
  }
}