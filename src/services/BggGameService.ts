import { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";
import * as convert from "xml-js";
import { GameInfo } from "../models/GameInfo";
import { UserInfo } from "../models/UserInfo";

/**
 * A service that can get Gameplay information from the BGG Api.
 */
class BggGameService {

    private fetchService: FetchService;

    /**
     * Construct a new bgg game service.
     * @param fetchService the service to use when trying to fetch information from bgg. If none is given the browser global fetch will be used.
     */
    constructor(fetchService?: FetchService) {
        this.fetchService = fetchService;
    }

    /**
     * Gets a collection of the owned games from a user.
     * @param username username of the user whose collection to get.
     * @returns Either a list of game infromation, or a bgg retry result, if there is an error or bgg needed time to generate the list.
     */
    async getUserCollection(username: string): Promise<BggRetryResult | GameInfo[]> {
        const xmlResult = await this.fetCollectionXml(username);
        if (typeof xmlResult !== "string") {
            return xmlResult;
        }
        const jsObj = convert.xml2js(xmlResult);
        if (jsObj.elements === undefined) {
            return [];
        }
        const allItems: convert.Element[] = jsObj.elements[0].elements;
        return allItems.map((item: convert.Element) => {
            const elements = item.elements;
            const valueOf = (attributeName: string) => this.getTagValue(elements, attributeName);
            const playStats = this.getPlayStatsFromCollection(elements);
            const gameId = parseInt(item.attributes.objectid as string);
            const game: GameInfo = Object.assign({
                id: gameId,
                averagerating: this.getAverageRating(elements),
                name: valueOf("name"),
                thumbnailUrl: valueOf("thumbnail"),
                yearPublished: parseInt(valueOf("yearpublished"), 10),
                imageUrl: valueOf("image"),
                families: this.getFamilies(elements)
            }, playStats);
            return game;
        });
    }

    async getUserInfo(username: string): Promise<UserInfo> {
        const xml = await this.fetUserInfoXml(username);
        if (typeof xml !== "string") {
            return {
                isValid: false,
                error: xml.error
            };
        }
        const jsObj = convert.xml2js(xml);
        if (jsObj.elements) {
            const attributes = jsObj.elements[0].attributes;
            const id = attributes.id;
            if (id !== "") {
                const name = attributes.name;
                return {
                    isValid: true,
                    username: name
                };
            }
        }
        return {
            isValid: false
        };
    }

    private getAverageRating(elements: convert.Element[]) {
        const stringValue = this.getRatingElement(elements).elements.find((t) => t.name === "average").attributes.value;
        return parseFloat(stringValue.toString());
    }

    private getStatsElement(elements: convert.Element[]) {
        return elements.find((t) => t.name === "stats");
    }

    private getRatingElement(elements: convert.Element[]) {
        return this.getStatsElement(elements).elements[0];
    }

    private getPlayStatsFromCollection(elements: convert.Element[]) {
        const stats = this.getStatsElement(elements);
        const attr = stats.attributes;
        return {
            minPlayers: attr.minplayers && parseInt(attr.minplayers.toString()),
            maxPlayers: attr.maxplayers && parseInt(attr.maxplayers.toString()),
            minPlaytime: attr.minplaytime && parseInt(attr.minplaytime.toString()),
            maxPlaytime: attr.maxplaytime && parseInt(attr.maxplaytime.toString()),
            playingTime: attr.playingtime && parseInt(attr.playingtime.toString()),
            numberOwned: attr.numowned && parseInt(attr.numowned.toString()),
        };
    }

    private getFamilies(elements: convert.Element[]) {
        const ranks = this.getRanks(elements);
        return ranks.filter((r) => r.type === "family");
    }


    private getRanks(elements: convert.Element[]) {
        const ratings = this.getRatingElement(elements);
        const ranks = ratings.elements.find((t) => t.name === "ranks").elements;
        return ranks.map((element) => {
            const attributes = element.attributes;
            return {
                name: attributes.name.toString(),
                friendlyName: attributes.friendlyname.toString(),
                bayesaverage: parseFloat(attributes.bayesaverage.toString()),
                value: parseInt(attributes.value.toString()),
                type: attributes.type.toString()
            };
        });
    }

    private getTagValue(tags: convert.Element[], tagName: string) {
        return tags.find((t) => t.name === tagName).elements[0].text.toString();
    }

    private async fetCollectionXml(username: string) {
        const url = this.buildCollectionUrl(username);
        const f = this.fetchService || fetch;
        return f(url).then(async (res) => {
            if (res.status === 200) {
                return res.text().catch((error) => ({ retryLater: true, error }));
            } else {
                if (res.status === 202) {
                    return { retryLater: true };
                }
            }
        }).catch((error: Error) => {
            return { retryLater: true, error };

        });
    }

    private async fetUserInfoXml(username: string) {
        const url = this.buildUserUrl(username);
        const f = this.fetchService || fetch;
        return f(url).then((res) => {
            return res.text();
        }).catch((error: Error) => {
            return { error };
        });
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }

    private buildUserUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/user?name=${username}`;
    }
}

export default BggGameService;