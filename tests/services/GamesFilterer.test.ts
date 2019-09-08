import "@testing-library/jest-dom/extend-expect";
import { GamesFilterer } from "../../src/services/GamesFilterer";
import { alchemists, alchemistsTheKing, sevenWonders, smallWorld } from "./model/TestGames";
import { GameInfo } from "../../src/models/GameInfo";

describe("Filtering games", () => {

    const testCollection = [alchemists, alchemistsTheKing, sevenWonders, smallWorld];


    describe("games time filtering", () => {

        it("no options result in no time filtering", () => {
            const filterer = new GamesFilterer({});
            const result = filterer.filter(testCollection);
            expect(result).toEqual(testCollection)
        })
        it("filters pesimisticly, games must be without the set time limit", () => {
            const filterer = new GamesFilterer({
                playtime: {
                    minimum: 30,
                    maximum: 60
                }
            });
            const result = filterer.filter(testCollection);
            expect(result).toHaveLength(1)
            expect(result).toEqual([sevenWonders])
        })

        it("can handle infinite bounds maximum  ", () => {
            const filterer = new GamesFilterer({
                playtime: {
                    minimum: 60
                }
            });
            const result = filterer.filter(testCollection);
            expect(result).toHaveLength(2)
            expect(result).toEqual([alchemists, alchemistsTheKing])
        })

        it("can handle infinite bounds minimum  ", () => {
            const filterer = new GamesFilterer({
                playtime: {
                    maximum: 90
                }
            });
            const result = filterer.filter(testCollection);
            expect(result).toHaveLength(2)
            expect(result).toEqual([sevenWonders, smallWorld])
        })

        it("can handle if game has missing limits", () => {
            const fakeGame: GameInfo = {
                name: "FakeGame",
                thumbnailUrl: "Url",
                yearPublished: 2012,
                families: [],
                averagerating: 8,
                id: 2323,
                minPlaytime: 60,
                imageUrl: "ImageUrl"
            };
            const fakeCollection = [fakeGame]
            const filterer = new GamesFilterer({
                playtime: {
                    minimum: 30
                }
            });
            const result = filterer.filter(fakeCollection);
            expect(result).toHaveLength(1)
        })
        it("can handle if game has no limit", () => {
            const fakeGame: GameInfo = {
                name: "FakeGame",
                thumbnailUrl: "Url",
                yearPublished: 2012,
                families: [],
                averagerating: 8,
                id: 2323,
                imageUrl: "ImageUrl"
            };
            const fakeCollection = [fakeGame]
            const filterer = new GamesFilterer({
                playtime: {
                    maximum: 90
                }
            });
            const result = filterer.filter(fakeCollection);
            expect(result).toHaveLength(0)
        })
    });
});
