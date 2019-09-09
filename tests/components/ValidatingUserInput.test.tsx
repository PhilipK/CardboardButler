
import * as React from "react";
import ValidatingUserInput from "../../src/components/ValidatingUserInput";
import { render, fireEvent, waitForElement, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("ValidatingUserInput", () => {
    const testName = "Warium";


    describe("it renders", () => {
        it("without props", () => {
            const { getByTestId, baseElement } = render(<ValidatingUserInput />);
            expect(baseElement).toBeDefined();
        });
    });

    var validUserMock = jest.fn((username) => {
        return new Promise<boolean>((resolver) => {
            setTimeout(() => resolver(true), 0);
        });
    });
    beforeEach(() => {
        jest.useFakeTimers();
        validUserMock = jest.fn((username) => {
            return new Promise<boolean>((resolver) => {
                setTimeout(() => resolver(true), 0);
            });
        });
    });
    afterEach(() => {
        jest.clearAllTimers();
    });


    describe("validation", () => {


        it("asks to validate input", () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            jest.advanceTimersByTime(300);
            expect(validUserMock.mock.calls.length).toBe(1);
            expect(validUserMock.mock.calls[0][0]).toBe(testName);
        });

        it("marks valid results as valid", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            jest.advanceTimersByTime(300);
            await waitForElement(
                () => getByTestId("Input0Loading"),
            );
            expect(() => getByTestId("Input0Loading")).toThrow();
            const validElement = getByTestId("Input0Valid");
            expect(validElement).toBeDefined();
        });
        it("doesnt ask twice", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.runAllTimers();
            fireEvent.change(getByTestId("Input0"), { target: { value: "Nakul" } });
            jest.runAllTimers();
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.runAllTimers();
            fireEvent.change(getByTestId("Input0"), { target: { value: "Cyndaq" } });
            jest.runAllTimers();
            expect(validUserMock.mock.calls.length).toBe(3);
            expect(validUserMock.mock.calls[0][0]).toBe("Warium");
            expect(validUserMock.mock.calls[1][0]).toBe("Nakul");
            expect(validUserMock.mock.calls[2][0]).toBe("Cyndaq");
        });

        it("lets the user finish typing before validating", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "W" } });
            jest.advanceTimersByTime(100);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Wa" } });
            jest.advanceTimersByTime(100);
            fireEvent.change(getByTestId("Input0"), { target: { value: "War" } });
            jest.advanceTimersByTime(100);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Wari" } });
            jest.advanceTimersByTime(100);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Wariu" } });
            jest.advanceTimersByTime(100);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.advanceTimersByTime(300);

            expect(validUserMock.mock.calls.length).toBe(1);
            expect(validUserMock.mock.calls[0][0]).toBe("Warium");;
        });

        it("doesnt validate when no validator given", async () => {
            const { getByTestId } = render(<ValidatingUserInput />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            jest.advanceTimersByTime(300);
            expect(() => getByTestId("Input0Loading")).toThrow();
        });

        it("doesnt load invalid names again", async () => {
            const invalidUserMock = jest.fn((username) => {
                return new Promise<boolean>((resolver) => {
                    setTimeout(() => resolver(false), 0);
                });
            });
            const { getByTestId } = render(<ValidatingUserInput userValidator={invalidUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.runAllTimers();
            fireEvent.change(getByTestId("Input0"), { target: { value: "Nakul" } });
            jest.runAllTimers();
            fireEvent.change(getByTestId("Input0"), { target: { value: "Warium" } });
            jest.runAllTimers();
            expect(invalidUserMock.mock.calls.length).toBe(2);
            expect(invalidUserMock.mock.calls[0][0]).toBe("Warium");
            expect(invalidUserMock.mock.calls[1][0]).toBe("Nakul");
        });
    });

    describe("loading", () => {

        it("shows loading while loading", async () => {

            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            jest.advanceTimersByTime(300);
            const loadingElement = await waitForElement(
                () => getByTestId("Input0Loading"),
            );
            expect(loadingElement).toBeDefined();
        });

        it("removes loading after done validating", async () => {
            const { getByTestId } = render(<ValidatingUserInput userValidator={validUserMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: testName } });
            jest.advanceTimersByTime(300);
            await waitForElement(
                () => getByTestId("Input0Loading"),
            );
            expect(() => getByTestId("Input0Loading")).toThrow();
        });
    });


});

