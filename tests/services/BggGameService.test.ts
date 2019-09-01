import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
// import fetch from "node-fetch";
import { readFileSync } from "fs";

describe("BggGameService", () => {

    const fetch = fetchMock.sandbox();
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    afterEach(fetch.restore)

    describe("Initialization", () => {
        it('Can be constructoed with a fetch service', () => {
            new BggGameService(fetch);
        });
    });

    describe("Get Collection", () => {
        const service = new BggGameService(fetch);
        const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1`;
        it('Calls the bgg api throug a proxy', () => {
            const myMock = fetch.mock(expectedUrl, 200);
            service.getUserCollection("Warium");
            expect(myMock.lastUrl()).toEqual(expectedUrl);
        });

        it('Returns a list of games', async () => {
            const singleGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: singleGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games).toHaveLength(2);
        })

        // it('Games names are set', async () => {
        //     const singleGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
        //     fetch.mock(expectedUrl, 200, {
        //         response: {
        //             body: singleGameXml
        //         }
        //     });
        //     const games = await service.getUserCollection("Warium");
        //     expect(games[0].name).toEqual("Alchemists");
        //     expect(games[1].name).toEqual("Alchemists: The King's Golem");
        // })
    });

})

