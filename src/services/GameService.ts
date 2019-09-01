import { GameInfo } from "../models/GameInfo";

export type BggRetryResult = { retryLater: true };



interface GameService {
    getUserCollection(username: string): Promise<GameInfo[] | BggRetryResult>;
}



export default GameService;