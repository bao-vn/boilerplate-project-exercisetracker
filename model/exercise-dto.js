class ExerciseDto {
    constructor(description, duration, date) {
        this.description = description;
        this.duration = duration;
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }
}

module.exports = {
    ExerciseDto
}