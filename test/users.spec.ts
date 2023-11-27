import { expect, it, beforeAll, afterAll, describe, beforeEach, afterEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Rotas user', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new user', async () => {
        const response = await request(app.server)
            .post('/users')
            .send({
                name: 'Vitor',
            })

        expect(response.statusCode).toEqual(201)
    })
})