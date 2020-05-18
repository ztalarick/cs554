import * as express from 'express';
import { Request, Response } from 'express';
const bodyParser = require("body-parser");
const tasksData = require('./data');


let counts: object = {}; //for keeping track of the times a URL has been visited
function arrayToJson(arr){
  let returnObject = {};
  for(let i = 0; i < arr.length; i++){
    returnObject[i] = arr[i];
  }
  return returnObject;
}

class App {
	public app: express.Application;
	constructor() {
		this.app = express();
		this.config();
		this.routes();
	}
	private config(): void {
		this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
		//this.app.use(express.urlencoded({ extended: false }));
	}

	private routes(): void {
		const router = express.Router();

    router.all('*', async(req: Request, res: Response, next) => {
    let message:string = `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} `;
    console.log(message);
    next();
    });

    router.all('*', async(req:Request, res:Response, next) => {
      if(counts.hasOwnProperty(req.originalUrl)){
        counts[req.originalUrl]++;
        console.log(req.originalUrl + " has been requested " + counts[req.originalUrl] + " times.");
      }else{
        counts[req.originalUrl] = 1;
        console.log(req.originalUrl + " has been requested 1 time.");
      }
      next();
    });

    router.get('/api/tasks', async (req:Request, res:Response) => {
      const skip: number = Number(req.query.skip);
      const take: number = Number(req.query.take);

      let allTasks = await tasksData.getAll();

      if(take != undefined && skip != undefined){ // both take and skip
        if((take - skip) > 100) {
          res.status(413).json({message: "Error you cannot print more than 100 tasks."}).send();
          return;
        }else if((take - skip) < 0){
          res.status(416).json({message: "Error you cannot skip more than you take."}).send();
          return;
        }
        res.json(arrayToJson(allTasks.slice(skip, take - 1)));
      }else if(take != undefined && skip === undefined){ // take
        if(take > 100){
          res.status(413).json({message: "Error you cannot print more than 100 tasks."}).send();
          return;
        }
        if(take == 1){
          res.json(allTasks[0]);
        }else{
          res.json(arrayToJson(allTasks.slice(0, take)));
        }
      }else if(skip != undefined && take === undefined){ //skip
        if(skip > allTasks.length){
          res.status(400).json({message: "Error there are no tasks after skipping " + skip + " tasks."}).send();
          return;
        }
        res.json(arrayToJson(allTasks.slice(skip, 99)));
      }else{
        res.json(arrayToJson(allTasks.slice(0, 19)));
      }
      res.status(200).send();
      return;
    });

    router.get('/api/tasks/:id', async (req: Request, res :Response) =>{
      try{
        const data = await tasksData.get(req.params.id);
        res.json(data);
      }catch(e){
        res.status(404).json({message: "Error: " + e}).send();
        return;
      }
      res.status(200).send();
      return;
    });

    router.post('/api/tasks', async (req: Request, res: Response) => {
      let data;
      try {
        data = await tasksData.create(req.body.title, req.body.description, Number(req.body.hoursEstimated), "true" == req.body.completed);
        res.json(data);
      } catch (e) {
        res.status(400).json({message:  "Error: " + e}).send();
        return;
      } finally {
        res.status(200).send();
        return data;
      }
    });

    router.put('/api/tasks/:id', async (req:Request, res:Response) => {
      let data;
      try {
        data = await tasksData.update(req.params.id, req.body.title, req.body.description, Number(req.body.hoursEstimated), "true" == req.body.completed);
        res.json(data);
      } catch (e) {
        res.status(400).json({message:  "Error: " + e}).send();
        return;
      } finally {
        res.status(200).send();
        return data;
      }
    });
    router.patch('/api/tasks/:id', async (req:Request, res:Response) => {
      let data;
      try {
        data = await tasksData.updatePatch(req.params.id, req.body);
        res.json(data);
      } catch (e) {
        res.status(400).json({message:  "Error: " + e}).send();
        return;
      } finally {
        res.status(200).send();
        return data;
      }
    });
    router.post('/api/tasks/:id/comments', async (req:Request, res:Response) => {
      let data;
      try {
        data = await tasksData.addComment(req.params.id, req.body);
        res.json(data);
      } catch (e) {
        res.status(400).json({message: "Error: " + e}).send();
        return;
      } finally {
        res.status(200).send();
        return data;
      }
    });
    router.delete('/api/tasks/:taskId/:commentId', async (req:Request, res:Response) => {
      let data;
      try {
        data = await tasksData.deleteComment(req.params.taskId, req.params.commentId);
        res.json(data);
      } catch (e) {
        res.status(400).json({message: "Error: " + e}).send();
        return;
      } finally {
        res.status(200).send();
        return data;
      }
    });

		this.app.use('/', router);
	}
}

export default new App().app;
