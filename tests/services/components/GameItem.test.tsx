import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import GameListItem from "../../../src/components/GameListItem";
import { GameInfo } from "../../../src/models/GameInfo";

describe("GameItem react component", () => {

    const testItem: GameInfo = {
        name: "Alchemiests",
        imageUrl: "MyUrl",
        thumbnailUrl: "anotherurl",
        yearPublished: 2014

    };

    it("is rendered given a gameinfo item", () => {
        // Render GameListItem in the document
        const appElement = TestUtils.renderIntoDocument(
            <GameListItem item={testItem} />
        );

        const appNode = ReactDOM.findDOMNode(appElement as GameListItem);
        // Verify text content
        expect(appNode).toBeDefined();
    });


    it("renders the game name", () => {
        // Render GameListItem in the document
        const appElement = TestUtils.renderIntoDocument(
            <GameListItem item={testItem} />
        );

        const appNode = ReactDOM.findDOMNode(appElement as GameListItem);
        // Verify text content
        expect(appNode.textContent).toContain(testItem.name);
    });
});

