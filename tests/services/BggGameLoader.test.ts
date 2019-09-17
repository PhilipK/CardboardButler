
import BggGameLoader from "../../src/services/BggGameLoader";
import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { getHugeCollection, getLargeCollection } from "./BggGameService.test";
import { GameInfo } from "../../src/models/GameInfo";

describe("Loading games", () => {

    const fetch = fetchMock.sandbox();
    afterEach(fetch.restore);

    const service = new BggGameService(fetch);

    it("is initialized with a bggservice", () => {
        new BggGameLoader(service);
    });


    it("fetches collections when requested", () => {
        const collections = ["Warium", "Nakul"];
        const loader = new BggGameLoader(service);
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
        const loader = new BggGameLoader(service);
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
        expect(onUpdateMock.mock.calls).toHaveLength(2);
    });

    it("can get the users currently shown", () => {
        const collections = ["Warium", "Nakul"];
        const loader = new BggGameLoader(service);
        const getMock = jest.fn((username) => (new Promise<GameInfo[]>(async (resolver) => resolver(
            await getLargeCollection()
        ))));
        service.getUserCollection = getMock;
        loader.loadCollections(collections);
        expect(loader.currentNames()).toEqual(collections);

    });

    it("can show requests which are currently fetching", async () => {
        const collections = ["Warium"];
        const loader = new BggGameLoader(service);
        let resolver: (value?: Promise<GameInfo[]>) => void;
        const getMock = jest.fn((username) => (new Promise<GameInfo[]>((r) => resolver = r)));
        service.getUserCollection = getMock;
        const promise = loader.loadCollections(collections);
        expect(getMock.mock.calls[0][0]).toBe("Warium");
        expect(loader.getLoadingInfo()).toEqual([
            { username: "Warium", isWaitingForRetry: false }
        ]);
        const handler = jest.fn((games) => {
            expect(loader.getLoadingInfo()).toEqual([]);
        });
        loader.onGamesUpdate(handler);
        resolver(getLargeCollection());
        await promise;
        expect(handler.mock.calls).toHaveLength(1);

    });
});
