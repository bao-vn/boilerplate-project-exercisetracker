const errorData = (err, data) => {
    if (err) {
        return next(err);
    }

    if (!data) {
        console.log("Missing `done()` argument");
        return next({ message: "Missing callback argument" });
    }

    return data;
}

module.exports = {
    errorData
}