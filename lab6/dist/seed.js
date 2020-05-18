var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoConnection = require("./mongoConnection");
const tasks = require("./data");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield mongoConnection();
        yield db.dropDatabase(); //RESET DATABASE FOR TESTING ONLY
        let task1 = yield tasks.create("Make lab", "Make the first lab for CS-554. Maybe talk about dinosaurs in it, or something", 1, false);
        let task1_id = task1._id;
        let task2 = yield tasks.create("Clean Room", "Make my room less dirty.", 3, false);
        let task3 = yield tasks.create("Do CS554 HW", "Do lab 1 for CS554.", 4, false);
        console.log("All Tasks: " + (yield tasks.getAll()));
        console.log("Task 1: ");
        console.log(yield tasks.get(task1_id));
        console.log("Test update: ");
        //let updated = await tasks.update(task1_id, "Cook Dinner", "cook for the fam", 2, true);
        let newObj = {
            description: "jake is chillin"
        };
        console.log(typeof newObj);
        let updated = yield tasks.updatePatch(task1_id, newObj);
        console.log(updated);
        console.log(yield tasks.getAll());
        console.log(yield tasks.get(task1_id));
        try { // bad ID given should fail
            let test_update = yield tasks.update(12345, "hello", "", 5, true);
        }
        catch (e) {
            console.log(" ");
            console.log("failed successfully");
            console.log(e);
        }
        console.log("Test add comment: ");
        let comment1 = {
            name: "Dinosaurs",
            comment: "Dinosours would be sick to talk about for real."
        };
        let comment2 = {
            name: "T-rex",
            comment: "You need to talk about tyranasouruses they are cool af."
        };
        yield tasks.addComment(task1_id, comment1);
        yield tasks.addComment(task1_id, comment2);
        task1 = yield tasks.get(task1_id);
        console.log(task1);
        console.log(" ");
        console.log("Testing Delete Comment: ");
        let comment1_id = task1.comments[0].id;
        console.log(comment1_id);
        try {
            yield tasks.deleteComment(task1_id, comment1_id);
        }
        catch (e) {
            console.log(" ");
            console.log(e);
            return;
        }
        console.log(yield tasks.get(task1_id));
        console.log("TESTING DELETECOMMENT WITH ONLY ONE ELEMENT");
        //TESTING deleteComment with only One comment
        // let comment2_id = task1.comments[0].id;
        // try {
        //   await tasks.deleteComment(task1_id, comment1_id);
        // } catch (e) {
        //   console.log(" ");
        //   console.log(e);
        //   return;
        // }
        // console.log(await tasks.get(task1_id));
        return;
    });
}
main();
