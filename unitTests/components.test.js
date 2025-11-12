/**
 * @vitest-environment jsdom
 */

import { beforeEach, test, expect, vi } from "vitest";
import { loadAndApplyTheme } from "./testFunctions/componentsFunctions";

// ===== Firestore retrieval =====
const getDoc = vi.fn();
const doc = vi.fn();

vi.mock("firebase/firestore", () => ({
  getDoc: (...args) => getDoc(...args),
  doc: (...args) => doc(...args),
}));

global.db = {};
// ===== ================== ======

// test firebase handler
let testUserUID, testUserRef, testUserSnap, testThemeName
beforeEach(() => {
    // clear docs between tests
    document.body.className = "";
    vi.clearAllMocks();

    // handle local storage get and set
    global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
    };

    // test data
    testUserUID = "testUID";
    testUserRef = {};
    testUserSnap = {
        exists: () => true,
        data: () => ({ theme: "themeSunset"}),
    };
    testThemeName = "themeSunset";
})

// ============ Change Theme ============
// 1. User exists /UID retrieved
test("User exists /UID retrieved", async () => {
    // test UID and firebase state
    const testUserUID = "testUID";
    const testUserSnap = {
        exists: () => true,
        data: () => ({theme: "themeSunset"}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();

    expect(getDoc).toHaveBeenCalledOnce();
    expect(getDoc).toHaveBeenCalledWith(expect.any(Object));
    expect(document.body.className).toBe("themeSunset");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "themeSunset");
})
// 2. User doesn't exists /UID not retrieved
test("User doesn't exists /UID not retrieved", async () => {
    // test UID and firebase state
    const testUserUID = "";
    const testUserSnap = {
        exists: () => false,
        data: () => ({}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();

    // doesn't call firestore
    expect(getDoc).not.toHaveBeenCalled();
    expect(doc).not.toHaveBeenCalled();
    // don't change theme
    expect(document.body.className).toBe("");
    // nothing set in local storage
    expect(localStorage.setItem).not.toHaveBeenCalled();
})
// 3. Users theme can be retrieved
test("Users theme can be retrieved", async () => {
    // test UID and firebase state
    const testUserUID = "testUID";
    const testUserSnap = {
        exists: () => true,
        data: () => ({theme: ":root"}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();

    // firestore called correctly
    expect(doc).toHaveBeenCalledWith(db, "users", testUserUID);
    expect(getDoc).toHaveBeenCalledWith(expect.any(Object));
    // Theme applied
    expect(document.body.className).toBe(":root");
    // store theme in local storage
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", ":root");
})
// 4. Users theme can't be retrieved
test("Users theme can't be retrieved", async () => {
    // test UID and firebase state
    const testUserUID = "testUID";
    const testUserSnap = {
        exists: () => true,
        data: () => ({theme: ":root"}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();
    
    // firestore called correctly
    expect(doc).toHaveBeenCalledWith(db, "users", testUserUID);
    expect(getDoc).toHaveBeenCalledWith(expect.any(Object));
    // Theme not applied so revert to default
    expect(document.body.className).toBe(":root");
    // default theme stored in local storage
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", ":root");    
})
// 5. test apply theme (:root)
test("test apply themes", async () => {
    // test UID and firebase state
    const testUserUID = "testUID";
    const testUserSnap = {
        exists: () => true,
        data: () => ({theme: ":root"}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();

    // firestore called correctly
    expect(doc).toHaveBeenCalledWith(db, "users", testUserUID);
    expect(getDoc).toHaveBeenCalledWith(expect.any(Object));
    // :root theme applied
    expect(document.body.className).toBe(":root");
    // store them in local storage
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", ":root");
})
// 6. test local storage set theme
test("test local storage set theme", async () => {
    // test UID and firebase state
    const testUserUID = "testUID";
    const testUserSnap = {
        exists: () => true,
        data: () => ({theme: ":root"}),
    };

    // local storage returns UID
    localStorage.getItem = vi.fn().mockReturnValue(testUserUID);
    localStorage.setItem = vi.fn();

    getDoc.mockResolvedValueOnce(testUserSnap);
    doc.mockReturnValueOnce({});

    await loadAndApplyTheme();

    // firestore called correctly
    expect(doc).toHaveBeenCalledWith(db, "users", testUserUID);
    expect(getDoc).toHaveBeenCalledWith(expect.any(Object));
    // :root theme applied
    expect(document.body.className).toBe(":root");
    // store them in local storage
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", ":root");
})
// =====================================


