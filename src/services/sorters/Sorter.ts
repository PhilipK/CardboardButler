import { GameInfoPlus } from "../../models/GameInfo";

/**
 * A soter takes a collection and returns that collection sorted.
 */
export interface Sorter {
    sort(collection: GameInfoPlus[]): GameInfoPlus[];
}