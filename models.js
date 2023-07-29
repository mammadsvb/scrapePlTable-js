const mongoose = require("mongoose");

const teamSchema = mongoose.Schema({
    Position : {type : String},
    Club : {type : String},
    Next_Match : {type : Object},
    Played : {type : Number},
    Won : {type : Number},
    Drawn : {type : Number},
    Lost : {type : Number},
    GF : {type : Number},
    GA : {type : Number},
    GD : {type : Number},
    Points : {type : Number},
    Date : {type : Date},
    
});

const Team = mongoose.model("PL TEAM",teamSchema);

module.exports = Team;