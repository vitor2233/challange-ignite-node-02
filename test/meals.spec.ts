import { expect, it, beforeAll, afterAll, describe, beforeEach, afterEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Rotas meals', () => {
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

    it('should be able to create a new meal', async () => {
        const response = await request(app.server)
            .post('/users')
            .send({
                name: 'Arroz',
                description: 'Arroz branco',
                dateTime: new Date(),
                isInDiet: true
            })

        expect(response.statusCode).toEqual(201)
    })

    it('should be able to list all meals', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Arroz',
                description: 'Arroz branco',
                dateTime: new Date(),
                isInDiet: true
            })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .send()
        expect(listMealsResponse.statusCode).toEqual(200)
    })

    it('should be able to update meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Arroz',
                description: 'Arroz branco',
                dateTime: new Date(),
                isInDiet: true
            })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .send()

        const mealId = listMealsResponse.body.meals[0].id

        const updateResponse = await request(app.server)
            .put('/meals/' + mealId)
            .set('Cookie', cookies)
            .send({
                name: 'Arroz',
                description: 'Arroz branco',
                dateTime: new Date(),
                isInDiet: true
            })

        expect(updateResponse.statusCode).toEqual(200)
    })
})