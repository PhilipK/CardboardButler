import { GameInfo, GameInfoPlus } from "../models/GameInfo";
import { FilterAndSortOptions, SimpleSortOption, SortOption } from "../models/FilterOptions";

type SorterMap = {
    [option in SimpleSortOption]: (a: GameInfo, b: GameInfo) => number | undefined;
};

interface IndexMap {
    [gameid: number]: number[];

}

/**
 * Filters and sorts a given collection and some options on how to do it.
 */
export class GamesFilterAndSorter {

    private sortMap: SorterMap;

    constructor() {
        this.userRatingSorter = this.userRatingSorter.bind(this);
        this.getAverageUserRating = this.getAverageUserRating.bind(this);
        this.getSuggestePlayerScore = this.getSuggestePlayerScore.bind(this);
        this.getSuggestedComparatorComparator = this.getSuggestedComparatorComparator.bind(this);
        this.sortMap = {
            alphabetic: this.nameSorter,
            bggrating: this.averageRatingSorter,
            new: this.newYearSorter,
            old: this.oldYearSorter,
            userrating: this.userRatingSorter,
            "weight-heavy": this.weightHeavySort,
            "weight-light": this.weightLightSort
        };
    }


    /**
     * Filters and sorts a given collection, returns a new collection.
     * @param collection a collection of games to filter and sort
     * @param options optional options, that defines how the collection should be filtered and sorted.
     */
    filter(collection: GameInfoPlus[], options: FilterAndSortOptions = {}): GameInfoPlus[] {
        const collectionCopy = [...collection];
        const filtered = this.filterCollection(collectionCopy, options);
        const filteredAndSorted = this.sortCollection(filtered, options.sortOption);
        return filteredAndSorted;
    }




    private sortCollection(collection: GameInfoPlus[], sortOption: (SortOption | SortOption[]) = "bggrating"): GameInfoPlus[] {
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
                return mutableCollection.sort(this.sortMap[sortOption]);
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




    private filterCollection(collection: GameInfo[], options: FilterAndSortOptions) {
        const { playtime, playerCount } = options;
        if (playtime) {
            collection = this.filterOnTime(collection, playtime);
        }
        if (playerCount) {
            collection = this.filterOnPlayerCount(collection, playerCount);
        }
        return collection;
    }

    private weightHeavySort(a: GameInfoPlus, b: GameInfoPlus): number {
        const aValue = "weight" in a ? a.weight : undefined;
        const bValue = "weight" in b ? b.weight : undefined;
        return (bValue || 0) - (aValue || 0);
    }

    private weightLightSort(a: GameInfoPlus, b: GameInfoPlus): number {
        const aValue = "weight" in a ? a.weight : undefined;
        const bValue = "weight" in b ? b.weight : undefined;
        return (aValue || 99) - (bValue || 99);
    }

    private userRatingSorter(a: GameInfo, b: GameInfo): number {
        const aRating = this.getAverageUserRating(a);
        const bRating = this.getAverageUserRating(b);
        return (bRating || 0) - (aRating || 0);
    }

    private getAverageUserRating(a: GameInfo) {
        const scoreMap = a.userRating;
        if (!scoreMap) {
            return undefined;
        } else {
            const userNames = Object.keys(scoreMap);
            const userNamesWithRatings = userNames.filter((name) => scoreMap[name]);
            if (userNamesWithRatings.length === 0) {
                return undefined;
            }
            const sum = userNamesWithRatings.reduce((p, c) => p + scoreMap[c], 0);
            return sum / userNamesWithRatings.length;
        }
    }



    private oldYearSorter(a: GameInfo, b: GameInfo): number {
        return (a.yearPublished || Infinity) - (b.yearPublished || Infinity);
    }

    private newYearSorter(a: GameInfo, b: GameInfo): number {
        return (b.yearPublished || -100000) - (a.yearPublished || -10000);
    }

    private averageRatingSorter(a: GameInfo, b: GameInfo): number {
        return b.averagerating - a.averagerating;
    }

    private nameSorter(a: GameInfo, b: GameInfo): number {
        return a.name.localeCompare(b.name);
    }

    private filterOnTime(collection: GameInfo[], playtime: { minimum?: number; maximum?: number; }) {
        const { minimum = 0, maximum = Infinity } = playtime;
        return collection.filter((game) =>
            minimum <= (game.minPlaytime || 0) && (game.maxPlaytime || Infinity) <= maximum
        );
    }

    private filterOnPlayerCount(collection: GameInfo[], playerCount: number) {
        return collection.filter((game) => game.minPlayers <= playerCount && playerCount <= game.maxPlayers);
    }
}