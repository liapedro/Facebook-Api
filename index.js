// App ID: 227915907640035
// App Secrect: 33226d71aa00b40bee2da443c74eb0f1

//Configurar Servidor para usar dependencias
var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var cookieSession = require("cookie-session");
var FacebookStrategy = require("passport-facebook").Strategy;
var graph = require("fbgraph");
var User = require("./models/user");

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
		clientSecret: '33226d71aa00b40bee2da443c74eb0f1',
		callbackURL: 'http://localhost:8000/auth/facebook/callback'
	}, function(accessToken, refreshToken, profile, cb){
		
		// Guardar en la base de datos
		 
		User.findOrCreate({uid: profile.id}, {
			name: profile.displayName,
			provider: 'facebook',
			accessToken: accessToken
		}, function(err,user){
			// Llmar la funcion cb que completa la autenticacion
			cb(null,user);

		});


		// Guardar al usuario en la sesion
		/*var user = {
			accessToken: accessToken,
			profile: profile
		}*/
		
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
app.get('/auth/facebook', passport.authenticate('facebook',{
	scope: ['publish_actions', 'user_friends']
}));

// recibir respuesta del facebook
app.get('/auth/facebook/callback', 
	passport.authenticate('facebook',{failureRedirect:'/'}),
	function(req,res){ // Que deseamos hacer una vez que el proceso de autenticación haya terminado
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

// Publicar en el muro
app.post("/logros", function(req,res){
	var logro = req.body.logro;

	graph.setAccessToken(req.session.passport.user.accessToken);

	graph.post("/feed",{message: logro}, function(err, graphResponse){
		console.log(graphResponse);

		res.redirect("/");
	});
});

// Buscar Amigos

app.get("/friends", function(req,res){
	graph.setAccessToken(req.session.passport.user.accessToken);

	graph.get("/me/friends", function(err, graphResponse){
		res.json(graphResponse);

		//Extraer ID del arreglo data de graphResponse
		var ids = graphResponse.data.map(function(el){
			return el.id;

		});

		//Buscar en la coleccion Usuarios, los que tengan un uid =  a los id que obtuvimos
		User.find({
			'uid':{
				$in: ids
			}
		}, function(err, users){
				res.render('friends',{users: users});
		});

		// Mostrar los usuarios encontrados
		 
		
	});
});

// Pones a escuchar a nuestro servidor en el puerto 8000
app.listen(8000, function(){
	console.log("Estamos en el puerto 8000");
})