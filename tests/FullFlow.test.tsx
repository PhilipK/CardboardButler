
import * as React from "react";
import App from "../src/components/App";
import { render, fireEvent, waitForElement, waitForElementToBeRemoved, waitForDomChange } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import BggGameService from "../src/services/BggGameService";
import * as fetchMock from "fetch-mock";
import { getHugeCollection } from "./services/BggGameService.test";
import { GameInfo } from "../src/models/GameInfo";
import { UserInfo } from "../src/models/UserInfo";


describe("Full flow", () => {
    const fetch = fetchMock.sandbox();

    afterEach(fetch.restore);

    const service = new BggGameService(fetch);

    describe("Main App", () => {
        it("Renders without errors", () => {
            const { baseElement } = render(<App bggServce={service} />);
            expect(baseElement).toBeDefined();
        });

        it("only shows the WelcomePage when no names are selected yet", () => {
            const { getByTestId } = render(<App bggServce={service} />);
            expect(getByTestId("WelcomePage")).toBeDefined();
            expect(() => getByTestId("CollectionPage")).toThrow();
        });

        it("Typing a name and clicking go will load collection page", async () => {
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
            jest.advanceTimersByTime(300);
            await waitForElement(
                () => getByTestId("Input0Loading"),
            );
            fireEvent.click(getByTestId("UseNames"));
            waitForElement(() => getByTestId("CollectionPage"));
            waitForElementToBeRemoved(() => getByTestId("WelcomePage"));
        });

    });
});

