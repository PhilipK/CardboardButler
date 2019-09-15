import DescriptionGenerator from "../../src/services/GameDescriptionGenerator";
import "@testing-library/jest-dom/extend-expect";
import { alchemists } from "./model/TestGames";

describe("DescriptionGenerator", () => {

    const testItem = Object.assign({}, alchemists());

    const generator = new DescriptionGenerator();

    it("outputs a string given a game.", () => {
        const description = generator.generateDescription(testItem);
        expect(description).toBeDefined();
        expect(typeof description).toBe("string");
    });

    it("can describe without a weight", () => {
        const testWithoutWeight = Object.assign({}, testItem, { weight: undefined });
        const expected = "A strategy game for 2 to 4 players in 120 minutes. Most people think it is very good.";
        const description = generator.generateDescription(testWithoutWeight);
        expect(description).toBe(expected);
    });

    it("can describe with a weight", () => {
        const expected = "A strategy game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testItem);
        expect(description).toBe(expected);
    });


    it("can describe without a family", () => {
        const testWithoutFamily = Object.assign({}, testItem, { families: undefined });
        const expected = "A boardgame for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testWithoutFamily);
        expect(description).toBe(expected);
    });

    it("pick the highest ranked family", () => {
        const testWithTwoFamilies = Object.assign({}, testItem, {
            families: [
                { name: "Unfriendly", friendlyName: "Unfriendly game", bayesaverage: 7.50035, value: 76 },
                { name: "abstractgames", friendlyName: "Abstract Game Rank", bayesaverage: 7.50035, value: 10 }
            ]
        });
        const expected = "An abstract game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testWithTwoFamilies);
        expect(description).toBe(expected);
    });

    it("handles games without player count ranges", () => {
        const singlePlayerGame = Object.assign({}, testItem, { minPlayers: 1, maxPlayers: 1 });
        const expected = "A strategy game for 1 player in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });

    it("sorts out the rank word information", () => {
        const singlePlayerGame = Object.assign({}, testItem, {
            families: [
                { name: "Unfriendly", friendlyName: "Unfriendly game Rank", bayesaverage: 7.50035, value: 76 },
                { name: "thematic", friendlyName: "Thematic Rank", bayesaverage: 6.20458, value: 585 },

            ]
        });
        const expected = "An unfriendly game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });

    it("Always has a game at the end of a description", () => {
        const singlePlayerGame = Object.assign({}, testItem, {
            families: [
                { name: "Unfriendly", friendlyName: "Unfriendly game Rank", bayesaverage: 7.50035, value: 76 },
                { name: "thematic", friendlyName: "Thematic Rank", bayesaverage: 6.20458, value: 1 },

            ]
        });
        const expected = "A thematic game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });


    it("handles games without incorrect min max playtimes", () => {
        const singlePlayerGame = Object.assign({}, testItem, { minPlaytime: 100, maxPlaytime: 90 });
        const expected = "A strategy game for 2 to 4 players in 100 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });



    it("handles games with min max playtimes ranges", () => {
        const singlePlayerGame = Object.assign({}, testItem, { minPlaytime: 60, maxPlaytime: 90 });
        const expected = "A strategy game for 2 to 4 players in 60 - 90 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });

    it("handles games without rating", () => {
        const singlePlayerGame = Object.assign({}, testItem, { averagerating: undefined });
        const expected = "A strategy game for 2 to 4 players in 120 minutes. Most people think it is somewhat hard to learn.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });

    it("handles games without rating and weight", () => {
        const singlePlayerGame = Object.assign({}, testItem, { averagerating: undefined, weight: undefined });
        const expected = "A strategy game for 2 to 4 players in 120 minutes.";
        const description = generator.generateDescription(singlePlayerGame);
        expect(description).toBe(expected);
    });
});

