import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
// import fetch from "node-fetch";

describe("BggGameService", () => {

    const mockedFetch = fetchMock.sandbox();
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    afterEach(mockedFetch.restore)

    describe("Initialization", () => {
        it('Can be constructoed with a fetch service', () => {
            new BggGameService(mockedFetch);
        });
    });

    describe("Get Collection", () => {
        const service = new BggGameService(mockedFetch);
        it('Calls the bgg api throug a proxy', () => {
            const expectedUrl = `${proxyUrl}https://api.geekdo.com/xmlapi2/collection?username=Warium&own=1&stats=1`;
            const myMock = mockedFetch.mock(expectedUrl, 200);
            service.getUserCollection("Warium");
            expect(myMock.lastUrl()).toEqual(expectedUrl);
        });
    });

})

