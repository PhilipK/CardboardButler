export interface PlayTimeOption {
    minimum?: number;
    maximum?: number;
}

export type PlayCountOption = number;


export interface FilterOptions {
    playtime?: PlayTimeOption;
    playerCount?: PlayCountOption;
}