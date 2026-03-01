import Joi from 'joi';

export const drawSchema = Joi.object({
  draw_date: Joi.date().iso().required(),
  first_prize: Joi.string().length(6).pattern(/^\d+$/).required(),
  front_three: Joi.array().items(Joi.string().length(3).pattern(/^\d+$/)).length(2).required(),
  back_three: Joi.array().items(Joi.string().length(3).pattern(/^\d+$/)).length(2).required(),
  last_two: Joi.string().length(2).pattern(/^\d+$/).required(),
  second_prize: Joi.array().items(Joi.string().length(6).pattern(/^\d+$/)).max(5).required(),
  third_prize: Joi.array().items(Joi.string().length(6).pattern(/^\d+$/)).max(10).required(),
  fourth_prize: Joi.array().items(Joi.string().length(6).pattern(/^\d+$/)).max(50).required(),
  fifth_prize: Joi.array().items(Joi.string().length(6).pattern(/^\d+$/)).max(100).required(),
});

export const checkQuerySchema = Joi.object({
  number: Joi.string().length(6).pattern(/^\d+$/).required(),
  date: Joi.date().iso().optional(),
});
