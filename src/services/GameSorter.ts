import { GameInfoPlus } from "../models/GameInfo";
import { SortOption } from "../models/FilterOptions";
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
import { RecentlyPlayedSorter } from "./sorters/RecentlyPlayedSorter";
import { PlayedLongAgoSorter } from "./sorters/PlayedLongAgoSorter";
import { PlayedALotSorter } from "./sorters/PlayedALotSorter";
import { PlayedNotALotSorter } from "./sorters/PlayedNotALotSorter";
const memoize = require("fast-memoize");

const sortMap = {
    alphabetic: new NameSorter(),
    bggrating: new BggRatingSorter(),
    new: new YoungSorter(),
    old: new OldSorter(),
    userrating: new UserRatingSorter(),
    "weight-heavy": new HeavySorter(),
    "weight-light": new LightSorter(),
    "playedRecently": new RecentlyPlayedSorter(),
    "playedLongAgo": new PlayedLongAgoSorter(),
    "playedALot": new PlayedALotSorter(),
    "playedNotALot": new PlayedNotALotSorter()
};

const DEFAULT_OPTION = "bggrating";

function getSorterInner(sortOption: (SortOption | SortOption[]) = DEFAULT_OPTION): Sorter {
    if (Array.isArray(sortOption)) {
        const innerSorters = sortOption.map(getSorterInner);
        return new MultiSorter(innerSorters);
    }
    if (typeof sortOption === "object") {
        return new SuggestedPlayersSorter(sortOption.numberOfPlayers);
    }
    return sortMap[sortOption];
}

const getSorter = memoize(getSorterInner);


export class GameSorter {

    constructor() {
        this.sortCollection = memoize(this.sortCollectionInner);

    }

    public sortCollection: (collection: GameInfoPlus[], sortOption: (SortOption | SortOption[])) => GameInfoPlus[];

    private sortCollectionInner(collection: GameInfoPlus[], sortOption: (SortOption | SortOption[])): GameInfoPlus[] {
        const sorter = getSorter(sortOption);
        return sorter.sort([...collection]);
    }

}
