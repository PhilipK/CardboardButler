import { GameInfo } from "../models/GameInfo";

export type BggRetryResult = { retryLater: boolean };

export type CollectionResult = BggRetryResult |GameInfo[] 


interface GameService {
    getUserCollection(username: string): Promise<BggRetryResult |GameInfo[] >;
}



export default GameService;