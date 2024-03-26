export default class User {
    constructor(
        public username: string,
        public email: string, 
        public password: string, 
        public DateAdded: Date = new Date(),
        public id?: string) {}
}
