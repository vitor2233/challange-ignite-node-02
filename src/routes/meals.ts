import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { knex } from "../database";
import { checkSessionIdSame } from "../middlewares/check-session-id-same";
import { randomUUID } from "crypto";

export async function mealsRoute(app: FastifyInstance) {
    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const meals = await knex('meals').where('user_session_id', sessionId).select('*')

        return reply.status(200).send({ meals })
    })
    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        const getIdParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getIdParamsSchema.parse(request.params);

        const meals = await knex('meals').where('user_session_id', sessionId)
            .andWhere('id', id).select('*').first()

        return reply.status(200).send(meals)
    })
    app.get('/totalMeals', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        const meals = await knex('meals').where('user_session_id', sessionId)
            .count({ totalMeals: '*', }).first()
        return reply.status(200).send(meals)
    })
    app.get('/totalInDiet/:inDiet', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        const getisInDietParamsSchema = z.object({
            inDiet: z.enum(["true", "false"]).transform((value) => value === "true")
        })
        const { inDiet } = getisInDietParamsSchema.parse(request.params);

        const meals = await knex('meals')
            .where('user_session_id', sessionId).andWhere('is_in_diet', inDiet)
            .count({ totalMeals: '*', }).first()

        return reply.status(200).send(meals)
    })
    app.get('/sequenceInDiet', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        await knex('meals').where('user_session_id', sessionId)
            .then(rows => {
                let currentSequence = [];
                let longestSequence = [];

                for (const row of rows) {
                    if (row.is_in_diet) {
                        currentSequence.push(row);
                    } else {
                        if (currentSequence.length > longestSequence.length) {
                            longestSequence = currentSequence;
                        }
                        currentSequence = [];
                    }
                }

                if (currentSequence.length > longestSequence.length) {
                    longestSequence = currentSequence;
                }

                return reply.status(200).send({ longestSequence: longestSequence.length })
            })
    })
    app.post('/', {
    }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string(),
            isInDiet: z.boolean()
        })
        const { name, description, dateTime, isInDiet } = createMealBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
            })
        }

        await knex('meals').insert({
            id: crypto.randomUUID(),
            name,
            description,
            date_time: dateTime,
            is_in_diet: isInDiet,
            user_session_id: sessionId
        })

        return reply.status(201).send()
    })
    app.put('/:id', {
        preHandler: [checkSessionIdExists, checkSessionIdSame]
    }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string(),
            isInDiet: z.boolean()
        })
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { name, description, dateTime, isInDiet } = createMealBodySchema.parse(request.body)
        const { id } = getMealParamsSchema.parse(request.params);

        await knex('meals').update({
            name,
            description,
            date_time: dateTime,
            is_in_diet: isInDiet
        }).where('id', id)

        return reply.status(200).send()
    })
    app.delete('/:id', {
        preHandler: [checkSessionIdExists, checkSessionIdSame]
    }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getMealParamsSchema.parse(request.params);

        await knex('meals').delete().where('id', id)

        return reply.status(200).send()
    })
}