/**
 * @vitest-environment jsdom
 */

import { beforeEach, test, expect, vi } from "vitest";
import { validateLoginEmail, validateLoginPassword, validateCreateEmail, validateCreatePassword } from "./testFunctions/authFunctions";
import { testLogin, testCreate } from "./testFunctions/authFunctions";

// --- Reg-Ex tests ---
// login email RegEX test
test("1. valid email passes", () => {
    expect(validateLoginEmail("test@example.com")).toBe(true);
});
test("2. does not contain 1+ characters before @", () => {
    expect(validateLoginEmail("@gmail.com")).toBe(false);
});
test("3. does not contain @", () => {
    expect(validateLoginEmail("testgmail.com")).toBe(false);
});
test("4. no characters after @", () => {
    expect(validateLoginEmail("test@.com")).toBe(false);
});
test("5. does not contains a .", () => {
    expect(validateLoginEmail("test@gmailcom")).toBe(false);
});
test("6. no characters after .", () => {
    expect(validateLoginEmail("test@gmail.")).toBe(false);
});
// login password RegEx test
test("1. valid password passes", () => {
    expect(validateLoginPassword("TestTest123!")).toBe(true);
});
test("2. no lowercase letters", () => {
    expect(validateLoginPassword("TESTTEST123!")).toBe(false);
});
test("3. no uppercase letters", () => {
    expect(validateLoginPassword("testtest123!")).toBe(false);
});
test("4. no numbers", () => {
    expect(validateLoginPassword("TestTest!")).toBe(false);
});
test("5. no valid special char", () => {
    expect(validateLoginPassword("TestTest123")).toBe(false);
});
test("6. not 8 characters long", () => {
    expect(validateLoginPassword("Test23!")).toBe(false);
});
// create email RegEx test
test("1. valid email passes", () => {
    expect(validateCreateEmail("test@example.com")).toBe(true);
});
test("2. does not contain 1+ characters before @", () => {
    expect(validateCreateEmail("@gmail.com")).toBe(false);
});
test("3. does not contain @", () => {
    expect(validateCreateEmail("testgmail.com")).toBe(false);
});
test("4. no characters after @", () => {
    expect(validateCreateEmail("test@.com")).toBe(false);
});
test("5. does not contains a .", () => {
    expect(validateCreateEmail("test@gmailcom")).toBe(false);
});
test("6. no characters after .", () => {
    expect(validateCreateEmail("test@gmail.")).toBe(false);
});
// create password RegEx test
test("1. valid password passes", () => {
    expect(validateCreatePassword("TestTest123!")).toBe(true);
});
test("2. no lowercase letters", () => {
    expect(validateCreatePassword("TESTTEST123!")).toBe(false);
});
test("3. no uppercase letters", () => {
    expect(validateCreatePassword("testtest123!")).toBe(false);
});
test("4. no numbers", () => {
    expect(validateCreatePassword("TestTest!")).toBe(false);
});
test("5. no valid special char", () => {
    expect(validateCreatePassword("TestTest123")).toBe(false);
});
test("6. not 8 characters long", () => {
    expect(validateCreatePassword("Test23!")).toBe(false);
});


// sign-in function
// Handle untestable parts
let mockEmailInput, mockPasswordInput;
beforeEach(() => {
    // test inputs
    mockEmailInput = { value: "test@example.com" };
    mockPasswordInput = { value: "123456" };

    // handle local strorage
    global.localStorage = {
    setItem: vi.fn(),
    };

    // handle window.locate
    Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
    });

    // handle alert
    global.alert = vi.fn();
});

// Test Successful Login
test("successful login stores data and redirects", async () => {
    // create a fake user and fake firebase sign in funtion
    const mockUser = { uid: "123" };
    const mockSignInWithEmailAndPassword = vi.fn().mockResolvedValue({ user: mockUser });

    // replacement function to test sign in and run test fucntion
    global.signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
    await testLogin({}, "test@example.com", "123456", mockEmailInput, mockPasswordInput);

    expect(localStorage.setItem).toHaveBeenCalledWith("loggedIn", "true");
    expect(localStorage.setItem).toHaveBeenCalledWith("userUID", "123");
    expect(window.location.href).toBe("dashboard.html");
    expect(mockEmailInput.value).toBe("");
    expect(mockPasswordInput.value).toBe("");
    });

// Test Failed Login
test("failed login alerts and clears inputs", async () => {
    // run fake firebase function
    const mockSignInWithEmailAndPassword = vi.fn().mockRejectedValue(new Error("Login failed"));
    global.signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
    await testLogin({}, "test@example.com", "wrongpass", mockEmailInput, mockPasswordInput);

    expect(alert).toHaveBeenCalledWith("Account Not Found");
    expect(mockEmailInput.value).toBe("");
    expect(mockPasswordInput.value).toBe("");
});

// create account function
// handle untestable parts
let mockEmailCreateInput, mockPasswordCreateInput, mockPasswordConfirmInput;
beforeEach(() => {
    // test inputs
    mockEmailCreateInput = { value: "test@gmail.com"};
    mockPasswordCreateInput = {value: "TestPass123!"};
    mockPasswordConfirmInput = {value: "TestPass123!"};

    // handle window.locate
    Object.defineProperty(window, "location", {
    value: { href: "index.html" },
    writable: true,
    });

    // handle alert
    global.alert = vi.fn();
})

// Test Successful Create
test("successful account creation", async () => {
    // create test user and fake firebase create account
    const testUser = {uid: "123"};
    const testcreateUserWithEmailAndPassword = vi.fn().mockResolvedValue({ user: testUser });

    // replacement function to test create and run test function
    global.createUserWithEmailAndPassword = testcreateUserWithEmailAndPassword;
    await testCreate({}, "test@gmail.com", "123456", mockEmailCreateInput, mockPasswordCreateInput, mockPasswordConfirmInput);

    expect(window.location.href).toBe("index.html");
    expect(mockEmailCreateInput.value).toBe("");
    expect(mockPasswordCreateInput.value).toBe("");
})

// Test Falied Create
test("failed account creation", async () => {
    // fake firebase create account
    const testUser = {uid: "123"};
    const testcreateUserWithEmailAndPassword = vi.fn().mockResolvedValue({ user: testUser });
    // replacement function to test create and run test function
    global.createUserWithEmailAndPassword = testcreateUserWithEmailAndPassword;
    await testCreate({}, "test@gmail.com", "123456", mockEmailCreateInput, mockPasswordCreateInput, mockPasswordConfirmInput);

    expect(alert).toHaveBeenCalledWith("Error Creating Account");
    expect(mockEmailCreateInput.value).toBe("");
    expect(mockPasswordCreateInput.value).toBe("");
})

