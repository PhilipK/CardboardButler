import FetchService from "./FetchService";
import * as convert from "xml-js";
import { GameInfo, ExtendedGameInfo } from "../models/GameInfo";
import { UserInfo } from "../models/UserInfo";


export type BggRetryResult = { retryLater: boolean, backoff?: boolean, error?: Error };
/**
 * A service that can wraps the BGG Api.
 * It does not cache, or handle retries, it simple transform the bgg api into xml
 * Be adviced: This uses a CORS proxy, to get around the BGG API not providing CORS information.
 */
class BggGameService {

    private fetchService: FetchService;

    /**
     * Construct a new bgg game service.
     * @param fetchService the service to use when trying to fetch information from bgg. If none is given the browser global fetch will be used.
     */
    constructor(fetchService?: FetchService) {
        this.fetchService = fetchService || fetch;
    }

    /**
     * Gets a collection of the owned games from a user.
     * @param username username of the user whose collection to get.
     * @returns Either a list of game infromation, or a bgg retry result, if there is an error or bgg needed time to generate the list.
     */
    async getUserCollection(username: string): Promise<BggRetryResult | GameInfo[]> {
        const xmlResult = await this.fetchCollectionXml(username);
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
            const yearAsString: string | undefined = valueOf("yearpublished");
            const yearAsNumber = yearAsString === undefined ? undefined : parseInt(yearAsString, 10);
            const gameId = parseInt(item.attributes.objectid as string);
            const game: GameInfo = Object.assign({
                id: gameId,
                averagerating: this.getAverageRating(elements),
                name: valueOf("name"),
                thumbnailUrl: valueOf("thumbnail"),
                yearPublished: yearAsNumber,
                imageUrl: valueOf("image"),
                families: this.getFamilies(elements),
                userRating: this.getUserRating(username, elements)
            }, playStats);
            return game;
        });
    }

    /**
     * Get user information about a given useranme.
     * If a username is given that does not excist then "isValid:true" will be returned.
     * If the call to bgg fails, then "isValid:unknown" is returend, as the service cannot know if the name is valid.
     * @param username the username to get information for
     */
    async getUserInfo(username: string): Promise<UserInfo> {
        const xml = await this.fetUserInfoXml(username);
        if (typeof xml !== "string") {
            return {
                isValid: "unknown",
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


    async getGameInfo(id: number): Promise<BggRetryResult | ExtendedGameInfo> {
        const xml = await this.fetchGameXml(id);
        if (typeof xml === "string") {
            const jsObj = convert.xml2js(xml) as convert.Element;
            const mainElements = jsObj.elements[0].elements[0].elements;
            return {
                description: mainElements.find((e) => e.name === "description").elements[0].text.toString().trim(),
                weight: parseFloat(mainElements.find((e) => e.name === "statistics").elements[0].elements.find((e) => e.name === "averageweight").attributes["value"].toString().trim()),
                mechanics: mainElements.filter((e) => e.name === "link" && e.attributes["type"] === "boardgamemechanic").map((e) => e.attributes["value"].toString()),
                categories: mainElements.filter((e) => e.name === "link" && e.attributes["type"] === "boardgamecategory").map((e) => e.attributes["value"].toString()),
            };
        } else {
            return xml;
        }

    }

    private getFetch() {
        return this.fetchService;
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

    private getUserRating(username: string, elements: convert.Element[]) {
        const ratingElement = this.getRatingElement(elements);
        const ratingString = ratingElement.attributes["value"] as string;
        const rating = (ratingString === "N/A" || ratingString === undefined) ? null : parseFloat(ratingString);
        const result = {};
        result[username] = rating;
        return result;
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
        const tagElement = tags.find((t) => t.name === tagName);
        if (!(tagElement && tagElement.elements)) {
            return undefined;
        }
        return tagElement.elements[0].text.toString();
    }

    private async fetchCollectionXml(username: string) {
        const url = this.buildCollectionUrl(username);
        return this.fethXml(url);
    }

    private async fetchGameXml(id: number) {
        const url = this.buildGameUrl(id);
        return this.fethXml(url);
    }


    private async fethXml(url: string) {
        return this.getFetch()(url).then(async (res) => {
            if (res.status === 200) {
                return res.text();
            }
            if (res.status === 429) {
                return { retryLater: true, backoff: true };
            }
            else {
                return { retryLater: true };
            }
        }).catch((error: Error) => {
            return { retryLater: true, error };

        });
    }

    private async fetUserInfoXml(username: string) {
        const url = this.buildUserUrl(username);
        return this.getFetch()(url).then((res) => {
            return res.text();
        }).catch((error: Error) => {
            return { error };
        });
    }

    private buildGameUrl(id: number) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/thing?id=${id}&stats=1`;
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1&excludesubtype=boardgameexpansion`;
    }

    private buildUserUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/user?name=${username}`;
    }


}

export default BggGameService;