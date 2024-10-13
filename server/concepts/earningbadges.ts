import { ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { Badge } from "./adts/scrapbookItems"; // Assuming Badge extends BaseDoc

export default class BadgeSystemConcept {
  public badges: DocCollection<Badge>;

  constructor(collectionName: string) {
    this.badges = new DocCollection<Badge>(collectionName);
  }

  async earnBadge(userId: ObjectId, badge: { name: string, criteria: string }) {
    // Add the userId to the badge document to keep track of ownership
    const userBadge = {...badge, userId: userId };
    const badgeId = await this.badges.createOne(userBadge);
    return { msg: `Badge earned!: badgeID: ${badgeId}`, badge: userBadge };
  }

  async viewBadges(userId: ObjectId) {
    // Fetch all badges belonging to the user
    const userBadges = await this.badges.readMany({ userId: userId });
    return { badges: userBadges };
  }
}
