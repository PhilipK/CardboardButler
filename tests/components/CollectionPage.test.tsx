
import * as React from "react";
import { render, fireEvent, waitForElement, getByTestId } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CollectionPage from "../../src/components/CollectionPage";


describe("Collection Page", () => {
    it("Renders without problems", () => {
        const { baseElement } = render(<CollectionPage />);
        expect(baseElement).toBeDefined();
    });

    it("shows a 'no games found' information when no games are given", () => {
        const { getByTestId } = render(<CollectionPage games={[]} />);
        getByTestId("nogames");
    });
});