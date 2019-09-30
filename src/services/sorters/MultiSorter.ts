import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

interface IndexMap {
    [gameid: number]: number[];

}

export class MultiSorter implements Sorter {

    innerSorters: Sorter[];

    constructor(innerSorters: Sorter[]) {
        this.innerSorters = innerSorters;
    }

    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        const mutableCollection = [...collection];
        const sortedCollections = this.innerSorters.map((sorter) => sorter.sort(mutableCollection));
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
        const combinedComparator = this.createCompareWithMap(multiScoreMap);
        return mutableCollection.sort(combinedComparator);
    }

    private createCompareWithMap(indexMap: IndexMap) {
        return (a: GameInfo, b: GameInfo) => {
            const aScore = indexMap[a.id].reduce((p, c) => p + c, 0);
            const bScore = indexMap[b.id].reduce((p, c) => p + c, 0);
            const score = aScore - bScore;
            return score === 0 ? indexMap[a.id][0] - indexMap[b.id][0] : score;
        };
    }

}






