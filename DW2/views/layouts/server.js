const express = require('express');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose') // npm install mongodb

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//Almacenamientos de usuarios a traves de la base de datos y atributos de los mismos
//Almacenamientos de usuarios a traves de la base de datos y atributos de los mismos
const UsuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  collection: 'Usuario' // <--- ¡¡ESTA ES LA LÍNEA QUE TE FALTA!!
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

//logica de los hadlebars
app.get('/', (req, res) => {
    res.send('plantilla de pagina web');
});

//sign up
app.get('/signUp', (req, res) => {
    res.render('signUp');
});

app.post('/signUp', async(req, res)=>{
    const{username, password} = req.body;

    try{
    const nuevoUsuario = new Usuario({ username, password });
    await nuevoUsuario.save();
    
    res.cookie('ID', nuevoUsuario._id.toString());
    
    res.status(201).render('welcome', {usuario:username});
    }

  catch(error){
    if(error.code === 11000){
      res.status(400).send('El nombre de usuario ya existe');
    }
  }
})

//ruleta
app.get('/ruleta', async(req, res)=>{
    try{
        const ID = req.cookies.ID;
        const usuario = await Usuario.findById(ID);
        if(!usuario){
          res.send(`usuario ID: ${ID}`);
        }
        const saldo = usuario.balance? usuario.balance: '0';
        
        res.cookie('saldo', saldo.toString())

        res.render('ruleta', {saldo:saldo})
    }
    catch(error){
        console.error(error);
        res.status(500).send('error del servidor');
    }
})

//wallet
app.get('/wallet', async(req, res)=>{
    const saldo = req.cookies.saldo ?? '0';
    
    res.render('wallet', {saldo:saldo})
})

app.post('/wallet', async(req,res)=>{
    try{
        const {ID} = req.cookies.ID;
        const add = parseFloat(req.body.add);
        if(add){
            const Update = await Usuario.findByIdAndUpdate(
                ID,
                    {$inc: {balance:add}},
                    {new: true}
            )
        };
        res.cookie('saldo', Update.balance.toString());
        res.redirect('/wallet');
    }
    catch(error){
        console.error(error);
        res.status(500).send('error del servidor');
    }
})

//coneccion a la base de datos
const adressDB = 'mongodb+srv://BTF6:tututuduMaxVerstappen@zzzerver.d9ofxax.mongodb.net/?retryWrites=true&w=majority&appName=zzzerver';

mongoose.connect(adressDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas')
})
.catch(err => {
  console.error('Error conectando a MongoDB', err)
})

app.listen(port, () => {
    console.log(`Servidor de cookies listo. Visita http://localhost:${port}`);
});