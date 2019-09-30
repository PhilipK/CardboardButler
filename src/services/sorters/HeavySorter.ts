import { Sorter } from "./Sorter";
import { GameInfoPlus } from "../../models/GameInfo";

export class HeavySorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.weightHeavySort)];
    }
    private weightHeavySort(a: GameInfoPlus, b: GameInfoPlus): number {
        const aValue = "weight" in a ? a.weight : undefined;
        const bValue = "weight" in b ? b.weight : undefined;
        return (bValue || 0) - (aValue || 0);
    }
}



