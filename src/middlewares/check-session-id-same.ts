import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod";
import { knex } from "../database";

export async function checkSessionIdSame(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId
    const getMealParamsSchema = z.object({
        id: z.string().uuid(),
    })
    const { id } = getMealParamsSchema.parse(request.params);
    const messageMethod = request.method == 'PUT' ? 'editar' : 'excluír'

    const meals = await knex('meals').where('user_session_id', sessionId)
        .andWhere('id', id).count({ count: '*' }).first()

    if (meals.count == 0) {
        return reply.status(400).send({ error: 'Não autorizado para ' + messageMethod + ' este registro' })
    }
}