const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const adminHelpers=require('../helpers/admin-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.admin. loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllproducts().then((products) => {
    console.log(products)
    res.render('admin/view-products', { admin: true, products })
  })






});
router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { admin: true })
})
router.post('/add-product', (req, res) => {
  console.log(req.body)
  console.log(req.files.Image)
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-product', { admin: true })
      } else {
        console.log(err)
      }
    })

  })


})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product', { product, admin: true })
})
router.post('/edit-product/:id', (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    let id = req.params.id
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
router.get('/login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.adminLogginErr })
    req.session.adminLoginErr = false
  }

})




router.get("/allOrders",async function(req,res){
  let orders = await adminHelpers.getUserOrders(req.userId)
  
  res.render("admin/all-orders",{admin:true, orders})
})

router.get("/allUsers",async (req,res)=>{
  let users=await adminHelpers.getAllUsers(req.session)
  res.render("admin/all-users",{admin:true,users})
})

module.exports = router;
