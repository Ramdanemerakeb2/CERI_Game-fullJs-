
const express = require('express');
const pgClient  = require('pg') ;
const shal = require('js-sha1'); //pour le chifferement du mdp
var bodyParser = require('body-parser') ; //Il aide à mettre en ordre les request 
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);// définit le middleware connect-mongodb-session pour gérer le stockage des
//informations de sessions gérées par express-session
const MongoClient = require('mongodb').MongoClient ;// définit mongodb 

//l'url de MonngoDB de pedago 

const app = express();//je fais appel a expressJs

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '10mb'}));



app.use(express.static(__dirname+'/CERIGame/dist/CERIGame'));//on définit le DocumentRoot (qui charges les fichiers necessaires dont html,css,js)

//Spécification du port d’écoute pour les requtes HTTP
app.listen(3015, function() { 
    console.log('mon serveur ecoute sur le port 3015'); 
});

//**** Session stocker dans la collection mySession3015  */
app.use(session({// charge le middleware express-session dans la pile
    secret:'XX3015',
    saveUninitialized: false,
    resave: false,
    store: new MongoDBStore({
    uri: mongoUrl,
    collection:'mySession3015',
    touchAfter: 24 * 3600
   }), 
 cookie: {maxAge: 24 * 3600 * 1000}
}));


//on definit la route sur l’URL ‘/login’ par la méthode GET
app.post('/login', function (request, response) { 
    
    var pwd = shal(request.body.pwd); 

    sql = "select * from fredouil.users where identifiant ='"+request.body.username+"' and motpasse ='"+pwd+"';";

    pool.connect(function(err, client, done) {
        if(err) {console.log('Errorconnecting to pg server' + err.stack);} 
        else{
            console.log('Connection established');
            // Exécution de la requête SQL et traitement du résultat

            client.query(sql, (err, result) => {

                if(err){
                    console.log('Erreur d exécution de la requete' + err.stack);
                }else if(result.rows[0] != null){
                    

                    console.log('LE nom est '+ result.rows[0].nom);
                    console.log('LE prenom est '+ result.rows[0].prenom);

                    //Stockage des données dans la session 
                    request.session.isConnected = true ;
                    request.session.user_id = result.rows[0].id ;
                    request.session.identifiant = result.rows[0].identifiant ; 
                    request.session.nom = result.rows[0].nom ; 
                    request.session.prenom = result.rows[0].prenom ;
                    

                    console.log(request.session.id +'expire dans '+request.session.cookie.maxAge);
                    
                    var responseObject = {
                        'id': result.rows[0].identifiant,
                        'nom' : result.rows[0].nom  ,
                        'prenom': result.rows[0].prenom,
                        'statusResp': true 
                    };

                    client.query('update fredouil.users set statut_connexion= 1 where id=$1',[result.rows[0].id],()=>{
                        if(err){
                            console.log('ereur d execution');
                        }
                    });
                     

                }else{
                    var responseObject = {
                        'statusResp': false 
                    };
                }
                console.log('connexion fini');
                response.status(200).send(responseObject);

            });
            client.release();
        }  
        
        
    });



});

//on definit la route sur l’URL ‘/logout par la méthode GET qui met a jour le statut de connexion
app.get('/logout', function (request, response) { 

    sql = "update fredouil.users set statut_connexion= 0 where identifiant ='"+request.session.identifiant+"';";

    pool.connect(function(err, client, done) {
        if(err) {console.log('Errorconnecting to pg server' + err.stack);} 
        else{
            console.log('Connection established');
            // Exécution de la requête SQL et traitement du résultat

            client.query(sql, (err) => {

                if(err){
                    console.log('Erreur d exécution de la requete' + err.stack);
                }else{
                    request.session.destroy();
                    response.status(200).send();
                }
            });
            client.release();
        }

        
    });

});




/*on definit la route sur l’URL ‘/getProfile par la méthode GET a fin d'avoir 
 le Profile d'utilisateur
*/
app.get('/getProfile', function (request, response) { 

    const id = request.session.identifiant;
    
    if(!id) {
        console.log('Non connecter');
    }else{

        sql = "select * from fredouil.users where identifiant ='"+id+"';";

        pool.connect(function(err, client, done) {
            if(err) {console.log('Errorconnecting to pg server' + err.stack);} 
            else{
                console.log('Connection established');
               
                // Exécution de la requête SQL et traitement du résultat
                client.query(sql, (err, result) => {
    
                    if(err){
                        console.log('Erreur d exécution de la requete' + err.stack);
                    }else{
                        var responseObject = {
                            'nom_prenom' : result.rows[0].nom+' '+result.rows[0].prenom,
                            'humeur': result.rows[0].humeur,
                            'avatar': result.rows[0].avatar,
                            'date_naissance': result.rows[0].date_naissance
                        };
                        response.status(200).send(responseObject);
                    }
                });
            }
    
            client.release();
        });




    }

});

/*on definit la route sur l’URL ‘/getProfile par la méthode GET a fin d'avoir 
 le Profile d'utilisateur
*/
app.post('/updateProfile', function (request, response) { 

    sql = "update fredouil.users set humeur = '"+request.body.humeur+"',avatar = '"+request.body.avatar+"' where identifiant ='"+request.session.identifiant+"';";

    pool.connect(function(err, client, done) {
        if(err) {
            console.log('Errorconnecting to pg server' + err.stack);
        } 
        else{
            console.log('Connection established');
           
            // Exécution de la requête SQL et traitement du résultat
            client.query(sql, (err, result) => {

                if(err){
                    console.log('Erreur d exécution de la requete' + err.stack);
                    var responseObject = {
                        'update' : false
                    };
                    response.status(200).send(responseObject);
                }else{
                    var responseObject = {
                        'update' : true
                    };
                    response.status(200).send(responseObject);
                }
            });
        }

        client.release();//connexion liberée 
    });

});

//on definit la route sur l’URL ‘/getScore par la méthode POST qui calcule le score et insere sur l'historique
app.post('/getScore', function (request, response) { 

    
    if(request.body.nbrRep == null || request.body.time == null|| request.body.level == null)
    {
        res.status(500).send('pas de params !');
    }
    
    // Calcule du score 
    // nombre de bonnes réponses / nombre de questions * tempsBonus * difficulté
    var nbrRep = request.body.nbrRep;
    var temps = request.body.time;
    var niveau = request.body.level;

    var tempsBonus ; //il varie selon le temps de jeu 
    if(temps <= 60)
        tempsBonus = 15;
    if((temps > 60) && (temps <= 90))
        tempsBonus = 10;
    if((temps > 90) && (temps <= 120))
        tempsBonus = 5;
    if(temps > 120)
        tempsBonus = 2;

    var score = Math.floor( (nbrRep/5)*(tempsBonus*niveau) );
    console.log(score);

    
    sql = "INSERT INTO fredouil.historique VALUES (default," + request.session.user_id + ",now()," + niveau + "," + nbrRep + "," + temps + "," + score + ")";

    pool.connect(function(err, client, done) {
        if(err) {console.log('Errorconnecting to pg server' + err.stack);} 
        else{
            console.log('Connection established');
            // Exécution de la requête SQL et traitement du résultat

            client.query(sql, (err) => {

                if(err){
                    console.log('Erreur d exécution de la requete' + err.stack);
                    var responseObject = {
                        'insert' : false
                    };
                    response.status(200).send(responseObject);
                }else{
                    var responseObject = {
                        'insert' : true,
                        'score' : score
                    };
                    response.status(200).send(responseObject);
                }
            });
            client.release();
        }

        
    });

});


//récupération de l'historique d'un joueur en utilisant son identifiant stocké dans la session
app.get('/getHistorique', function (request, response) { 

    sql = "select * from fredouil.historique where id_user '"+request.session.user_id+"';";

    pool.connect(function(err, client, done) {
        if(err) {console.log('Errorconnecting to pg server' + err.stack);} 
        else{
            console.log('Connection established');
            // Exécution de la requête SQL et traitement du résultat

            client.query(sql, (err,result) => {

                if(err){
                    console.log('Erreur d exécution de la requete' + err.stack);
                }else{
                    
                    response.status(200).send(result);
                }
            });
            client.release();
        }

        
    });

});

//********************gestion de MongoDb************************************

/*on definit la route sur l’URL ‘/getAllThemes par la méthode GET a fin d'avoir 
 les differents themes de la collection quiz 
*/
app.get('/getAllThemes', function (request, response) { 

    MongoClient.connect(mongoUrl, {
        useUnifiedTopology: true
      }, (err, client) => {
        if (err) return console.error(err);

        console.log('Connected to Database');

        //acces a la Base de données db qui contient la collection quiz
        const db = client.db('db');
        db.collection('quizz').distinct('thème', (err,res)=>{

            if (err) throw err;
            //on renvoie le resultat contenant tous les themes 
            response.status(200).send(res);
            client.close();
      
          });

      });


});


/*on definit la route sur l’URL ‘/getQuizByTheme par la méthode POST a fin d'avoir 
 le quiz selon le theme choisit pas l'utilisateur
*/
app.post('/getQuizByTheme', function (request, response) { 

    MongoClient.connect(mongoUrl, {
        useUnifiedTopology: true
      }, (err, client) => {
        if (err) return console.error(err);

        console.log('Connected to Database');

        //acces a la Base de données db slectionner tout le quiz selon le thme 
        const db = client.db('db');
        
        /*db.collection('quizz').find({'thème':request.body.theme}).toArray((err,res)=>{
            if (err) throw err;
            response.status(200).send(res);
            client.close();
        });*/

        // https://docs.mongodb.com/manual/reference/operator/aggregation
        //selectionner que 5 question aléatoirement et prendre en compte le niveau de difficulté
        db.collection('quizz').aggregate([ 
            { $match : { thème : request.body.theme } } , //on perecise le theme 
            { $unwind: "$quizz" }, // pour générer un document pour chaque élément quizz (question)
            { $project:
            { _id: 0, id: '$quizz.id', question: '$quizz.question', propositions: '$quizz.propositions', anecdote: '$quizz.anecdote', reponse: '$quizz.réponse' }
            },//filtrage 
            { $sample: { size: 5 } },// selecionner 5 objet (question) aléatoirement
            { $sort: { id: 1 } } //trie ascendant selon l'id de a question
        ]).toArray((err,res)=>{
            if (err) throw err;

            for (let i = 0; i < res.length; i++) {

                //le nmbre de proposisions = 2
                if(request.body.level == 1){
                    // get Index a fin de la bonne proposition pour la laissé dans les proposition
                    let index = res[i].propositions.indexOf(res[i].reponse) ; // 

                    // On va avoir un nombre aléatoirement diffrent de l'index de la proposition vrai 
                    let random1 = Math.floor(Math.random() * Math.floor(3));
                    if (random1 >= index) random1++; 

                    //reconstruire les proposition avec la bonne reponse et une aléatoirement
                    var propo = [];
                    propo.push(res[i].propositions[random1]);

                    //On insere la bonne prposition aléatoirement sinon l'index sera le meme pour toutes les questions
                    let random2 = Math.floor(Math.random() * Math.floor(3));
                    propo.splice(random2, 0, res[i].reponse);

                    //on insere les nouvelle propositions dans la reponse 
                    res[i].propositions = propo ;
                }

                // le nmbre de proposisions =  nmbre de proposisions sur BD - 1
                if(request.body.level == 2){
                    
                    var propo = [];
                    for (let j = 0; j < res[i].propositions.length - 1; j++) {
                        // on insere les proposition diffrente que la bonne 
                        if (res[i].propositions[j] != res[i].reponse) {
                          propo.push(res[i].propositions[j]);
                        }
          
                    }

                    //On insere la bonne prposition aléatoirement sinon l'index sera le meme pour toutes les questions
                    let random3 = Math.floor(Math.random() * Math.floor(3));
                    propo.splice(random3, 0, res[i].reponse);

                    res[i].propositions = propo ;
                }

                // le cas du NIveau de diffculté 3 on prend toutes les propositions de la BD
                    
                  
            }

            response.status(200).send(res);
            client.close();
        });


      });


});