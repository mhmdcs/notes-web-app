export interface User {
    username: string,
    email: string,
} // we will not store the password in our frontend User type we will work with, because the frontend client has NO business storing the password in any way or form, the frontend should only be concerned with displaying the user's username and email to the logged in user. 