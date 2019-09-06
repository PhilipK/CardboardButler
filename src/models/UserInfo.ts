interface ValidUser {
    isValid: true;
    username: string;
}

interface InvalidUser {
    isValid: false;
}

interface IsError {
    isValid: false;
    error: Error;
}

export type UserInfo = ValidUser | InvalidUser | IsError;

