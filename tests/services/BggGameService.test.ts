import BggGameService from "../../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import fetch from "node-fetch";

describe("BggGameService", () => {

    afterEach(fetchMock.restore)

    describe("Initialization", () => {
        it('Can be constructoed with a fetch service', () => {
            new BggGameService(fetch);
        });
    })

})

