import express from 'express';

import ItemsController from '../controllers/ItemsController';

const itemsRouter = express.Router();

const itemsController = new ItemsController();

itemsRouter.get('/', itemsController.index);

export default itemsRouter;