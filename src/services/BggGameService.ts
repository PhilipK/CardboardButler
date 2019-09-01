import GameService, { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";
import * as convert from "xml-js";

class BggGameService implements GameService {

    private fetchService: FetchService;


    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    async getUserCollection(username: string): Promise<GameInfo[] | BggRetryResult> {
        const xmlResult = await this.fetCollectionXml(username);
        const jsObj = convert.xml2js(xmlResult);
        const allItems = jsObj.elements[0].elements;
        return allItems.map((item: convert.Element) => {
            const tag = item.elements;
            const gameName = tag.find((t) => t.name == "name").elements[0].text.toString();
            const game: GameInfo = {
                name: gameName,
                thumbnailUrl: "seena"
            }
            return game;
        })
    }

    private async fetCollectionXml(username: string) {
        return await this.fetchService(this.buildCollectionUrl(username)).then((res) => res.text());
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }
}

export default BggGameService;