interface ValidUser {
    isValid: true;
    username: string;
}

interface InvalidUser {
    isValid: false;
}

interface IsError {
    isValid: "unknown";
    error: Error | string;
}

/**
 * Information about a user.
 * This includes if the user exists/isvalid or if it is currently unknown since there was an error.
 */
export type UserInfo = ValidUser | InvalidUser | IsError;

