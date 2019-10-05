
import BggGameLoader, { LoadingInfo } from "../../src/services/BggGameLoader";
import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { GameInfo, ExtendedGameInfo, PlayInfo } from "../../src/models/GameInfo";
import { alchemists, sevenWonders, smallWorld } from "./model/TestGames";
import { CollectionMerger } from "../../src/services/CollectionMerger";
import { getLargeCollection } from "./TestHelpers";

describe("Loading games", () => {

    const fetch = fetchMock.sandbox();
    afterEach(fetch.restore);

    const service = new BggGameService(fetch);
    const merger = new CollectionMerger();
    let loader: BggGameLoader;

    beforeEach(() => {
        loader = new BggGameLoader(service, merger, false);
    });

    it("fetches collections when requested", () => {
        const collections = ["Warium", "Nakul"];

        const getMock = jest.fn((username) => (new Promise<GameInfo[]>((resolver) => resolver(
            getLargeCollection()
        ))));
        service.getUserCollection = getMock;
        loader.loadCollections(collections);
        expect(getMock.mock.calls).toHaveLength(2);
        expect(getMock.mock.calls[0][0]).toBe("Warium");
        expect(getMock.mock.calls[1][0]).toBe("Nakul");
    });

    it("can inform about game updates", async () => {
        const collections = ["Warium", "Nakul"];
        const getMock = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            await getLargeCollection()
        ))));
        const onUpdateMock = jest.fn();
        loader.onGamesUpdate(onUpdateMock);
        service.getUserCollection = getMock;
        // Act
        await loader.loadCollections(collections);
        // Expect
        expect(getMock.mock.calls).toHaveLength(2);
        // initiall calls with 1, empty
        expect(onUpdateMock).toHaveBeenCalledTimes(3);
    });

    it("can get the users currently shown", () => {
        const collections = ["Warium", "Nakul"];
        const getMock = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            await getLargeCollection()
        ))));
        service.getUserCollection = getMock;
        loader.loadCollections(collections);
        expect(loader.getCurrentNames()).toEqual(collections);

    });

    it("can show requests which are currently fetching", async () => {
        const collections = ["Warium"];
        let resolver: (value?: Promise<GameInfo[]>) => void;
        const getMock = jest.fn((username) => (new Promise<GameInfo[]>((r) => resolver = r)));
        service.getUserCollection = getMock;
        const promise = loader.loadCollections(collections);
        expect(getMock.mock.calls[0][0]).toBe("Warium");
        expect(loader.getLoadingInfo()).toEqual([
            { username: "Warium", type: "collection", isLoading: true }
        ]);
        const handler = jest.fn((games) => {
            expect(loader.getLoadingInfo()).toEqual([]);
        });
        loader.onGamesUpdate(handler);
        resolver(getLargeCollection());
        await promise;
        expect(handler.mock.calls).toHaveLength(1);
    });


    it("continuesly updates the collection list", async () => {
        const usernames = ["Warium", "Cyndaq", "Nakul"];
        const collections = {
            Warium: [alchemists()],
            Cyndaq: [sevenWonders()],
            Nakul: [alchemists(), smallWorld()]
        };

        service.getUserCollection = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            collections[username]
        ))));

        const onUpdateMock = jest.fn((games) => { });

        loader.onGamesUpdate(onUpdateMock);

        // act
        await loader.loadCollections(usernames);

        expect(onUpdateMock.mock.calls).toHaveLength(4);
        expect(onUpdateMock.mock.calls[0][0]).toHaveLength(0);
        expect(onUpdateMock.mock.calls[1][0]).toHaveLength(1);
        expect(onUpdateMock.mock.calls[2][0]).toHaveLength(2);
        expect(onUpdateMock.mock.calls[3][0]).toHaveLength(3);
    });

    it("informs about loading information", async () => {

        const usernames = ["Warium", "Cyndaq", "Nakul"];
        const collections = {
            Warium: [alchemists()],
            Cyndaq: [sevenWonders()],
            Nakul: [alchemists(), smallWorld()]
        };

        service.getUserCollection = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            collections[username]
        ))));

        const onLoadChange = jest.fn((games) => { });
        loader.onLoadUpdate(onLoadChange);

        const promise = loader.loadCollections(usernames);
        expect(onLoadChange.mock.calls).toHaveLength(3);
        expect(onLoadChange.mock.calls[2][0].map((i: LoadingInfo) => i.type)).toEqual(["collection", "collection", "collection"]);

        await promise;

        expect(onLoadChange.mock.calls[5][0]).toEqual([]);

    });


    it("loads extra game info after getting collection", async () => {
        const usernames = ["Warium", "Cyndaq"];
        const collections = {
            Warium: [alchemists()],
            Cyndaq: [sevenWonders()]
        };

        const alchemistExtended: ExtendedGameInfo = {
            description: "AlchemistExtended",
            suggestedNumberOfPlayers: {}
        };

        const sevenWondersExtended: ExtendedGameInfo = {
            description: "SevenExtended",
            suggestedNumberOfPlayers: {}
        };
        const extendedGameInfos = {
            [161970]: alchemistExtended,
            [68448]: sevenWondersExtended
        };

        const getUserCollectionMock = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            collections[username]
        ))));

        service.getUserCollection = getUserCollectionMock;

        const getGamesInfoMock = jest.fn((ids) => (new Promise<ExtendedGameInfo[]>(async (resolver) => resolver(
            ids.map((idx) => extendedGameInfos[idx])
        ))));

        service.getGamesInfo = getGamesInfoMock;

        const onLoadChange = jest.fn((games) => { });
        loader.onLoadUpdate(onLoadChange);

        const onGamesUpdate = jest.fn((games) => { });
        loader.onGamesUpdate(onGamesUpdate);

        await loader.loadCollections(usernames);
        onGamesUpdate.mockClear();
        getGamesInfoMock.mockClear();
        onLoadChange.mockClear();
        const promise = loader.loadExtendedInfo().then(() => {
            expect(onGamesUpdate.mock.calls[0][0]).toHaveLength(2);
            expect(getGamesInfoMock.mock.calls).toHaveLength(1);
            expect(onGamesUpdate.mock.calls).toHaveLength(1);
            expect(onGamesUpdate.mock.calls[0][0][0].description).toEqual("SevenExtended");
            expect(onGamesUpdate.mock.calls[0][0][1].description).toEqual("AlchemistExtended");
        });
        await promise;
    });


    it("Can load play information for current collections", async () => {
        const usernames = ["Warium", "Cyndaq"];
        const collections = {
            Warium: [alchemists()],
            Cyndaq: [sevenWonders()]
        };

        const alchemistExtended: ExtendedGameInfo = {
            description: "AlchemistExtended",
            suggestedNumberOfPlayers: {}
        };

        const sevenWondersExtended: ExtendedGameInfo = {
            description: "SevenExtended",
            suggestedNumberOfPlayers: {}
        };
        const extendedGameInfos = {
            [161970]: alchemistExtended,
            [68448]: sevenWondersExtended
        };
        const play1: PlayInfo = {
            playId: 123,
            date: new Date(),
            quantity: 1,
            length: 42,
            gameId: 161970
        };

        const play2: PlayInfo = {
            playId: 124,
            date: new Date(),
            quantity: 1,
            length: 11,
            gameId: 68448
        };

        const playsInfo = {
            Warium: [play1],
            Cyndaq: [play2]
        };

        const getUserCollectionMock = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            collections[username]
        ))));

        service.getUserCollection = getUserCollectionMock;

        const getGamesInfoMock = jest.fn((ids) => (new Promise<ExtendedGameInfo[]>(async (resolver) => resolver(
            ids.map((idx) => extendedGameInfos[idx])
        ))));


        const getPlaysMock = jest.fn((username) => (new Promise<PlayInfo[]>(async (resolver) => resolver(
            playsInfo[username]
        ))));

        service.getGamesInfo = getGamesInfoMock;
        service.getPlays = getPlaysMock;

        const onLoadChange = jest.fn((games) => { });
        loader.onLoadUpdate(onLoadChange);

        const onGamesUpdate = jest.fn((games) => { });
        loader.onGamesUpdate(onGamesUpdate);

        await loader.loadCollections(usernames);
        await loader.loadExtendedInfo();
        onGamesUpdate.mockClear();
        getGamesInfoMock.mockClear();
        onLoadChange.mockClear();
        await loader.loadPlays();
        expect(getPlaysMock).toHaveBeenCalledTimes(2);
        expect(onLoadChange).toHaveBeenCalledTimes(4);
        expect(onGamesUpdate).toHaveBeenCalledTimes(2);
        expect(onGamesUpdate.mock.calls[1][0]).toHaveLength(2);
        expect(onGamesUpdate.mock.calls[1][0][0].plays[0]).toEqual(Object.assign({}, play2, { playedBy: "Cyndaq" }));
        expect(onGamesUpdate.mock.calls[1][0][1].plays[0]).toEqual(Object.assign({}, play1, { playedBy: "Warium" }));

    });
});
