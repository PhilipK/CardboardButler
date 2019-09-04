import { GameInfo } from "../../src/models/GameInfo";
import DescriptionGenerator from "../../src/services/GameDescriptionGenerator";
import "@testing-library/jest-dom/extend-expect";

describe("DescriptionGenerator", () => {

    const testItem: GameInfo = {
        id: 204650,
        name: "Alchemiests",
        imageUrl: "https://cf.geekdo-images.com/original/img/VKBFHqR2xm0EFGWfb1sPJZctMCs=/0x0/pic2241156.png",
        thumbnailUrl: "https://cf.geekdo-images.com/thumb/img/4VjOkEjTXNR4KQMjaOK7JibjPSw=/fit-in/200x150/pic2241156.png",
        yearPublished: 2014,
        minPlayers: 2,
        maxPlayers: 4,
        minPlaytime: 120,
        maxPlaytime: 120,
        averagerating: 7.69466,
        weight: 3.83,
        families: [
            { name: "strategygames", friendlyName: "Strategy Game Rank", bayesaverage: 7.50035, value: 76 }
        ]

    };

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
    })

    it("can describe with a weight", () => {
        const expected = "A strategy game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testItem);
        expect(description).toBe(expected);
    })


    it("can describe without a family", () => {
        const testWithoutFamily = Object.assign({}, testItem, { families: undefined });
        const expected = "A boardgame for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testWithoutFamily);
        expect(description).toBe(expected);
    })

    it("pick the highest ranked family", () => {
        const testWithTwoFamilies = Object.assign({}, testItem);
        testWithTwoFamilies.families.push({ name: "abstractgames", friendlyName: "Abstract Game Rank", bayesaverage: 7.50035, value: 10 });
        const expected = "An abstract game for 2 to 4 players in 120 minutes. Most people think it is very good and somewhat hard to learn.";
        const description = generator.generateDescription(testItem);
        expect(description).toBe(expected);
    })

});

