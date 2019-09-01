interface GameService {
    getUserCollection(username: string): GameInfo[];
}



export default GameService;