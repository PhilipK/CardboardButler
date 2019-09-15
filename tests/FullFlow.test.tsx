
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

    describe("Routing", () => {
        it("Can be initialized with usernames", async () => {
            window.location.hash = "usernames=Cyndaq,Warium";
            jest.useFakeTimers();
            service.getUserInfo = jest.fn((username) => (new Promise((resolver) => resolver({
                isValid: true,
                username: username
            }))));
            const getColMock = jest.fn((username) => (new Promise<GameInfo[]>((resolver) => resolver(
                getHugeCollection()
            ))));
            service.getUserCollection = getColMock;
            render(<App bggServce={service} />);
            expect(getColMock.mock.calls.length).toBe(2);
            expect(getColMock.mock.calls[0][0]).toBe("Cyndaq");
            expect(getColMock.mock.calls[1][0]).toBe("Warium");
        });


        it("Changes when routing changes", async () => {
            window.location.hash = "usernames=Cyndaq";
            jest.useFakeTimers();
            service.getUserInfo = jest.fn((username) => (new Promise((resolver) => resolver({
                isValid: true,
                username: username
            }))));
            const getColMock = jest.fn((username) => (new Promise<GameInfo[]>((resolver) => resolver(
                getHugeCollection()
            ))));
            service.getUserCollection = getColMock;
            render(<App bggServce={service} />);
            window.location.hash = "usernames=Cyndaq,Warium,Nakul";
            getColMock.mockReset();
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            expect(getColMock.mock.calls.length).toBe(3);
            expect(getColMock.mock.calls[2][0]).toBe("Nakul");
        });

        it("Goes to frontpage on no hash change", async () => {
            window.location.hash = "usernames=Cyndaq";
            jest.useFakeTimers();
            service.getUserInfo = jest.fn((username) => (new Promise((resolver) => resolver({
                isValid: true,
                username: username
            }))));
            const getColMock = jest.fn((username) => (new Promise<GameInfo[]>((resolver) => resolver(
                getHugeCollection()
            ))));
            service.getUserCollection = getColMock;
            const { getByText, getByTestId } = render(<App bggServce={service} />);
            window.location.hash = "";
            getColMock.mockReset();
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            expect(() => getByText("Fetching games")).toThrow();
            getByTestId("WelcomePage");

        });
    });
});

