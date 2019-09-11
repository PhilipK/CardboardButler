
import * as React from "react";
import App from "../src/components/App";
import { render, fireEvent, waitForElement, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import BggGameService from "../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { getHugeCollection } from "./services/BggGameService.test";


describe("Full flow", () => {
    const fetch = fetchMock.sandbox();

    afterEach(fetch.restore);

    const service = new BggGameService(fetch);

    describe("Main App", () => {
        it("Renders without errors", () => {
            const { baseElement } = render(<App bggServce={service} />);
            expect(baseElement).toBeDefined();
        });

        it("only shows the frontpage when no names are selected yet", () => {
            const { getByTestId } = render(<App bggServce={service} />);
            expect(getByTestId("FrontPage")).toBeDefined();
            expect(() => getByTestId("CollectionPage")).toThrow();
        });

        it("Typing a name and clicking go will load collection page", () => {
            jest.useFakeTimers();
            service.getUserInfo = jest.fn((username) => (new Promise((resolver) => resolver({
                isValid: true,
                username: username
            }))));
            service.getUserCollection = jest.fn((username) => (new Promise((resolver) => resolver(
                getHugeCollection()
            ))));
            const { getByTestId } = render(<App bggServce={service} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.runAllTimers();
            fireEvent.click(getByTestId("UseNames"));
            jest.runAllTimers();
            waitForElement(() => getByTestId("CollectionPage"));
            waitForElementToBeRemoved(() => getByTestId("FrontPage"));
        });
    });
});

