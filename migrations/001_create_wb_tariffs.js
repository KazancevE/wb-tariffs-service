exports.up = async function(knex) {
  await knex.schema.createTable('wb_tariffs', function(table) {
    table.increments('id').primary();
    table.date('fetch_date').notNullable().index();
    table.string('warehouse_name').notNullable();
    table.string('geo_name');
    table.decimal('box_delivery_base', 12, 4);
    table.decimal('box_delivery_coef_expr', 12, 4);
    table.decimal('box_storage_base', 12, 4);
    table.decimal('box_storage_coef_expr', 12, 4);
    table.timestamps(true, true);
  });
  
  await knex.schema.table('wb_tariffs', function(table) {
    table.unique(['fetch_date', 'warehouse_name']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('wb_tariffs');
};
