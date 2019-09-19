
import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import CollectionPage from "../../src/components/CollectionPage";
import { GameInfo } from "../../src/models/GameInfo";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import { getLargeCollection } from "../services/TestHelpers";



describe("Collection Page", () => {
    it("Renders without problems", () => {
        const { baseElement } = render(<CollectionPage />);
        expect(baseElement).toBeDefined();
    });

    it("shows a 'no games found' information when no games are given", () => {
        const { getByTestId } = render(<CollectionPage games={[]} />);
        getByTestId("nogames");
    });

    it("changes shown collection when picking from filterbar", async () => {
        const games = await getLargeCollection();
        const fakeName = "FakeGames";
        const fakeGame: GameInfo = {
            name: fakeName,
            averagerating: 0,
            families: [],
            id: 0,
            imageUrl: "Url",
            thumbnailUrl: "Url",
            minPlayers: 11
        };
        const gamesWithFake = [...games, fakeGame];
        const { getByTestId, getByText } = render(<CollectionPage games={gamesWithFake} />);
        const element = await waitForElement(() => getByText(fakeName));
        const playerCountDropdown = getByTestId("PlayercountDropdown");
        fireEvent.click(playerCountDropdown);
        const playerCountOptions = playerCountDropdown.querySelectorAll(".item");
        fireEvent.click(playerCountOptions[1]);
        expect(() => getByText(fakeName)).toThrow();
    });
});