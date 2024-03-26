export default class Todo {
    constructor(
        public name: string, 
        public category: string, 
        public description: string, 
        public DateAdded: Date = new Date(), 
        public id?: string) {}
}
