import { GameInfo } from "../models/GameInfo";
import { FilterOptions } from "../models/FilterOptions";



export class GamesFilterer {



    filter(outerCollection: GameInfo[], options?: FilterOptions): GameInfo[] {
        let collection = [...outerCollection];
        if (!options) {
            collection.sort(this.nameSorter);
        } else {
            const { playtime, playerCount, sortOption } = options;
            if (playtime) {
                collection = this.filterOnTime(collection, playtime);
            }
            if (playerCount) {
                collection = this.filterOnPlayerCount(collection, playerCount);
            }
            if (!sortOption) {
                collection.sort(this.nameSorter);
            }
            if (sortOption === "bggrating") {
                collection.sort(this.averageRatingSorter);
            }
            if (sortOption === "old") {
                collection.sort(this.oldYearSorter);
            }
            if (sortOption === "new") {
                collection.sort(this.newYearSorter);
            }
            if (sortOption === "userrating") {
                collection.sort(this.userRatingSorter);
            }

        }
        return collection;
    }




    private userRatingSorter(a: GameInfo, b: GameInfo): number {
        const aRating = a.userRating ? Object.keys(a.userRating).reduce((prev, name) => a.userRating[name] + prev, 0) / Object.keys(a.userRating).length : 0;
        const bRating = b.userRating ? Object.keys(b.userRating).reduce((prev, name) => (b.userRating[name]) + prev, 0) / Object.keys(b.userRating).length : 0;
        return (bRating || 0) - (aRating || 0);
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