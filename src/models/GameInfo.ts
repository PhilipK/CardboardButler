interface BoardGameFamily {
    name: string;
    friendlyName: string;
    value: number;
    bayesaverage: number;
}




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
}
