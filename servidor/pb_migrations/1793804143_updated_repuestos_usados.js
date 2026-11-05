/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3366194521")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_590519246",
    "help": "",
    "hidden": false,
    "id": "relation2765642171",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "repuesto",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3366194521")

  // remove field
  collection.fields.removeById("relation2765642171")

  return app.save(collection)
})
