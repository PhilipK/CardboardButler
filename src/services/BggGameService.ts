import FetchService from "./FetchService";
import * as convert from "xml-js";
import { GameInfo, ExtendedGameInfo, SuggestedNumberOfPlayersMap, PlayInfo } from "../models/GameInfo";
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
        const result = await this.getGamesInfo([id]);
        return Array.isArray(result) ? result[0] : result;
    }

    async getGamesInfo(ids: number[]): Promise<BggRetryResult | ExtendedGameInfo[]> {
        const xml = await this.fetchGamesXml(ids);
        if (typeof xml === "string") {
            const jsObj = convert.xml2js(xml) as convert.Element;
            const itemElements = jsObj.elements[0].elements;
            return itemElements.map((this.elementToExtendedInfo));
        } else {
            return xml;
        }
    }



    async getPlays(username: string): Promise<BggRetryResult | PlayInfo[]> {
        const firstPage = await this.getPlaysPage(username);
        if ("plays" in firstPage) {
            const { plays, totalPlays } = firstPage;
            const needMorePlays = firstPage.totalPlays > firstPage.plays.length;
            if (needMorePlays) {
                const numberOfPagesMissing = Math.ceil(totalPlays / plays.length) - 1;
                const missingPagesPromises = new Array(numberOfPagesMissing).fill(0).map((_, i) => this.getPlaysPage(username, i + 2)); // start at index 2, we already have page 1
                const missingPagesResults = await Promise.all(missingPagesPromises);
                const missingPagesPlays = missingPagesResults.reduce((prev, cur) => ("plays" in cur) ? prev.concat(cur.plays) : prev, [] as PlayInfo[]);
                return [...plays, ...missingPagesPlays];
            } else {
                return plays;
            }
        } else {
            return firstPage;
        }

    }

    async getPlaysPage(username: string, pageNumber: number = 1) {
        const xml = await this.fetchPlaysXml(username, pageNumber);
        if (typeof xml === "string") {
            const jsObj = convert.xml2js(xml) as convert.Element;
            const mainPlayElement = jsObj.elements[0];
            if (mainPlayElement.elements === undefined) {
                return {
                    totalPlays: 0,
                    pageNumber: pageNumber,
                    plays: []
                };
            }
            const itemElements = mainPlayElement.elements;
            const totalPlays = parseInt(mainPlayElement.attributes["total"].toString());
            return {
                totalPlays: totalPlays,
                pageNumber: pageNumber,
                plays: itemElements.map(this.elementToPlayInfo)
            };
        } else {
            return xml;
        }
    }

    private elementToPlayInfo(mainElement: convert.Element): PlayInfo {

        return {
            date: new Date(mainElement.attributes["date"]),
            gameId: parseInt(mainElement.elements[0].attributes["objectid"].toString()),
            length: parseInt(mainElement.attributes["length"].toString()),
            playId: parseInt(mainElement.attributes["id"].toString()),
            quantity: parseInt(mainElement.attributes["quantity"].toString()),
        };

    }



    private elementToExtendedInfo(mainElement: convert.Element): ExtendedGameInfo {
        const mainElements = mainElement.elements;
        const suggestedplayersElement = mainElements.find((e) => e.name === "poll" && e.attributes.name === "suggested_numplayers");
        const suggestedNumberOfPlayersArray = suggestedplayersElement.elements.map((e) => {
            const numOfPlayersString = e.attributes.numplayers.toString();
            const numberOfPlayers = numOfPlayersString.indexOf("+") > -1 ? Infinity : parseInt(numOfPlayersString, 10);
            const getNumberOfVotes = (resultType: string) => parseInt(e.elements.find((e) => e.name === "result" && e.attributes["value"].toString() === resultType).attributes.numvotes as string);
            if (e.elements) {
                const best = getNumberOfVotes("Best");
                const recommended = getNumberOfVotes("Recommended");
                const notRecommended = getNumberOfVotes("Not Recommended");
                return {
                    numberOfPlayers: numberOfPlayers,
                    best: best,
                    recommended: recommended,
                    notRecommended: notRecommended
                };
            }
            return undefined;

        });
        const suggesteNumberOfPlayersMap: SuggestedNumberOfPlayersMap = suggestedNumberOfPlayersArray.filter((snp) => snp).reduce((p, c) => Object.assign(p, { [c.numberOfPlayers]: c }), {});
        const getLinkValues = (typeName: string) => mainElements.filter((e) => e.name === "link" && e.attributes["type"] === typeName).map((e) => e.attributes["value"].toString());
        return {
            description: mainElements.find((e) => e.name === "description").elements[0].text.toString().trim(),
            weight: parseFloat(mainElements.find((e) => e.name === "statistics").elements[0].elements.find((e) => e.name === "averageweight").attributes["value"].toString().trim()),
            mechanics: getLinkValues("boardgamemechanic"),
            categories: getLinkValues("boardgamecategory"),
            suggestedNumberOfPlayers: suggesteNumberOfPlayersMap
        };
    }


    private getFetch() {
        return this.fetchService;
    }

    private getAverageRating(elements: convert.Element[]) {
        const stringValue = this.getRatingElement(elements).elements.find((t) => t.name === "bayesaverage").attributes.value;
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
        const parseAsInt = (name: string) => attr[name] && parseInt(attr[name].toString());
        return {
            minPlayers: parseAsInt("minplayers"),
            numberOwned: parseAsInt("numowned"),
            maxPlayers: parseAsInt("maxplayers"),
            minPlaytime: parseAsInt("minplaytime"),
            maxPlaytime: parseAsInt("maxplaytime"),
            playingTime: parseAsInt("playingtime")
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


    private async fetchGamesXml(ids: number[]) {
        const url = this.buildGameUrls(ids);
        return this.fethXml(url);
    }


    private async fetchPlaysXml(username: string, pageNumber: number) {
        const url = this.buildPlaysUrl(username, pageNumber);
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
        return this.getFetch()(url).then(async (res) => {
            if (res.status === 429) {
                return { error: "backoff" };
            }
            return await res.text();
        }).catch((error: Error) => {
            return { error };
        });
    }

    private buildPlaysUrl(username: string, pageNumber: number) {
        const baseUrl = `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/plays?username=${username}`;
        return pageNumber > 1 ? (baseUrl + "&page=" + pageNumber) : baseUrl;
    }

    private buildGameUrls(ids: number[]) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/thing?id=${ids.join(",")}&stats=1`;
    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1&excludesubtype=boardgameexpansion`;
    }

    private buildUserUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/user?name=${username}`;
    }


}



export default BggGameService;
