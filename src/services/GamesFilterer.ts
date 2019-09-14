import { GameInfo } from "../models/GameInfo";
import { FilterOptions, SortOption } from "../models/FilterOptions";

type SorterMap = {
    [option in SortOption]: (a: GameInfo, b: GameInfo) => number | undefined;
};


export class GamesFilterer {

    private sortMap: SorterMap;

    constructor() {
        this.userRatingSorter = this.userRatingSorter.bind(this);
        this.getAverageUserRating = this.getAverageUserRating.bind(this);
        this.sortMap = {
            alphabetic: this.nameSorter,
            bggrating: this.averageRatingSorter,
            new: this.newYearSorter,
            old: this.oldYearSorter,
            userrating: this.userRatingSorter
        };
    }


    filter(outerCollection: GameInfo[], options: FilterOptions = {}): GameInfo[] {
        let collection = [...outerCollection];
        if (!options) {
            collection.sort(this.nameSorter);
        } else {
            collection = this.filterCollection(options, collection);
            this.sortCollection(options, collection);

        }
        return collection;
    }


    private sortCollection(options: FilterOptions, collection: GameInfo[]) {
        const { sortOption = "alphabetic" } = options;
        collection.sort(this.sortMap[sortOption]);
    }

    private filterCollection(options: FilterOptions, collection: GameInfo[]) {
        const { playtime, playerCount } = options;
        if (playtime) {
            collection = this.filterOnTime(collection, playtime);
        }
        if (playerCount) {
            collection = this.filterOnPlayerCount(collection, playerCount);
        }
        return collection;
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