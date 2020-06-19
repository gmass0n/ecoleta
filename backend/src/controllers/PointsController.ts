import { Request, Response } from "express";

import knex from '../database/connection'

export default class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const searializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.0.108:3333/uploads/${point.image}`
      };
    });

    return response.json(searializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ error: 'Point not found' });
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.id')
      .where('point_items.point_id', id)
      .select('items.id', 'items.title');

      const searializedPoint =  {
        ...point,
        image_url: `http://192.168.0.108:3333/uploads/${point.image}`
      };

    return response.json({
      point: searializedPoint,
      items
    });
  }

  async create(request: Request, response: Response) {
    const { 
      name, 
      email, 
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;

    const transaction = await knex.transaction();

    const point = {
      image: request.file.filename,
      name, 
      email, 
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }

    const insertedIds = await transaction('points').insert(point);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim())) 
      .map((item_id: number)  => {
        return {
          item_id,
          point_id
        };
    });

    await transaction('point_items').insert(pointItems);

    await transaction.commit();

    return response.json({ 
      id: point_id,
      ...point,
     });
  }
}