import { Sorter } from "./Sorter";
import { GameInfoPlus } from "../../models/GameInfo";

function getSafeLastPlayed(a: GameInfoPlus) {
    return ("lastPlayed" in a && a.lastPlayed && a.lastPlayed.getTime()) || 0;
}

export class PlayedLongAgoSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.recentlySoter)];
    }
    private recentlySoter(a: GameInfoPlus, b: GameInfoPlus): number {
        return getSafeLastPlayed(a) - getSafeLastPlayed(b);
    }

}






