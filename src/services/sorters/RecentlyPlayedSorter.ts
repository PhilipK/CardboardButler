import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

function getSafeLastPlayed(a: GameInfoPlus) {
    return ("lastPlayed" in a && a.lastPlayed && a.lastPlayed.getTime()) || 0;
}

export class RecentlyPlayedSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.recentlySoter)];
    }
    private recentlySoter(a: GameInfoPlus, b: GameInfoPlus): number {
        return getSafeLastPlayed(b) - getSafeLastPlayed(a);
    }

}






