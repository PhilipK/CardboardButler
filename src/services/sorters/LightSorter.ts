import { Sorter } from "./Sorter";
import { GameInfoPlus } from "../../models/GameInfo";

export class LightSorter implements Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.weightLightSort)];
    }
    private weightLightSort(a: GameInfoPlus, b: GameInfoPlus): number {
        const aValue = "weight" in a ? a.weight : undefined;
        const bValue = "weight" in b ? b.weight : undefined;
        return (aValue || 99) - (bValue || 99);
    }

}



