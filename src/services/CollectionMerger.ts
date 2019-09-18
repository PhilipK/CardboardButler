import { GameInfo } from "../models/GameInfo";

export interface CollectionMap {
    [username: string]: GameInfo[];
}

interface GameIdCache {
    [id: number]: GameInfo | undefined;
}

export class CollectionMerger {



    getMergedCollection(collectionsMap: CollectionMap): GameInfo[] {
        const cache: GameIdCache = {};
        const userNames = Object.keys(collectionsMap);
        userNames.forEach((username) => {
            const currentCollection = collectionsMap[username];
            currentCollection.forEach((currentGame) => {
                const alreadyKnownGame = cache[currentGame.id];
                if (alreadyKnownGame) {
                    alreadyKnownGame.owners.push(username);
                    alreadyKnownGame.userRating = Object.assign({}, alreadyKnownGame.userRating, currentGame.userRating);
                } else {
                    cache[currentGame.id] = Object.assign({}, currentGame, { owners: [username] });
                }
            });
        });

        return Object.values(cache);
    }
}
