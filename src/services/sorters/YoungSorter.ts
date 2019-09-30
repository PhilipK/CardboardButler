import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

export class YoungSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.newYearSorter)];
    }
    private newYearSorter(a: GameInfo, b: GameInfo): number {
        return (b.yearPublished || -100000) - (a.yearPublished || -10000);
    }
}