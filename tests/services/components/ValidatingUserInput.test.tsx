
import * as React from "react";
import ValidatingUserInput from "../../../src/components/ValidatingUserInput";
import { render, fireEvent, waitForElement, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("GameItem react component", () => {
    const testName = "Warium";


    describe("it renders", () => {
        it("without props", () => {
            const { getByTestId, baseElement } = render(<ValidatingUserInput />);
            expect(baseElement).toBeDefined();
        });
    });

    var validUserMock = jest.fn((username) => {
        return new Promise<boolean>((resolver) => {
            resolver(true);
        });
    });
    beforeEach(() => {
        validUserMock = jest.fn((username) => {
            return new Promise<boolean>((resolver) => {
                setTimeout(() => resolver(true), 1);
            });
        });
    })

    describe("validation", () => {

        it("Asks to validate input", () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            expect(validUserMock.mock.calls.length).toBe(1);
            expect(validUserMock.mock.calls[0][0]).toBe(testName);
        });

        it("Valid results are marked as valid", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            const validElement = await waitForElement(
                () => getByTestId("Input0Valid"),
            );
            expect(validElement).toBeDefined();
        });
        it("doesnt ask twice", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            await waitForElement(
                () => getByTestId("Input0Valid"),
            );
            fireEvent.change(getByTestId("Input0"), { target: { value: "Nakul" } });
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            fireEvent.change(getByTestId("Input0"), { target: { value: "Cyndaq" } });
            await waitForElement(
                () => getByTestId("Input0Valid"),
            );
            expect(validUserMock.mock.calls.length).toBe(3);
            expect(validUserMock.mock.calls[0][0]).toBe("Warium");
            expect(validUserMock.mock.calls[1][0]).toBe("Nakul");
            expect(validUserMock.mock.calls[2][0]).toBe("Cyndaq");
        });
    });

    describe("loading", () => {

        it("Shows loading while loading", async () => {

            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            const loadingElement = await waitForElement(
                () => getByTestId("Input0Loading"),
            );
            expect(loadingElement).toBeDefined();
        });

        it("after loading the loading is removed", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            await waitForElementToBeRemoved(() => getByTestId("Input0Loading"));
        });
    });


});

