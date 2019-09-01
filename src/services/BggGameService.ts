import GameService, { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";
import * as convert from "xml-js";

class BggGameService implements GameService {

    private fetchService: FetchService;
    private parser = new DOMParser();


    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    async getUserCollection(username: string): Promise<GameInfo[] | BggRetryResult> {
        const textXml = await this.fetchService(this.buildCollectionUrl(username)).then((res) => res.text());
        const jsObj = convert.xml2js(textXml);
        const itemsXml: [] = jsObj.elements[0].elements;

        const games: GameInfo[] = itemsXml.map((item) => {
            const game: GameInfo = {
                name: "john",
                thumbnailUrl: "seena"
            }
            return game;
        })


        return games;

    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }
}

export default BggGameService;