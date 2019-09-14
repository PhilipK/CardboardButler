import "@testing-library/jest-dom/extend-expect";
import { GamesFilterer } from "../../src/services/GamesFilterer";
import { alchemists, alchemistsTheKing, sevenWonders, smallWorld } from "./model/TestGames";
import { GameInfo } from "../../src/models/GameInfo";
import * as fetchMock from "fetch-mock";
import { getHugeCollection } from "./BggGameService.test";

describe("Filtering games", () => {
    const testGame1 = alchemists();
    const testGame2 = alchemistsTheKing();
    const testGame3 = sevenWonders();
    const testGame4 = smallWorld();
    const testCollection = [testGame1, testGame2, testGame3, testGame4];
    const filterer = new GamesFilterer();

    describe("default", () => {
        it("does not filter", () => {
            const result = filterer.filter(testCollection);
            expect(result.length).toEqual(testCollection.length);
        });

    });


    describe("games time filtering", () => {


        it("filters pesimisticly, games must be without the set time limit", () => {
            const filterOptions = {
                playtime: {
                    minimum: 30,
                    maximum: 60
                }
            };
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(1);
            expect(result).toEqual([testGame3]);
        });

        it("can handle infinite bounds maximum  ", () => {
            const filterOptions = {
                playtime: {
                    minimum: 60
                }
            };
            const filterer = new GamesFilterer();
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(2);
            expect(result).toEqual([testGame1, testGame2]);
        });

        it("can handle infinite bounds minimum  ", () => {
            const filterOptions = {
                playtime: {
                    maximum: 90
                }
            };
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(2);
            expect(result).toEqual([testGame3, testGame4]);
        });

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
            const fakeCollection = [fakeGame];
            const filterOptions = {
                playtime: {
                    minimum: 30
                }
            };
            const result = filterer.filter(fakeCollection, filterOptions);
            expect(result).toHaveLength(1);
        });
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
            const fakeCollection = [fakeGame];
            const filterOptions = {
                playtime: {
                    maximum: 90
                }
            };
            const result = filterer.filter(fakeCollection, filterOptions);
            expect(result).toHaveLength(0);
        });
    });

    describe("player count time filtering", () => {
        it("filters on player count", () => {
            const result = filterer.filter(testCollection, {
                playerCount: 5
            });
            expect(result).toEqual([testGame3, testGame4]);
        });
    });

    describe("filtering large collections", () => {
        it("filter large collections", async () => {
            const largeCollection = await getHugeCollection();
            expect(largeCollection).toHaveLength(360);
            if (Array.isArray(largeCollection)) {
                const result = filterer.filter(largeCollection, {
                    playerCount: 5,
                    playtime: { minimum: 30, maximum: 80 }
                });
                expect(result).toHaveLength(100);
                expect(result).toMatchSnapshot();
            }
        });
    });

    describe("sorting", () => {
        it("sorts by name by default", () => {
            const onOrdered = [testGame2, testGame3, testGame1, testGame4];
            const nameOrdered = [testGame3, testGame1, testGame2, testGame4];
            const result = filterer.filter(onOrdered);
            expect(result.map((r) => r.name)).toEqual(nameOrdered.map((r) => r.name));
        });
        it("can sort by bggranking", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const rankordering = [testGame2, testGame3, testGame1, testGame4];
            const result = filterer.filter(onOrdered, { sortOption: "bggrating" });
            expect(result.map((r) => r.averagerating)).toEqual(rankordering.map((r) => r.averagerating));
        });
        it("can sort by new games", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const newOrdering = [testGame2, testGame1, testGame3, testGame4];
            const result = filterer.filter(onOrdered, { sortOption: "new" });
            expect(result.map((r) => r.yearPublished)).toEqual(newOrdering.map((r) => r.yearPublished));
        });

        it("can sort by old games", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const oldOrdering = [testGame4, testGame3, testGame1, testGame2];
            const result = filterer.filter(onOrdered, { sortOption: "old" });
            expect(result.map((r) => r.yearPublished)).toEqual(oldOrdering.map((r) => r.yearPublished));
        });

        it("when sorting by new, it handles games without year as always being very old", () => {
            const wihtoutYear = Object.assign({}, testGame4, { yearPublished: undefined });
            const onOrdered = [wihtoutYear, testGame1, testGame2, testGame3];
            const oldOrdering = [testGame3, testGame1, testGame2, wihtoutYear];
            const result = filterer.filter(onOrdered, { sortOption: "old" });
            expect(result.map((r) => r.yearPublished)).toEqual(oldOrdering.map((r) => r.yearPublished));
        });

        it("when sorting by old, it handles games without year as always being very new", () => {
            const wihtoutYear = Object.assign({}, testGame4, { yearPublished: undefined });
            const onOrdered = [testGame1, wihtoutYear, testGame2, testGame3];
            const newOrdering = [testGame2, testGame1, testGame3, wihtoutYear];
            const result = filterer.filter(onOrdered, { sortOption: "new" });
            expect(result.map((r) => r.yearPublished)).toEqual(newOrdering.map((r) => r.yearPublished));
        });

        it("can sort by user rating", () => {
            const ratedGame1 = Object.assign({}, testGame1, { userRating: { cyndaq: 7 } });
            const ratedGame2 = Object.assign({}, testGame2, { userRating: { warium: 6 } });
            const onOrdered = [ratedGame2, ratedGame1, testGame3];
            const newOrdering = [ratedGame1, ratedGame2, testGame3];
            const result = filterer.filter(onOrdered, { sortOption: "userrating" });
            expect(result.map((r) => r.userRating)).toEqual(newOrdering.map((r) => r.userRating));
        });

        it("can sort by multiple user rating", () => {
            const ratedGame1 = Object.assign({}, testGame1, { userRating: { cyndaq: 7, warium: null, nakul: 4 } });
            const ratedGame2 = Object.assign({}, testGame2, { userRating: { warium: 6, cyndaq: 4 } });
            const onOrdered = [ratedGame2, ratedGame1, testGame3];
            const newOrdering = [ratedGame1, ratedGame2, testGame3];
            const result = filterer.filter(onOrdered, { sortOption: "userrating" });
            expect(result.map((r) => r.userRating)).toEqual(newOrdering.map((r) => r.userRating));
        });
    });
});
