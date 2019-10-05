import { number } from "prop-types";

/**
 * A bgg Family defines a group of games a game relates to, examples are War Games or Thematic Games.
 */
interface BoardGameFamily {
    name: string;
    friendlyName: string;
    value: number;
    bayesaverage: number;
}



/**
 * Information about a BGG Game.
 */
export interface GameInfo {
    id: number;
    name: string;
    thumbnailUrl: string;
    imageUrl: string;
    yearPublished?: number;
    minPlayers?: number;
    maxPlayers?: number;
    minPlaytime?: number;
    maxPlaytime?: number;
    playingTime?: number;
    averagerating: number;
    families: BoardGameFamily[];
    owners?: string[];
    userRating?: { [username: string]: number | undefined };
}


export interface NumberOfPlayersVotes {
    numberOfPlayers: number;
    best: number;
    recommended: number;
    notRecommended: number;
}

export interface SuggestedNumberOfPlayersMap {
    [numberOfPlayers: number]: NumberOfPlayersVotes | undefined;
}


export interface ExtendedGameInfo {
    description?: string;
    weight?: number;
    mechanics?: string[];
    categories?: string[];
    suggestedNumberOfPlayers: SuggestedNumberOfPlayersMap;
}


export interface GamePlayInfo {
    plays?: PlayInfo[] | undefined;
    lastPlayed?: Date;
    timePlayedMinutes: number;
}

export interface PlayInfo {
    playId: number;
    date: Date;
    quantity: number;
    length?: number;
    gameId: number;
    playedBy?: string;
}

export type FullGameInfo = GameInfo & ExtendedGameInfo & GamePlayInfo;

export type GameInfoPlus = GameInfo | FullGameInfo;
