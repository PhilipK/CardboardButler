import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { readFileSync } from "fs";

describe("BggGameService", () => {

    const fetch = fetchMock.sandbox();
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    afterEach(fetch.restore)

    const service = new BggGameService(fetch);


    describe("Initialization", () => {
        it('Can be constructoed with a fetch service', () => {
            new BggGameService(fetch);
        });
    });

    describe("Get Collection", () => {
        const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1`;

        it('Calls the bgg api throug a proxy', async () => {
            const myMock = fetch.mock(expectedUrl, 200);
            const games = await service.getUserCollection("Warium")
            expect(myMock.lastUrl()).toEqual(expectedUrl);
        });

        it('Returns a list of games', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games).toHaveLength(2);
        })

        it('Games names are set', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].name).toEqual("Alchemists");
            expect(games[1].name).toEqual("Alchemists: The King's Golem");
        })

        it('Games thumbnails are set', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].thumbnailUrl).toEqual("https://cf.geekdo-images.com/thumb/img/4VjOkEjTXNR4KQMjaOK7JibjPSw=/fit-in/200x150/pic2241156.png");
            expect(games[1].thumbnailUrl).toEqual("https://cf.geekdo-images.com/thumb/img/8JvyNMgJl6R1Vf01ybWAd0XVQ5U=/fit-in/200x150/pic3195558.jpg");
        })

        it('Games yearpublished is set', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].yearPublished).toEqual(2014);
            expect(games[1].yearPublished).toEqual(2016);
        })

        it('Games image is set', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].imageUrl).toEqual("https://cf.geekdo-images.com/original/img/VKBFHqR2xm0EFGWfb1sPJZctMCs=/0x0/pic2241156.png");
            expect(games[1].imageUrl).toEqual("https://cf.geekdo-images.com/original/img/8KjTjLyMfdjh-ftl3p2E_MYEBYY=/0x0/pic3195558.jpg");
        })

        it('Has min and max players numbers', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].minPlayers).toEqual(2);
            expect(games[0].maxPlayers).toEqual(4);
            expect(games[1].minPlayers).toEqual(2);
            expect(games[1].maxPlayers).toEqual(4);
        })

        it('Has min and max playtime', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].minPlaytime).toEqual(120);
            expect(games[0].maxPlaytime).toEqual(120);
            expect(games[1].minPlaytime).toEqual(120);
            expect(games[1].maxPlaytime).toBeUndefined();
        })
        
        it('Has a bgg id', async () => {
            const twoGameXml = readFileSync('tests/services/testxml/TwoGamesCollection.xml', 'utf8');
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: twoGameXml
                }
            });
            const games = await service.getUserCollection("Warium");
            expect(games[0].id).toBe(161970);
            expect(games[1].id).toBe(204650);
        })
    });

    describe("Handling errors", () => {
        const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1`;
        const tryAgainMessage = `<message>
        Your request for this collection has been accepted and will be processed. Please try again later for access.
        </message>`;

        it("Returns try again when 202 is given", async () => {
            fetch.mock(expectedUrl, 202, {
                response: {
                    status: 202,
                    body: tryAgainMessage
                }
            });
            const response = await service.getUserCollection("Warium");
            expect(response).toBeInstanceOf(Object);
            if (!Array.isArray(response)) {
                expect(response.retryLater).toBeTruthy();
                expect(response.error).toBeUndefined();

            }
        });


        it("Returns try again when an error is given, but informs there was an error", async () => {
            const error = new TypeError("Error!!!");
            fetch.mock(expectedUrl, 503, {
                response: {
                    throws: error
                }
            });
            const response = await service.getUserCollection("Warium").catch((error) => { throw error; });;
            expect(response).toBeInstanceOf(Object);
            if (!Array.isArray(response)) {
                expect(response.retryLater).toBeTruthy();
                expect(response.error).toEqual(error);
            }
        });
    });

})

