import express from 'express';
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';

import multerConfig from '../configs/multer';

import PointsController from '../controllers/PointsController';

const pointsRouter = express.Router();

const upload = multer(multerConfig);

const pointsController = new PointsController();

pointsRouter.post(
  '/', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false
  }),
  pointsController.create
);
pointsRouter.get('/', pointsController.index);
pointsRouter.get('/:id', pointsController.show);

export default pointsRouter;