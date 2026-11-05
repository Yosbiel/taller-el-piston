/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3873800767",
    "help": "",
    "hidden": false,
    "id": "relation3388610051",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "vehiculo",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

  // remove field
  collection.fields.removeById("relation3388610051")

  return app.save(collection)
})
