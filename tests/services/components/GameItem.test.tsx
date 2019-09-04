import * as React from "react";
import GameListItem from "../../../src/components/GameListItem";
import { GameInfo } from "../../../src/models/GameInfo";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("GameItem react component", () => {

    const testItem: GameInfo = {
        id: 204650,
        name: "Alchemiests",
        imageUrl: "https://cf.geekdo-images.com/original/img/VKBFHqR2xm0EFGWfb1sPJZctMCs=/0x0/pic2241156.png",
        thumbnailUrl: "https://cf.geekdo-images.com/thumb/img/4VjOkEjTXNR4KQMjaOK7JibjPSw=/fit-in/200x150/pic2241156.png",
        yearPublished: 2014

    };

    it("is rendered given a gameinfo item", () => {
        const { getByTestId } = render(<GameListItem item={testItem} />);
        expect(getByTestId("GameName")).toBeDefined();
    });

    it("renders the game name", () => {
        const { getByTestId } = render(<GameListItem item={testItem} />);
        expect(getByTestId("GameName")).toHaveTextContent(testItem.name);
    });

    it("renders the game image", () => {
        const { getByTestId } = render(<GameListItem item={testItem} />);
        expect(getByTestId("GameImage")).toHaveAttribute("src",testItem.imageUrl);
    });
});

