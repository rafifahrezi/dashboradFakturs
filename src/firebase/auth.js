import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";


export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return doCreateUserWithEmailAndPassword(auth, email, password);

}

export const doSignInWithEmailAndPassword = (email, password) => {
    return doSignInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // result.user

    return result
};

export const doSignOut = () => {
    return auth.signOut();
};

// export const doPasswordReset = (email) => {
//     return sendPasswordResetEmail(auth, email);
// };

// export const doPasswordChange = (password) => {
//     return updatePassword(auth.currentUser, password);
// };

// export const doSendEmailVerification = () => {
//     return sendEmailVerification(auth.currentUser, {
//         url: `${window.location.origin}/home`,
//     });
// };



