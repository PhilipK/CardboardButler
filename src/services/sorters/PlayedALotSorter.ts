import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

function getSafePlayCount(a: GameInfoPlus) {
    return ("plays" in a && a.plays && a.plays.length) || 0;
}

export class PlayedALotSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.recentlySoter)];
    }
    private recentlySoter(a: GameInfoPlus, b: GameInfoPlus): number {
        return getSafePlayCount(b) - getSafePlayCount(a);
    }

}






