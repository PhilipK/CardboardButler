import { GameInfo } from "../models/GameInfo";
import { FilterOptions } from "../models/FilterOptions";



export class GamesFilterer {

    private options: FilterOptions;

    constructor(_options: FilterOptions) {
        this.options = _options;
    }

    filter(outerCollection: GameInfo[]): GameInfo[] {
        let collection = [...outerCollection];
        const { playtime } = this.options;
        if (playtime) {
            collection = this.filterOnTime(collection, playtime);
        }
        return collection;
    }

    private filterOnTime(collection: GameInfo[], playtime: { minimum?: number; maximum?: number; }) {
        const { minimum = 0, maximum = 99999999 } = playtime;
        collection = collection.filter((game) =>
            (game.minPlaytime === playtime.minimum || minimum <= game.minPlaytime)
            &&
            (game.maxPlaytime === playtime.maximum || game.maxPlaytime <= maximum));
        return collection;
    }
}