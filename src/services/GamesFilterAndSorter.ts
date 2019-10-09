import { GameInfoPlus } from "../models/GameInfo";
import { FilterAndSortOptions } from "../models/FilterOptions";
import { GameSorter } from "./GameSorter";
import { GameFilterer } from "./GameFilterer";
const memoize = require("fast-memoize");




/**
 * Filters and sorts a given collection and some options on how to do it.
 */
export class GamesFilterAndSorter {
    sorter: GameSorter;
    filterer: GameFilterer;

    constructor(sorter: GameSorter = new GameSorter(), filterer: GameFilterer = new GameFilterer()) {
        this.sorter = sorter;
        this.filterer = filterer;
        this.filterAndSortInner = this.filterAndSortInner.bind(this);
        this.filterAndSort = memoize(this.filterAndSortInner);
    }

    /**
     * Filters and sorts a given collection, returns a new collection.
     * @param collection a collection of games to filter and sort
     * @param options optional options, that defines how the collection should be filtered and sorted.
     */

    filterAndSort: (collection: GameInfoPlus[], options: FilterAndSortOptions) => GameInfoPlus[];

    filterAndSortInner(collection: GameInfoPlus[], options: FilterAndSortOptions = {}): GameInfoPlus[] {
        const collectionCopy = [...collection];
        const filtered = this.filterer.filterCollection(collectionCopy, options);
        return this.sorter.sortCollection(filtered, options.sortOption);
    }


}