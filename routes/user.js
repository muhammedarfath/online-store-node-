
const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')

var loggedIn=true
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
   next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
   let user=req.session.user
   let cartCount=null
   if(req.session.user){
   cartCount=await userHelpers.getCartCount(req.session.user._id)

   

   }
   productHelpers. getAllproducts().then((products)=>{
  
    res.render('user/view-products',{products,user,cartCount})
  }) 
});
router.get('/about',(req,res)=>{
  res.render('user/about')
})
router.get('/all-products',async(req,res)=>{
  var user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  
    productHelpers.getAllproducts().then((products)=>{
      res.render('user/all-products',{products,user,cartCount})
    })
  }else{
    res.render('user/login')
  }
 

 
})
router.get('/shop-now',async(req,res)=>{
  var user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
    productHelpers.getAllproducts().then((products)=>{
      res.render('user/all-products',{products,user,cartCount})
    })
  }else{
    res.redirect('/')
  }
})
router.get('/news',(req,res)=>{
  var user = req.session.user
  res.render('user/news',{user})
})

router.get('/remove-product/:id', (req, res) => {
  let proId=req.params.id
 console.log(proId)
 userHelpers.removeProduct(proId).then((response)=>{
  res.redirect('/cart/')
 })
 
})













router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.logginErr})
    req.session.loginErr=false
  }
  
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedIn=true
    req.session.user=response
   // alert("Account created Successfully, now Login to your Account")
    res.redirect("/login")
    
  })
  
})
router.post('/login',(req,res)=>{
  
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response)
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.logginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
 req.session.destroy()
  res.redirect('/')
})
router.get('/view-products',(req,res)=>{
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
 let products=await userHelpers.getCartProducts(req.session.user._id)
 let totalValue=await userHelpers.getTotelAmount(req.session.user._id)
  console.log(products)
  res.render('user/cart',{products,user:req.session.user,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    res.json({status:true})
    
  })
 
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotelAmount(req.body.user)
  res.json(response)
  })
})

router.get("/place-order",verifyLogin,async(req,res)=>{
  let total= await userHelpers.getTotelAmount(req.session.user._id)
  console.log("Total Amount to be Paid:"+total);
  res.render('user/place-order',{total,user:req.session.user})
})





router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotelAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    }
    else {
      userHelpers.generateRazorPay(orderId, totalPrice).then((response) => {
        res.json(response)

      })
    }

  })
  console.log(req.body)

})
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user.id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{

  let products=await userHelpers.getOrderProducts(req.params.id)
  

    res.render('user/view-order-products',{admin:true,products})
  
  
})




router.post('/verify-payment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {

    userHelpers.chagePayementStatus(req.body['order[receipt]']).then(() => {
      console.log("payment successful")
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err)
    res.json({ status: false, errMsg: '' })
  })

})

router.get('/orders',(req,res)=>{
  res.render('user/orders')
})

module.exports = router;

