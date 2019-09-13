import { GameInfo } from "../models/GameInfo";
import { FilterOptions } from "../models/FilterOptions";



export class GamesFilterer {



    filter(outerCollection: GameInfo[], options?: FilterOptions): GameInfo[] {
        let collection = [...outerCollection];
        if (!options) {
            collection.sort(this.nameSorter);
        } else {
            const { playtime, playerCount } = options;
            if (playtime) {
                collection = this.filterOnTime(collection, playtime);
            }
            if (playerCount) {
                collection = this.filterOnPlayerCount(collection, playerCount);
            }
            if (options.sortOption) {
                collection.sort(this.averageRatingSorter);
            }
        }
        return collection;
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