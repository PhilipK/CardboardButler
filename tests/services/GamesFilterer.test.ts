import "@testing-library/jest-dom/extend-expect";
import { GamesFilterAndSorter } from "../../src/services/GamesFilterAndSorter";
import { alchemists, alchemistsTheKing, sevenWonders, smallWorld } from "./model/TestGames";
import { GameInfo, GameInfoPlus, SuggestedNumberOfPlayersMap } from "../../src/models/GameInfo";
import { getHugeCollection } from "./TestHelpers";

describe("Filtering games", () => {
    const testGame1 = alchemists();
    const testGame2 = alchemistsTheKing();
    const testGame3 = sevenWonders();
    const testGame4 = smallWorld();
    const testCollection = [testGame1, testGame2, testGame3, testGame4];
    const filterer = new GamesFilterAndSorter();

    describe("default", () => {
        it("does not filter", () => {
            const result = filterer.filterAndSort(testCollection);
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
            const result = filterer.filterAndSort(testCollection, filterOptions);
            expect(result).toHaveLength(1);
            expect(result).toEqual([testGame3]);
        });

        it("can handle infinite bounds maximum  ", () => {
            const filterOptions = {
                playtime: {
                    minimum: 60
                }
            };
            const filterer = new GamesFilterAndSorter();
            const result = filterer.filterAndSort(testCollection, filterOptions);
            expect(result).toHaveLength(2);
            expect(result).toEqual([testGame2, testGame1]);
        });

        it("can handle infinite bounds minimum  ", () => {
            const filterOptions = {
                playtime: {
                    maximum: 90
                }
            };
            const result = filterer.filterAndSort(testCollection, filterOptions);
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
            const result = filterer.filterAndSort(fakeCollection, filterOptions);
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
            const result = filterer.filterAndSort(fakeCollection, filterOptions);
            expect(result).toHaveLength(0);
        });
    });

    describe("player count time filtering", () => {
        it("filters on player count", () => {
            const result = filterer.filterAndSort(testCollection, {
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
                const result = filterer.filterAndSort(largeCollection, {
                    playerCount: 5,
                    playtime: { minimum: 30, maximum: 80 }
                });
                expect(result).toHaveLength(100);
                expect(result).toMatchSnapshot();
            }
        });
    });

    describe("sorting", () => {
        it("sorts by rating by default", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const rankordering = [testGame2, testGame3, testGame1, testGame4];
            const result = filterer.filterAndSort(onOrdered);
            expect(result.map((r) => r.averagerating)).toEqual(rankordering.map((r) => r.averagerating));
        });

        it("can sort by alpabetic", () => {
            const onOrdered = [testGame2, testGame3, testGame1, testGame4];
            const nameOrdered = [testGame3, testGame1, testGame2, testGame4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "alphabetic" });
            expect(result.map((r) => r.name)).toEqual(nameOrdered.map((r) => r.name));
        });
        it("can sort by bggranking", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const rankordering = [testGame2, testGame3, testGame1, testGame4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "bggrating" });
            expect(result.map((r) => r.averagerating)).toEqual(rankordering.map((r) => r.averagerating));
        });
        it("can sort by new games", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const newOrdering = [testGame2, testGame1, testGame3, testGame4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "new" });
            expect(result.map((r) => r.yearPublished)).toEqual(newOrdering.map((r) => r.yearPublished));
        });

        it("can sort by old games", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const oldOrdering = [testGame4, testGame3, testGame1, testGame2];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "old" });
            expect(result.map((r) => r.yearPublished)).toEqual(oldOrdering.map((r) => r.yearPublished));
        });

        it("when sorting by new, it handles games without year as always being very old", () => {
            const wihtoutYear = Object.assign({}, testGame4, { yearPublished: undefined });
            const onOrdered = [wihtoutYear, testGame1, testGame2, testGame3];
            const oldOrdering = [testGame3, testGame1, testGame2, wihtoutYear];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "old" });
            expect(result.map((r) => r.yearPublished)).toEqual(oldOrdering.map((r) => r.yearPublished));
        });

        it("when sorting by old, it handles games without year as always being very new", () => {
            const wihtoutYear = Object.assign({}, testGame4, { yearPublished: undefined });
            const onOrdered = [testGame1, wihtoutYear, testGame2, testGame3];
            const newOrdering = [testGame2, testGame1, testGame3, wihtoutYear];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "new" });
            expect(result.map((r) => r.yearPublished)).toEqual(newOrdering.map((r) => r.yearPublished));
        });

        it("can sort by user rating", () => {
            const ratedGame1 = Object.assign({}, testGame1, { userRating: { cyndaq: 7 } });
            const ratedGame2 = Object.assign({}, testGame2, { userRating: { warium: 6 } });
            const onOrdered = [ratedGame2, ratedGame1, testGame3];
            const newOrdering = [ratedGame1, ratedGame2, testGame3];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "userrating" });
            expect(result.map((r) => r.userRating)).toEqual(newOrdering.map((r) => r.userRating));
        });

        it("can sort by multiple user rating", () => {
            const ratedGame1 = Object.assign({}, testGame1, { userRating: { cyndaq: 7, warium: null, nakul: 4 } });
            const ratedGame2 = Object.assign({}, testGame2, { userRating: { warium: 6, cyndaq: 4 } });
            const onOrdered = [ratedGame2, ratedGame1, testGame3];
            const newOrdering = [ratedGame1, ratedGame2, testGame3];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "userrating" });
            expect(result.map((r) => r.userRating)).toEqual(newOrdering.map((r) => r.userRating));
        });

        it("sorts games with NO ratings as lowest", () => {
            const ratedGame1 = Object.assign({}, testGame1, { userRating: {} });
            const ratedGame2 = Object.assign({}, testGame2, { userRating: { warium: 6, cyndaq: 4 } });
            const onOrdered = [ratedGame2, ratedGame1];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "userrating" });
            expect(result[1].name).toEqual(ratedGame1.name);
        });

        it("can sort by average weight , light", () => {
            const weightGame1: GameInfoPlus = Object.assign({}, testGame1, { weight: 3 });
            const weightGame2: GameInfoPlus = Object.assign({}, testGame2, { weight: 5 });
            const unWeighted: GameInfoPlus = Object.assign({}, testGame3, { weight: undefined });
            const onOrdered = [unWeighted, weightGame1, weightGame2];
            const result: GameInfoPlus[] = filterer.filterAndSort(onOrdered, { sortOption: "weight-light" });
            expect(result.map((r) => ("weight" in r) ? r.weight : undefined)).toEqual([3, 5, undefined]);

        });

        it("can sort by average weight , heavy", () => {
            const weightGame1: GameInfoPlus = Object.assign({}, testGame1, { weight: 3 });
            const weightGame2: GameInfoPlus = Object.assign({}, testGame2, { weight: 5 });
            const unWeighted: GameInfoPlus = Object.assign({}, testGame3, { weight: undefined });
            const onOrdered = [unWeighted, weightGame1, weightGame2];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "weight-heavy" });
            expect(result.map((r) => ("weight" in r) ? r.weight : undefined)).toEqual([5, 3, undefined]);
        });


        it("can sort by suggestedPlayers", () => {
            const suggestedNumberOfPlayers1: SuggestedNumberOfPlayersMap = {
                [3]: {
                    best: 100,
                    notRecommended: 200,
                    numberOfPlayers: 3,
                    recommended: 13
                },
                [Infinity]: {
                    best: 0,
                    notRecommended: 2,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };

            const suggestedNumberOfPlayers2: SuggestedNumberOfPlayersMap = {
                [3]: {
                    best: 100,
                    notRecommended: 3,
                    numberOfPlayers: 3,
                    recommended: 10
                },
                [Infinity]: {
                    best: 0,
                    notRecommended: 0,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };

            const suggestedNumberOfPlayers3: SuggestedNumberOfPlayersMap = {
                [1]: {
                    best: 2000,
                    notRecommended: 120,
                    numberOfPlayers: Infinity,
                    recommended: 3
                },
                [Infinity]: {
                    best: 0,
                    notRecommended: 120,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };
            const game1: GameInfoPlus = Object.assign({}, testGame1, { suggestedNumberOfPlayers: suggestedNumberOfPlayers1 });
            const game2: GameInfoPlus = Object.assign({}, testGame2, { suggestedNumberOfPlayers: suggestedNumberOfPlayers2 });
            const game3: GameInfoPlus = Object.assign({}, testGame3, { suggestedNumberOfPlayers: suggestedNumberOfPlayers3 });
            const game4: GameInfoPlus = Object.assign({}, testGame4);
            const onOrdered = [game1, game2, game3, game4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: { type: "suggestedPlayers", numberOfPlayers: 3 } });
            expect(result.map((r) => r.name)).toEqual([game2, game1, game3, game4].map((g) => g.name));
        });

        it("can sort by suggestedPlayers even if infinity", () => {
            const suggestedNumberOfPlayers1: SuggestedNumberOfPlayersMap = {
                [3]: {
                    best: 100,
                    notRecommended: 200,
                    numberOfPlayers: 3,
                    recommended: 13
                },
                [Infinity]: {
                    best: 0,
                    notRecommended: 2,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };

            const suggestedNumberOfPlayers2: SuggestedNumberOfPlayersMap = {
                [3]: {
                    best: 100,
                    notRecommended: 3,
                    numberOfPlayers: 3,
                    recommended: 10
                },
                [Infinity]: {
                    best: 100,
                    notRecommended: 0,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };

            const suggestedNumberOfPlayers3: SuggestedNumberOfPlayersMap = {
                [1]: {
                    best: 2,
                    notRecommended: 120,
                    numberOfPlayers: Infinity,
                    recommended: 3
                },
                [Infinity]: {
                    best: 2000,
                    notRecommended: 120,
                    numberOfPlayers: Infinity,
                    recommended: 3
                }
            };
            const game1: GameInfoPlus = Object.assign({}, testGame1, { suggestedNumberOfPlayers: suggestedNumberOfPlayers1 });
            const game2: GameInfoPlus = Object.assign({}, testGame2, { suggestedNumberOfPlayers: suggestedNumberOfPlayers2 });
            const game3: GameInfoPlus = Object.assign({}, testGame3, { suggestedNumberOfPlayers: suggestedNumberOfPlayers3 });
            const game4: GameInfoPlus = Object.assign({}, testGame4);
            const onOrdered = [game1, game2, game3, game4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: { type: "suggestedPlayers", numberOfPlayers: 1 } });
            expect(result.map((r) => r.name)).toEqual([game2, game1, game3, game4].map((g) => g.name));
        });

        it("can sort by multiple options", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: ["bggrating", "old", "alphabetic"] });
            const expected = [68448, 204650, 161970, 40692];
            expect(result.map((r) => r.id)).toEqual(expected);
        });

        it("When multiple and undefined, sorts by default value", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const rankordering = [testGame2, testGame3, testGame1, testGame4];
            const result = filterer.filterAndSort(onOrdered, { sortOption: [undefined] });
            expect(result.map((r) => r.averagerating)).toEqual(rankordering.map((r) => r.averagerating));
        });

        it("Can sort by played recently", () => {
            const onOrdered = [
                Object.assign({}, testGame1, { lastPlayed: new Date("2019-01-01") }),
                testGame3,
                Object.assign({}, testGame2, { lastPlayed: new Date("2018-01-01") }),
            ];
            const rankordering = [onOrdered[0], onOrdered[2], onOrdered[1]];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "playedRecently" });
            expect(result).toEqual(rankordering);
        });

        it("Can sort by played long ago", () => {
            const onOrdered = [
                Object.assign({}, testGame1, { lastPlayed: new Date("2019-01-01") }),
                testGame3,
                Object.assign({}, testGame2, { lastPlayed: new Date("2018-01-01") }),
            ];
            const rankordering = [onOrdered[1], onOrdered[2], onOrdered[0]];
            const result = filterer.filterAndSort(onOrdered, { sortOption: "playedLongAgo" });
            expect(result).toEqual(rankordering);
        });
    });
});
