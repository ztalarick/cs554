const mongoConnection = require("./mongoConnection");
const tasks = require("./data");

async function main(){
  const db = await mongoConnection();
  await db.dropDatabase(); //RESET DATABASE FOR TESTING ONLY

  let task1 = await tasks.create("Make lab", "Make the first lab for CS-554. Maybe talk about dinosaurs in it, or something", 1, false);
  let task1_id = task1._id;
  let task2 = await tasks.create("Clean Room", "Make my room less dirty.", 3, false);
  let task3 = await tasks.create("Do CS554 HW", "Do lab 1 for CS554.", 4, false);


  console.log("All Tasks: " + await tasks.getAll());
  console.log("Task 1: ");
  console.log(await tasks.get(task1_id));

  console.log("Test update: ");

  //let updated = await tasks.update(task1_id, "Cook Dinner", "cook for the fam", 2, true);
  let newObj = {
    description: "jake is chillin"
  };
  console.log(typeof newObj);
  let updated = await tasks.updatePatch(task1_id, newObj);
  console.log(updated);
  console.log(await tasks.getAll());
  console.log(await tasks.get(task1_id));

  try{// bad ID given should fail
    let test_update = await tasks.update(12345, "hello", "", 5, true);
  }catch(e){
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
  }
  await tasks.addComment(task1_id, comment1);
  await tasks.addComment(task1_id, comment2);
  task1 = await tasks.get(task1_id);
  console.log(task1);
  console.log(" ");
  console.log("Testing Delete Comment: ");

  let comment1_id = task1.comments[0].id;
  console.log(comment1_id);
  try {
    await tasks.deleteComment(task1_id, comment1_id);
  } catch (e) {
    console.log(" ");
    console.log(e);
    return;
  }

  console.log(await tasks.get(task1_id));
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
}

main();
