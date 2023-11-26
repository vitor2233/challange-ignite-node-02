import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary(),
            table.text('name').notNullable(),
            table.text('description').notNullable(),
            table.dateTime('date_time').notNullable(),
            table.boolean('is_in_diet').notNullable(),
            table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary(),
            table.text('name').notNullable(),
            table.uuid('session_id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users')
    await knex.schema.dropTableIfExists('meals')
}

