export interface PlayTimeOption {
    minimum?: number;
    maximum?: number;
}

export type PlayCountOption = number;

export type SortOption = "alphabetic" | "bggrating" | "new" | "old" | "userrating";

export interface FilterOptions {
    playtime?: PlayTimeOption;
    playerCount?: PlayCountOption;
    sortOption?: SortOption;
}