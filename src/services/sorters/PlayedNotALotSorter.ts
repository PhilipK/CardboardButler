import { Sorter } from "./Sorter";
import { GameInfoPlus } from "../../models/GameInfo";

function getSafePlayCount(a: GameInfoPlus) {
    return ("plays" in a && a.plays && a.plays.length) || 0;
}

export class PlayedNotALotSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.recentlySoter)];
    }
    private recentlySoter(a: GameInfoPlus, b: GameInfoPlus): number {
        return getSafePlayCount(a) - getSafePlayCount(b);
    }

}






