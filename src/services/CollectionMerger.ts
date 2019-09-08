import { GameInfo } from "../models/GameInfo";

interface CollectionMap {
    [username: string]: GameInfo[];
}


export class CollectionMerger {

    getMergedCollection(collectionsMap: CollectionMap): GameInfo[] {
        let curGames: GameInfo[] = [];
        Object.keys(collectionsMap).forEach((name) => {
            const thisUsersGames = collectionsMap[name];
            const thisUsersGamesIds = thisUsersGames.map((game) => game.id);
            const gamesToAdd = thisUsersGames.filter((game) => curGames.every((curGame) => curGame.id !== game.id));
            curGames = [...curGames, ...gamesToAdd].map((game) => {
                if (thisUsersGamesIds.indexOf(game.id) > -1) {
                    return Object.assign({}, game, {
                        owners: game.owners ? [...game.owners, name] : [name]
                    });
                };
                return game;
            })

        });
        return curGames;
    }
}
