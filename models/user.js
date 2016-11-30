// OImportar dependencias

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;


// Conectarnos a MongoDB y la BD

mongoose.connect('mongod://localhost/taller_Facebook');

// Definir el Schema

var userSchema = new Schema({
	name : String,
	provider: String,
	uid: String,
	accessToken: String
});

//
// Usar el plugin findOrCreate

userSchema.plugin(findOrCreate);


// Crear y Exportar el Modelo

module.exports = mongoose.model("User", userSchema);