// --- Reg-Ex tests ---

import { createUserWithEmailAndPassword } from "firebase/auth";

// login email RegEX test
export function validateLoginEmail(email) {
  const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegEx.test(email);
}
// login password RegEX test
export function validateLoginPassword(password) {
    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegEx.test(password); 
}
// create email RegEx test
export function validateCreateEmail(email) {
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegEx.test(email);
}
// create password Regex test
export function validateCreatePassword(password) {
    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegEx.test(password);
}

// sign in function
export async function testLogin(auth, email, password, emailInput, passwordInput) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userUID", user.uid);
        window.location.href = "dashboard.html";
    } 
    catch {
        alert("Account Not Found");
    }
    emailInput.value = "";
    passwordInput.value = "";
}
// create account function
export async function testCreate(auth, email, password, emailCreateInput, passwordCreateInput, passwordConfirmInput){
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        window.location.href = "index.html";
    }
    catch {
        alert("Error Creating Account");
    }
    emailCreateInput.value = "";
    passwordCreateInput.value = "";
    passwordConfirmInput.value = "";
}