export interface Note { // here we define the DTO for the json Note object we're gonna receive from the backend
    _id: string, 
    title: string,
    text?: string,
    createdAt: string,
    updatedAt: string,
}