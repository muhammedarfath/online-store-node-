var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {
        // console.log(product)
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data.insertedId)
        })
    },
    
    getAllproducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new objectId(proId) }).then((response) => {
                //console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new objectId(proId) }).then((product) => {
                resolve(product)
            })

        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new objectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Description: proDetails.Description,
                    Price: proDetails.Price,
                    Category: proDetails.Category

                }
            }).then((response) => {
                resolve()
            })
        })

    },
   
}