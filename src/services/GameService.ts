export type BggRetryResult = { retryLater: true };

interface GameService {
    getUserCollection(username: string): GameInfo[] | BggRetryResult;
}



export default GameService;