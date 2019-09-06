interface ValidUser {
    isValid: true;
    username: string;
}

interface InvalidUser {
    isValid: false;
}

interface IsError {
    isValid: "unknown";
    error: Error;
}

export type UserInfo = ValidUser | InvalidUser | IsError;

