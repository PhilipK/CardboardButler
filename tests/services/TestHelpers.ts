import { GameInfo } from "../../src/models/GameInfo";
import fetchMock = require("fetch-mock");
import BggGameService from "../../src/services/BggGameService";
import { readFileSync } from "fs";

const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1&excludesubtype=boardgameexpansion`;

let largeCollectionCache: GameInfo[] = undefined;
export async function getLargeCollection() {
    const fetch = fetchMock.sandbox();
    if (largeCollectionCache === undefined) {
        const service = new BggGameService(fetch);
        const largeCollection = readFileSync("tests/services/testxml/TheJadeKnightCollection.xml", "utf8");
        fetch.mock(expectedUrl, 200, {
            response: {
                body: largeCollection
            },
            overwriteRoutes: true

        });
        largeCollectionCache = await service.getUserCollection("Warium") as GameInfo[];
    }
    return largeCollectionCache as GameInfo[];
}

let hugeCollection: GameInfo[] = undefined;
export async function getHugeCollection() {
    const fetch = fetchMock.sandbox();
    if (hugeCollection === undefined) {
        const service = new BggGameService(fetch);
        const largeCollection = readFileSync("tests/services/testxml/TomVasel.xml", "utf8");
        fetch.mock(expectedUrl, 200, {
            response: {
                body: largeCollection
            },
            overwriteRoutes: true
        });
        hugeCollection = await service.getUserCollection("Warium") as GameInfo[];
    }
    return hugeCollection as GameInfo[];
}

