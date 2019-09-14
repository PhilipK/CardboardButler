import { GameInfo } from "../models/GameInfo";

interface CollectionMap {
    [username: string]: GameInfo[];
}


export class CollectionMerger {

    getMergedCollection(collectionsMap: CollectionMap): GameInfo[] {
        const fullCollection: GameInfo[] = [];
        const userNames = Object.keys(collectionsMap);
        userNames.forEach((username) => {
            const currentCollection = collectionsMap[username];
            currentCollection.forEach((currentGame) => {
                const alreadyKnownGame = fullCollection.find((alreadyKnownGame) => alreadyKnownGame.id === currentGame.id);
                if (alreadyKnownGame) {
                    alreadyKnownGame.owners.push(username);
                    alreadyKnownGame.userRating = Object.assign({}, alreadyKnownGame.userRating, currentGame.userRating);
                } else {
                    fullCollection.push(Object.assign({}, currentGame, { owners: [username] }));
                }
            });
        });

        return fullCollection;
    }
}
