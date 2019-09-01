import GameService, { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";
import * as convert from "xml-js";
import { GameInfo } from "../models/GameInfo";

class BggGameService implements GameService {

    private fetchService: FetchService;


    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    async getUserCollection(username: string) {
        const xmlResult = await this.fetCollectionXml(username);
        const jsObj = convert.xml2js(xmlResult);
        const allItems: convert.Element[] = jsObj.elements[0].elements;
        return allItems.map((item: convert.Element) => {
            const tag = item.elements;
            const gameName = this.getTagValue(tag, "name");
            const thumbnailUrl = this.getTagValue(tag, "thumbnail");
            const yearpublished = parseInt(this.getTagValue(tag, "yearpublished"), 10);
            const game: GameInfo = {
                name: gameName,
                thumbnailUrl: thumbnailUrl,
                yearPublished: yearpublished
            }
            return game;
        })
    }

    private getTagValue(tags: convert.Element[], tagName: string) {
        return tags.find((t) => t.name == tagName).elements[0].text.toString();
    }

    private async fetCollectionXml(username: string) {
        return await this.fetchService(this.buildCollectionUrl(username)).then((res) => res.text());
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }
}

export default BggGameService;