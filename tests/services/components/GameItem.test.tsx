
import * as React from "react";
import GameListItem from "../../../src/components/GameListItem";
import { GameInfo } from "../../../src/models/GameInfo";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { alchemists } from "../model/TestGames";
import DescriptionGenerator from "../../../src/services/GameDescriptionGenerator";

describe("GameItem react component", () => {

    const testItem: GameInfo = alchemists;

    describe("it renders", () => {
        it(" a gameinfo item", () => {
            const { getByTestId } = render(<GameListItem item={testItem} />);
            expect(getByTestId("GameName")).toBeDefined();
        });

        it("name", () => {
            const { getByTestId } = render(<GameListItem item={testItem} />);
            expect(getByTestId("GameName")).toHaveTextContent(testItem.name);
        });

        it("image", () => {
            const { getByTestId } = render(<GameListItem item={testItem} />);
            expect(getByTestId("GameImage")).toHaveAttribute("src", testItem.imageUrl);
        });

        it("description", () => {
            const descriptionGenerator = new DescriptionGenerator();
            const expected = descriptionGenerator.generateDescription(testItem);
            const { getByTestId } = render(<GameListItem item={testItem} />);
            expect(getByTestId("GameDescription")).toHaveTextContent(expected);
        });

        it("year published", () => {
            const { getByTestId } = render(<GameListItem item={testItem} />);
            expect(getByTestId("GameYear")).toHaveTextContent(testItem.yearPublished + "");
        });
    });
});

