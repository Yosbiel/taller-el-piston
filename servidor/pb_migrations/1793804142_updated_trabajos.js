/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3144198324")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3299786656",
    "help": "",
    "hidden": false,
    "id": "relation3777548247",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "orden",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3144198324")

  // remove field
  collection.fields.removeById("relation3777548247")

  return app.save(collection)
})
