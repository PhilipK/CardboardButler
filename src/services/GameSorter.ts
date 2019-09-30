import { GameInfoPlus, GameInfo } from "../models/GameInfo";
import { SortOption, SimpleSortOption } from "../models/FilterOptions";
import { UserRatingSorter } from "./sorters/UserRatingSorter";
import { Sorter } from "./sorters/Sorter";
import { YoungSorter } from "./sorters/YoungSorter";
import { OldSorter } from "./sorters/OldSorter";
import { HeavySorter } from "./sorters/HeavySorter";
import { LightSorter } from "./sorters/LightSorter";
import { BggRatingSorter } from "./sorters/BggRatingSorter";
import { NameSorter } from "./sorters/NameSorter";
import { SuggestedPlayersSorter } from "./sorters/SuggestedPlayersSorter";
import { MultiSorter } from "./sorters/MultiSorter";

type SorterMap = {
    [option in SimpleSortOption]: Sorter;
};

export class GameSorter {


    private sortMap: SorterMap;

    constructor() {
        this.getSorter = this.getSorter.bind(this);
        this.sortMap = {
            alphabetic: new NameSorter(),
            bggrating: new BggRatingSorter(),
            new: new YoungSorter(),
            old: new OldSorter(),
            userrating: new UserRatingSorter(),
            "weight-heavy": new HeavySorter(),
            "weight-light": new LightSorter()
        };
    }

    public sortCollection(collection: GameInfoPlus[], sortOption: (SortOption | SortOption[]) = "bggrating"): GameInfoPlus[] {
        const mutableCollection = [...collection];
        const sorter = this.getSorter(sortOption);
        return sorter.sort(mutableCollection);
    }

    private getSorter(sortOption: (SortOption | SortOption[])): Sorter {
        if (Array.isArray(sortOption)) {
            const innerSorters = sortOption.map(this.getSorter);
            return new MultiSorter(innerSorters);
        }
        if (typeof sortOption === "object") {
            return new SuggestedPlayersSorter(sortOption.numberOfPlayers);
        }
        return this.sortMap[sortOption];
    }

}
