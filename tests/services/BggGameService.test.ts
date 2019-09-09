import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { readFileSync } from "fs";

describe("BggGameService", () => {

    const fetch = fetchMock.sandbox();
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    afterEach(fetch.restore);

    const service = new BggGameService(fetch);


    describe("Initialization", () => {
        it("Can be constructoed with a fetch service", () => {
            new BggGameService(fetch);
        });
    });

    describe("Get Collection", () => {
        const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1`;

        it("Calls the bgg api throug a proxy", async () => {
            const myMock = fetch.mock(expectedUrl, 200);
            const games = await service.getUserCollection("Warium");
            expect(myMock.lastUrl()).toEqual(expectedUrl);
        });

        it("Handles large collections", async () => {
            const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=TheJadeKnightCollection&own=1&stats=1`;
            const largeCollection = readFileSync("tests/services/testxml/TheJadeKnightCollection.xml", "utf8");
            fetch.mock(expectedUrl, 200, {
                response: {
                    body: largeCollection
                }
            });
            const games = await service.getUserCollection("TheJadeKnightCollection");
            expect(games).toHaveLength(70);
        });

        describe("attributes", () => {
            const twoGameXml = readFileSync("tests/services/testxml/TwoGamesCollection.xml", "utf8");

            beforeEach(() => {
                fetch.mock(expectedUrl, 200, {
                    response: {
                        body: twoGameXml
                    }
                });
            });

            it("Returns a list of games", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games).toHaveLength(2);
            });

            it("Games names are set", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].name).toEqual("Alchemists");
                expect(games[1].name).toEqual("Alchemists: The King's Golem");
            });

            it("Games thumbnails are set", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].thumbnailUrl).toEqual("https://cf.geekdo-images.com/thumb/img/4VjOkEjTXNR4KQMjaOK7JibjPSw=/fit-in/200x150/pic2241156.png");
                expect(games[1].thumbnailUrl).toEqual("https://cf.geekdo-images.com/thumb/img/8JvyNMgJl6R1Vf01ybWAd0XVQ5U=/fit-in/200x150/pic3195558.jpg");
            });

            it("Games yearpublished is set", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].yearPublished).toEqual(2014);
                expect(games[1].yearPublished).toEqual(2016);
            });

            it("Games image is set", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].imageUrl).toEqual("https://cf.geekdo-images.com/original/img/VKBFHqR2xm0EFGWfb1sPJZctMCs=/0x0/pic2241156.png");
                expect(games[1].imageUrl).toEqual("https://cf.geekdo-images.com/original/img/8KjTjLyMfdjh-ftl3p2E_MYEBYY=/0x0/pic3195558.jpg");
            });

            it("Has min and max players numbers", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].minPlayers).toEqual(2);
                expect(games[0].maxPlayers).toEqual(4);
                expect(games[1].minPlayers).toEqual(2);
                expect(games[1].maxPlayers).toEqual(4);
            });

            it("Has min and max playtime", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].minPlaytime).toEqual(120);
                expect(games[0].maxPlaytime).toEqual(120);
                expect(games[1].minPlaytime).toEqual(120);
                expect(games[1].maxPlaytime).toBeUndefined();
            });

            it("Has a bgg id", async () => {
                const games = await service.getUserCollection("Warium");
                expect(games[0].id).toBe(161970);
                expect(games[1].id).toBe(204650);
            });

            it("Has an average rating", async () => {
                const games = await service.getUserCollection("Warium");
                expect(Array.isArray(games)).toBe(true);
                if (Array.isArray(games)) {
                    expect(games[0].averagerating).toBe(7.69466);
                    expect(games[1].averagerating).toBe(8.45367);
                }
            });


            it("Has family information", async () => {
                const games = await service.getUserCollection("Warium");
                expect(Array.isArray(games)).toBe(true);
                if (Array.isArray(games)) {
                    expect(games[0].families).toContainEqual({
                        name: "strategygames", friendlyName: "Strategy Game Rank", bayesaverage: 7.50035, value: 76, type: "family"
                    });
                    expect(games[1].families.length).toBe(0);
                }
            });

        });


    });

    describe("Get Userinfo", () => {
        const validUserUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/user?name=Warium`;
        const invalidUserUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/user?name=asdfasdfasdfasdfasdfasdf`;
        const validUserXml = readFileSync("tests/services/testxml/WariumUserResult.xml", "utf8");
        const inValidUserXml = readFileSync("tests/services/testxml/InvalidUserResult.xml", "utf8");
        it("Calls the bgg api throug a proxy", async () => {
            const myMock = fetch.mock(validUserUrl, 200);
            await service.getUserInfo("Warium");
            expect(myMock.lastUrl()).toEqual(validUserUrl);
        });

        it("valid users give valid results", async () => {
            fetch.mock(validUserUrl, 202, {
                response: {
                    status: 202,
                    body: validUserXml
                }
            });
            const userinfo = await service.getUserInfo("Warium");
            expect(userinfo.isValid).toBe(true);
        });

        it("invalid users give invalid results", async () => {
            fetch.mock(invalidUserUrl, 202, {
                response: {
                    status: 202,
                    body: inValidUserXml
                }
            });
            const userinfo = await service.getUserInfo("asdfasdfasdfasdfasdfasdf");
            expect(userinfo.isValid).toBe(false);
        });

        it("valid users gives error if bgg fails", async () => {
            const expectedError = new TypeError("Error");
            fetch.mock(validUserUrl, 503, {
                response: {
                    status: 503,
                    body: "Error",
                    throws: expectedError
                }
            });
            const result = await service.getUserInfo("Warium");
            expect(result.isValid).toBe("unknown");
            if (result.isValid === "unknown") {
                expect(result.error).toBe(expectedError);
            }
        });


        describe("attributes", () => {
            it("name", async () => {
                fetch.mock(validUserUrl, 202, {
                    response: {
                        status: 202,
                        body: validUserXml
                    }
                });
                const userinfo = await service.getUserInfo("Warium");
                expect(userinfo.isValid).toBe(true);
                if (userinfo.isValid === true) {
                    expect(userinfo.username).toBe("Warium");
                }
            });
        });
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
            const response = await service.getUserCollection("Warium").catch((error) => { throw error; });
            expect(response).toBeInstanceOf(Object);
            if (!Array.isArray(response)) {
                expect(response.retryLater).toBeTruthy();
                expect(response.error).toEqual(error);
            }
        });
    });

});

