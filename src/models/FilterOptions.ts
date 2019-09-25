/**
 * Defines a maximum and minimum time (in minutes), that a game must be playable in.
 */
export interface PlayTimeOption {
    minimum?: number;
    maximum?: number;
}

/**
 * A number of players this game must be playable with.
 */
export type PlayCountOption = number;


/**
 * Defines how to sort the collection.
 */
export type SortOption = SimpleSortOption | ParametricSortOption;

export type SimpleSortOption = "alphabetic" | "bggrating" | "new" | "old" | "userrating" | "weight-light" | "weight-heavy";

export type ParametricSortOption = {
    type: "suggestedPlayers",
    numberOfPlayers?: number
};


/**
 * Defines how to filter and sort a collection.
 */
export interface FilterAndSortOptions {
    playtime?: PlayTimeOption;
    playerCount?: PlayCountOption;
    sortOption?: SortOption;
}