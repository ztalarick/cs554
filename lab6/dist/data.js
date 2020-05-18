var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoCollections = require("./mongoCollections");
const database = mongoCollections.tasks;
const ObjectID = require('mongodb').ObjectID;
function create(title, description, hoursEstimated, completed) {
    return __awaiter(this, void 0, void 0, function* () {
        //check correct types and input given.
        if (typeof title != "string" || typeof description != "string" || typeof hoursEstimated != "number" || typeof completed != "boolean") {
            return Promise.reject("Error, incorrect input");
        }
        let col = yield database();
        let newTask = {
            _id: new ObjectID(),
            title: title,
            description: description,
            hoursEstimated: hoursEstimated,
            completed: completed,
            comments: [] //to be utilized later
        };
        const insertInfo = yield col.insertOne(newTask);
        if (insertInfo.insertedCount === 0) {
            return Promise.reject("Could not create task.");
        }
        return newTask;
    });
}
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        let col = yield database();
        let cur = yield col.find();
        return cur.toArray();
    });
}
function get(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id === undefined) {
            return Promise.reject("ID is undefined.");
        }
        const col = yield database();
        var temp = yield col.findOne({ _id: ObjectID(id) });
        if (temp === null)
            return Promise.reject("No task found with that ID.");
        return temp;
    });
}
function updatePatch(id, newTask) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id === undefined || typeof newTask != "object") {
            return Promise.reject("Error, incorrect input");
        }
        try {
            yield get(id);
        }
        catch (e) {
            console.log("Error: " + e);
            return;
        }
        const currentTask = yield get(id);
        let newObject = {
            title: currentTask.title,
            description: currentTask.description,
            hoursEstimated: currentTask.hoursEstimated,
            completed: currentTask.completed,
            comments: currentTask.comments,
        };
        if (newTask.hasOwnProperty("title") && typeof newTask.title == "string") {
            newObject.title = newTask.title;
        }
        if (newTask.hasOwnProperty("description") && typeof newTask.description == "string") {
            newObject.description = newTask.description;
        }
        if (newTask.hasOwnProperty("hoursEstimated") && typeof newTask.hoursEstimated == "number") {
            newObject.hoursEstimated = newTask.hoursEstimated;
        }
        if (newTask.hasOwnProperty("completed") && typeof newTask.completed == "boolean") {
            newObject.completed = newTask.completed;
        }
        const col = yield database();
        console.log("I get here: " + newObject);
        const updateInfo = yield col.updateOne({ _id: ObjectID(id) }, { $set: {
                title: newObject.title,
                description: newObject.description,
                hoursEstimated: newObject.hoursEstimated,
                completed: newObject.completed,
            } });
        if (updateInfo.modifiedCount === 0) {
            return Promise.reject("Could not update task.");
        }
        try {
            yield get(id);
        }
        catch (e) {
            console.log("Error: " + e);
            return;
        }
        return yield get(id);
    });
}
function update(id, title, description, hoursEstimated, completed) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id === undefined || typeof title != "string" || typeof description != "string" || typeof hoursEstimated != "number" || typeof completed != "boolean") {
            return Promise.reject("Error, incorrect input");
        }
        const col = yield database();
        const updateInfo = yield col.updateOne({ _id: ObjectID(id) }, {
            $set: {
                title: title,
                description: description,
                hoursEstimated: hoursEstimated,
                completed: completed,
            }
        });
        if (updateInfo.modifiedCount === 0) {
            return Promise.reject("Could not update task.");
        }
        try {
            yield get(id);
        }
        catch (e) {
            console.log("Error: " + e);
            return;
        }
        return yield get(id);
    });
}
function addComment(id, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id === undefined || typeof comment != "object") {
            return Promise.reject("Error, incorrect input.");
        }
        if (typeof comment.name != "string" || typeof comment.comment != "string") {
            return Promise.reject("Error, incorrect format for the comment object.");
        }
        comment.id = new ObjectID();
        const col = yield database();
        const updateInfo = yield col.updateOne({ _id: ObjectID(id) }, { $push: { "comments": comment } });
        if (updateInfo.modifiedCount === 0) {
            return Promise.reject("Could not add comment.");
        }
        return yield get(id);
    });
}
function deleteComment(taskId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (taskId === undefined || commentId === undefined) {
            return Promise.reject("Error, incorrect input.");
        }
        const col = yield database();
        //const updateInfo = await col.updateOne({_id: ObjectID(taskId)}, {$pull: {"comments.id": commentId} });
        let fix;
        try {
            fix = yield get(taskId);
        }
        catch (e) {
            console.log("Could not find task with ID: " + taskId + ". " + e);
            return yield get(taskId);
        }
        if (fix.comments.length == 1) { //for some reason mongo is dumb and wont update if there is only one comment in the array so here you go
            const fixInfo = yield col.updateOne({ _id: ObjectID(taskId) }, { $set: { comments: [] } });
            if (fixInfo.modifiedCount === 0) {
                return Promise.reject("Could not delete comment.");
            }
            return;
        }
        const updateInfo = col.updateMany({}, { $pull: { comments: { id: commentId } } }, { multi: true });
        if (updateInfo.modifiedCount === 0) {
            return Promise.reject("Could not delete comment.");
        }
        try {
            return yield get(taskId);
        }
        catch (e) {
            console.log("Could not find task with ID: " + taskId + ". " + e);
            return;
        }
        return yield get(taskId);
    });
}
module.exports = {
    create: create,
    getAll: getAll,
    get: get,
    update: update,
    addComment: addComment,
    deleteComment: deleteComment,
    updatePatch: updatePatch
};
