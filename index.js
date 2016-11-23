// App ID: 227915907640035
// App Secrect: 4a102434b3199285971661762a12b239

//Configurar Servidor para usar dependencias
var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var cookieSession = require("cookie-session");
var FacebookStrategy = require("passport-facebook").Strategy;
var graph = require("fbgraph");

var app = express();

// Bodyparser para leer datos del body de la peticion
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Cookie Session para poder guardar las cookies
app.use(cookieSession({ keys: ['asdas', '1234qwerty']}));

// Passport para la autenticacion
app.use(passport.initialize());
app.use(passport.session());

// Pug para las vistas
app.set('view engine', 'pug');


// Configurar autenticacion
	// 1.- Definiar la estrategia a utilizar
	passport.use(new FacebookStrategy({
		clientID: '227915907640035',
		clientSecret: '4a102434b3199285971661762a12b239',
		callbackURL: 'http://localhost:8000/auth/facebook/callback'
	}, function(accessToken, refreshToken, profile, cb){
		
		// Guardar en la base de datos
		 
		// Guardar al usuario en la sesion
		var user = {
			accessToken: accessToken,
			profile: profile
		}
		// Llmar la funcion cb que completa la autenticacion
		cb(null,user);
	}

	));
	// 2.- Definiar como guardar el usuario en la sesion
	
	passport.serializeUser(function(user,done){
		done(null,user);
	});

	// 3.- Definir como retomar el usuario de la sesion
	
	passport.deserializeUser(function(user,done){
		done(null,user);
	});


// Definir y utilizar el flujo de autenticacion
app.get('/auth/facebook', passport.authenticate('facebook',{}));

// recibir respuesta del facebook
app.get('/auth/facebook/callback', 
	passport.authenticate('facebook',{failureRedirect:'/'}),
	function(req,res){
		console.log(req.session);
		res.redirect('/');
	});

//Cerrar Sesión
app.get("/auth/close", function(req,res){
	req.logout();
	res.redirect('/');
});


// Mostrar vistas de inicio
app.get('/', function(req,res){

	if(typeof req.session.passport == "undefined" || !req.session.passport.user){
		res.render('index');
	}else{
		res.render('home');
	}
	
});



// Pones a escuchar a nuestro servidor en el puerto 8000
app.listen(8000, function(){
	console.log("Estamos en el puerto 8000");
})