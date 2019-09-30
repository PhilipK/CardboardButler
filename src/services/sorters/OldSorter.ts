import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

export class OldSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.oldYearSorter)];
    }
    private oldYearSorter(a: GameInfo, b: GameInfo): number {
        return (a.yearPublished || Infinity) - (b.yearPublished || Infinity);
    }
}