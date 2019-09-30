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

type SorterMap = {
    [option in SimpleSortOption]: Sorter;
};


interface IndexMap {
    [gameid: number]: number[];

}

export class GameSorter {


    private sortMap: SorterMap;

    constructor() {
        this.getSuggestePlayerScore = this.getSuggestePlayerScore.bind(this);
        this.getSuggestedComparatorComparator = this.getSuggestedComparatorComparator.bind(this);
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
        if (Array.isArray(sortOption)) {
            const sortOptions = sortOption;
            const sortedCollections = sortOptions.map((option) => this.sortCollection(collection, option));
            const indexMaps = sortedCollections.map((collection) => collection.reduce((prev, cur, index) => {
                prev[cur.id] = [index];
                return prev;
            }, {} as IndexMap));
            const multiScoreMap = indexMaps.reduce((prev, cur) => {
                Object.keys(cur).forEach((gameId) => {
                    prev[gameId] = (prev[gameId] || []).concat(cur[gameId]);
                });
                return prev;
            }, {} as IndexMap);
            return mutableCollection.sort(this.createCompareWithMap(multiScoreMap));
        } else {
            if (typeof sortOption === "object") {
                const { numberOfPlayers } = sortOption;
                if (numberOfPlayers) {
                    return mutableCollection.sort(this.getSuggestedComparatorComparator(numberOfPlayers));
                } else {
                    return mutableCollection;
                }
            } else {
                return this.sortMap[sortOption].sort(mutableCollection);
            }
        }
    }


    private createCompareWithMap(indexMap: IndexMap) {
        return (a: GameInfo, b: GameInfo) => {
            const aScore = indexMap[a.id].reduce((p, c) => p + c, 0);
            const bScore = indexMap[b.id].reduce((p, c) => p + c, 0);
            const score = aScore - bScore;
            return score === 0 ? indexMap[a.id][0] - indexMap[b.id][0] : score;
        };
    }

    private getSuggestedComparatorComparator(playerCount: number) {
        return (a: GameInfoPlus, b: GameInfoPlus) => {
            return this.getSuggestePlayerScore(playerCount, b) - this.getSuggestePlayerScore(playerCount, a);
        };
    }

    private getSuggestePlayerScore(playerCount: number, gameInfo: GameInfoPlus): number {
        if ("suggestedNumberOfPlayers" in gameInfo) {
            const votes = gameInfo.suggestedNumberOfPlayers[playerCount] || gameInfo.suggestedNumberOfPlayers[Infinity];
            if (votes !== undefined) {
                const total = votes.best + votes.recommended + votes.notRecommended;
                const score = (votes.best / total * 3) + (votes.recommended / total) - (votes.notRecommended / total * 2);
                return score;
            }
        }
        return -Infinity;


    }


}
