import GameService, { CollectionResult, BggRetryResult } from "./GameService";
import FetchService from "./FetchService";
import * as convert from "xml-js";
import { GameInfo } from "../models/GameInfo";

class BggGameService {

    private fetchService: FetchService;


    constructor(fetchService?: FetchService) {
        this.fetchService = fetchService;
    }

    async getUserCollection(username: string): Promise<BggRetryResult | GameInfo[]> {
        const xmlResult = await this.fetCollectionXml(username);
        if (typeof xmlResult !== "string") {
            return xmlResult;
        };
        const jsObj = convert.xml2js(xmlResult);
        const allItems: convert.Element[] = jsObj.elements[0].elements;
        return allItems.map((item: convert.Element) => {
            const elements = item.elements;
            const valueOf = (attributeName: string) => this.getTagValue(elements, attributeName);
            const playStats = this.getPlayStats(elements);;
            const game: GameInfo = Object.assign({
                name: valueOf("name"),
                thumbnailUrl: valueOf("thumbnail"),
                yearPublished: parseInt(valueOf("yearpublished"), 10),
                imageUrl: valueOf("image"),

            }, playStats);
            return game;
        })
    }

    private getPlayStats(tags: convert.Element[]) {
        const stats = tags.find((t) => t.name == "stats");
        const attr = stats.attributes;
        return {
            minPlayers: attr.minplayers && parseInt(attr.minplayers.toString()),
            maxPlayers: attr.maxplayers && parseInt(attr.maxplayers.toString()),
            minPlaytime: attr.minplaytime && parseInt(attr.minplaytime.toString()),
            maxPlaytime: attr.maxplaytime && parseInt(attr.maxplaytime.toString()),
            playingTime: attr.playingtime && parseInt(attr.playingtime.toString()),
            numberOwned: attr.numowned && parseInt(attr.numowned.toString()),
        }
    };

    private getTagValue(tags: convert.Element[], tagName: string) {
        return tags.find((t) => t.name == tagName).elements[0].text.toString();
    }

    private async fetCollectionXml(username: string) {
        const url = this.buildCollectionUrl(username);
        const f = this.fetchService || fetch;
        return f(url).then(async (res) => {
            if (res.status === 200) {
                return await res.text();
            } else {
                if (res.status === 202) {
                    return { retryLater: true };
                }
            }
        }).catch((error:Error) => {
            return { retryLater: true, error };

        });
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }
}

export default BggGameService;