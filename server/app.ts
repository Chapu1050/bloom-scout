import AuthenticatingConcept from "./concepts/authenticating";
import BadgeSystemConcept from "./concepts/earningbadges";
import FriendingConcept from "./concepts/friending";
import GiftExchangeConcept from "./concepts/giftexchanging";
import ObservingConcept from "./concepts/observing";
import PartyModeConcept from "./concepts/partying";
import PostingConcept from "./concepts/posting";
import ScrapbookConcept from "./concepts/scrapbooking";
import SessioningConcept from "./concepts/sessioning";
import PostingRouteConcept from "./concepts/walkrouteposting";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Observing = new ObservingConcept("observations");
export const PostingRoute = new PostingRouteConcept("routes");
export const GiftExchange = new GiftExchangeConcept("gifts");
export const Scrapbooking = new ScrapbookConcept("scrapbook");
export const Badging = new BadgeSystemConcept("badges");
export const PartyMode = new PartyModeConcept("parties");