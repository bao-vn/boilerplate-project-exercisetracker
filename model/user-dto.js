class UserDto {
    constructor(username) {
        this.username = username;
        this.count = 0;
        this.log = [];
    }
}

module.exports = {
    UserDto
}