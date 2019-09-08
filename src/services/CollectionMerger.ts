import { GameInfo } from "../models/GameInfo";

interface CollectionMap {
    [username: string]: GameInfo[];
}


export class CollectionMerger {

    getMergedCollection(collectionsMap: CollectionMap): GameInfo[] {
        return Object.keys(collectionsMap).reduce((curGames, name) => {
            const thisUsersGames = collectionsMap[name];
            const gamesToAdd = thisUsersGames.filter((game) => curGames.every((curGame) => curGame.id !== game.id));
            return [...curGames, ...gamesToAdd].map((game) => {
                if (thisUsersGames.some((useGame) => game.id === useGame.id)) {
                    return Object.assign({}, game, {
                        owners: game.owners ? [...game.owners, name] : [name]
                    });
                };
                return game;
            })
        }, []);
    }
}
