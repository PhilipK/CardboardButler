import { CollectionMerger } from "../../src/services/CollectionMerger";
import "@testing-library/jest-dom/extend-expect";
import { alchemists, alchemistsTheKing } from "./model/TestGames";

const testGame1 = alchemists();
const testGame2 = alchemistsTheKing();

describe("CollectionMerger", () => {

    const merger = new CollectionMerger();

    it("merges two collections without duplicates", () => {
        const collection1 = [testGame1, testGame2];
        const collection2 = [testGame2];
        const result = merger.getMergedCollection({
            "col1": collection1,
            "col2": collection2
        })
        expect(result).toHaveLength(2);
        expect(result[0].id).toEqual(testGame1.id);
        expect(result[1].id).toEqual(testGame2.id);
    });

    it("is immutable", () => {
        const collection1 = [testGame1, testGame2];
        const collection2 = [testGame2];
        const result = merger.getMergedCollection({
            "col1": collection1,
            "col2": collection2
        })
        expect(result).toHaveLength(2);
        expect(result[0].id).toEqual(testGame1.id);
        expect(result[1].id).toEqual(testGame2.id);
        expect(collection1[0].owners).toBeUndefined();
        expect(collection2[0].owners).toBeUndefined();
    });

    it("sets the owner on the games", () => {
        const collection1 = [testGame1, testGame2];
        const collection2 = [testGame2];
        const result = merger.getMergedCollection({
            "HasTwoGames": collection1,
            "HasOneGame": collection2
        })
        const firstOwners = result[0].owners;
        expect(firstOwners).toBeDefined();
        expect(result[0].id).toEqual(testGame1.id);
        if (firstOwners) {
            expect(firstOwners).toHaveLength(1);
            expect(firstOwners[0]).toBe("HasTwoGames");

        }

        const secondOwners = result[1].owners;
        expect(secondOwners).toBeDefined();
        if (secondOwners) {
            expect(secondOwners).toHaveLength(2);
            expect(secondOwners[0]).toBe("HasTwoGames");
            expect(secondOwners[1]).toBe("HasOneGame");

        }
    });

});

