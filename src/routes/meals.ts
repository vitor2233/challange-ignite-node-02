import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { knex } from "../database";

export async function mealsRoute(app: FastifyInstance) {
    app.get('/', async (request, reply) => {
        let sessionId = request.cookies.sessionId
        console.log(sessionId);

        return reply.status(200).send()
    })
    app.post('/', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dateTime: z.string(),
            isInDiet: z.boolean()
        })
        const { name, description, dateTime, isInDiet } = createMealBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

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
}