const express = require("express");
require("dotenv/config");
const morgan = require('morgan')

const app = express();
const port = process.env.PORT
const {
  COINBASE_API_KEY,
  COINBASE_WEBHOOK_SECRET,
  DOMAIN,
} = require("./config");

const { Client, resources, Webhook } = require("coinbase-commerce-node");

app.use(morgan('dev'))
app.use(express.json({
  verify: (req,res,buf)=>{
    req.rawBody = buf
  }
}))

Client.init(COINBASE_API_KEY);
const { Charge } = resources;

app.get("/create-charge", async (req, res) => {
  const chargeData = {
    name: "videogame",
    description: "God of war Ragnarok",
    local_price: {
      amount: "0.1",
      currency: "USD",
    },
    pricing_type: "fixed_price",
    metadata:{
      customer_id: 'id_1',
      customer_name: 'josnny'
    },
    redirect_url: `${DOMAIN}/success-payment`,
    cancel_url: `${DOMAIN}/cancel-payment`
  };
 const charge = await Charge.create(chargeData);
 res.send(charge)

});

  app.post('/payment-handler',(req,res)=>{
  const rawBody = req.rawBody
  const signature = req.headers["x-cc-webhook-signature"];
  const webhookSecret = COINBASE_WEBHOOK_SECRET;


  let event
  try {
   event = Webhook.verifyEventBody(rawBody,signature,webhookSecret)

   if(event.type === 'charge:pending'){
    console.log('pago pendiente')
   }
   if(event.type === 'charge:confirmed'){
    console.log('pago confirmado')
   }
   if(event.type === 'charge:failed'){
    console.log('pago fallido')
   }

   return res.send(event.id)
  } catch (error) {
    console.log(error)
    res.status(400).send('fail')
  }
  })

app.get('/success-payment',(req,res)=>{
  res.send('payment completed')
})

app.get('/cancel-payment',(req,res)=>{
  res.send('payment canceled')
})





app.listen(port);
console.log(`Listening on port: ${port}`);
