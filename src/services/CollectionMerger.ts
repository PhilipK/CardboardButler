import { GameInfo } from "../models/GameInfo";

interface CollectionMap {
    [username: string]: GameInfo[];
}


export class CollectionMerger {

    getMergedCollection(collectionsMap: CollectionMap): GameInfo[] {
        return Object.keys(collectionsMap).reduce((curGames, name) => {
            const usersGames = collectionsMap[name];
            const gameUnkown = (game: GameInfo) => curGames.every((curGame) => curGame.id !== game.id);
            const gamesToAdd = usersGames.filter(gameUnkown);
            return [...curGames, ...gamesToAdd].map((game) => {
                const thisUsersGame = usersGames.find((useGame) => game.id === useGame.id);
                if (thisUsersGame) {
                    return Object.assign({}, game, {
                        owners: game.owners ? [...game.owners, name] : [name],
                        userRating: Object.assign({}, game.userRating, thisUsersGame.userRating)
                    });
                }
                return game;
            });
        }, []);
    }
}
