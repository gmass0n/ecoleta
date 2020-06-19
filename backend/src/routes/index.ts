import express from 'express';

import itemsRouter from './items.routes';
import pointsRouter from './points.routes';

const routes = express.Router();

routes.use('/items', itemsRouter);
routes.use('/points', pointsRouter);

export default routes;