import { Request, Response } from "express";

import knex from '../database/connection'

export default class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');

    const searializedItems = items.map(item => {
      return {
        id: item.id,
        name: item.title,
        image_url: `http://192.168.0.108:3333/uploads/${item.image}`
      };
    });
  
    return response.json(searializedItems);
  }
}