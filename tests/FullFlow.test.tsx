
import * as React from "react";
import App from "../src/components/App";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import BggGameService from "../src/services/BggGameService";
import * as fetchMock from "fetch-mock";

describe("Full flow", () => {
    const fetch = fetchMock.sandbox();

    afterEach(fetch.restore);

    const service = new BggGameService(fetch);

    describe("Main App", () => {
        it("Renders without errors", () => {
            const { baseElement } = render(<App bggServce={service} />);
            expect(baseElement).toBeDefined();
        });
    });
});

