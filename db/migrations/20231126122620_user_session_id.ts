import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.uuid('user_session_id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.dropColumn('user_session_id')
    })
}

