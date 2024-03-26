"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, email, password, DateAdded = new Date(), id) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.DateAdded = DateAdded;
        this.id = id;
    }
}
exports.default = User;
