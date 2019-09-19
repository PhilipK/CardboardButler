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
    weight?: number;
    families: BoardGameFamily[];
    owners?: string[];
    userRating?: { [username: string]: number | undefined };
}


export interface ExtendedGameInfo {
    description?: string;
    averageweight?: number;
}