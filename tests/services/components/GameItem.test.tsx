import * as React from "react";
import * as ReactDOM from "react-dom";
import GameListItem from "../../../src/components/GameListItem";
import { GameInfo } from "../../../src/models/GameInfo";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("GameItem react component", () => {

    const testItem: GameInfo = {
        name: "Alchemiests",
        imageUrl: "MyUrl",
        thumbnailUrl: "anotherurl",
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
});

