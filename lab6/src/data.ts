const mongoCollections = require("./mongoCollections");
const database = mongoCollections.tasks;
const ObjectID = require('mongodb').ObjectID;

async function create(title, description, hoursEstimated, completed){
  //check correct types and input given.
  if(typeof title != "string" || typeof description != "string" || typeof hoursEstimated != "number" || typeof completed != "boolean"){
    return Promise.reject("Error, incorrect input");
  }
  let col = await database();

  let newTask = {
    _id: new ObjectID(),
    title: title,
    description: description,
    hoursEstimated: hoursEstimated,
    completed: completed,
    comments: [] //to be utilized later
  }
  const insertInfo = await col.insertOne(newTask);
  if (insertInfo.insertedCount === 0) {
    return Promise.reject("Could not create task.");
  }
  return newTask;
}

async function getAll(){
  let col = await database();
  let cur = await col.find();
  return cur.toArray();
}

async function get(id){
  if(id === undefined){
    return Promise.reject("ID is undefined.");
  }
  const col = await database();
  var temp = await col.findOne({_id: ObjectID(id)});
  if(temp === null)
      return Promise.reject("No task found with that ID.");
  return temp;
}

async function updatePatch(id, newTask){
  if(id === undefined || typeof newTask != "object"){
    return Promise.reject("Error, incorrect input");
  }
  try {
    await get(id)
  } catch (e) {
    console.log("Error: " + e);
    return;
  }
  const currentTask = await get(id);
  let newObject = {
    title: currentTask.title,
    description: currentTask.description,
    hoursEstimated: currentTask.hoursEstimated,
    completed: currentTask.completed,
    comments: currentTask.comments,
  };
  if(newTask.hasOwnProperty("title") && typeof newTask.title == "string"){
    newObject.title = newTask.title;
  }
  if(newTask.hasOwnProperty("description") && typeof newTask.description == "string"){
    newObject.description = newTask.description;
  }
  if(newTask.hasOwnProperty("hoursEstimated") && typeof newTask.hoursEstimated == "number"){
    newObject.hoursEstimated = newTask.hoursEstimated;
  }
  if(newTask.hasOwnProperty("completed") && typeof newTask.completed == "boolean"){
    newObject.completed = newTask.completed;
  }

  const col = await database();
  console.log("I get here: " + newObject);
  const updateInfo = await col.updateOne({_id:ObjectID(id)}, {$set:{
    title: newObject.title,
    description: newObject.description,
    hoursEstimated: newObject.hoursEstimated,
    completed: newObject.completed,
  }});
  if(updateInfo.modifiedCount === 0){
    return Promise.reject("Could not update task.");
  }
  try {
    await get(id);
  } catch (e) {
    console.log("Error: " + e);
    return;
  }
  return await get(id);
}

async function update(id, title, description, hoursEstimated, completed){
  if(id === undefined || typeof title != "string" || typeof description != "string" || typeof hoursEstimated != "number" || typeof completed != "boolean"){
    return Promise.reject("Error, incorrect input");
  }

  const col = await database();
  const updateInfo = await col.updateOne({_id: ObjectID(id)}, {
    $set:{
      title: title,
      description: description,
      hoursEstimated: hoursEstimated,
      completed: completed,
    }
  });

  if(updateInfo.modifiedCount === 0){
    return Promise.reject("Could not update task.");
  }
  try {
    await get(id);
  } catch (e) {
    console.log("Error: " + e);
    return;
  }
  return await get(id);
}

async function addComment(id, comment){
  if(id === undefined || typeof comment != "object"){
    return Promise.reject("Error, incorrect input.");
  }
  if(typeof comment.name != "string" || typeof comment.comment != "string"){
    return Promise.reject("Error, incorrect format for the comment object.");
  }
  comment.id = new ObjectID();

  const col = await database();
  const updateInfo = await col.updateOne({_id: ObjectID(id)}, {$push:{"comments": comment}});
  if(updateInfo.modifiedCount === 0){
    return Promise.reject("Could not add comment.");
  }
  return await get(id);
}

async function deleteComment(taskId, commentId){
  if(taskId === undefined || commentId === undefined){
    return Promise.reject("Error, incorrect input.");
  }
  const col = await database();
  //const updateInfo = await col.updateOne({_id: ObjectID(taskId)}, {$pull: {"comments.id": commentId} });
  let fix;
  try {
      fix = await get(taskId);
  } catch (e) {
    console.log("Could not find task with ID: " + taskId + ". " + e);
    return await get(taskId);
  }
  if(fix.comments.length == 1){ //for some reason mongo is dumb and wont update if there is only one comment in the array so here you go
    const fixInfo = await col.updateOne({_id: ObjectID(taskId)}, {$set:{comments: []}});
    if(fixInfo.modifiedCount === 0){
      return Promise.reject("Could not delete comment.");
    }
    return;
  }
  const updateInfo = col.updateMany({},
    {$pull: {comments: {id: commentId}}},
    {multi: true});
  if(updateInfo.modifiedCount === 0){
    return Promise.reject("Could not delete comment.");
  }
  try{
    return await get(taskId);
  }catch(e){
    console.log("Could not find task with ID: " + taskId + ". " + e);
    return;
  }
  return await get(taskId);
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
