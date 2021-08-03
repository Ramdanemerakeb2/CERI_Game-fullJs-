import { Component, OnInit, OnDestroy} from '@angular/core';
import { Quiz } from '../service/quiz.service';
import { ActivatedRoute } from '@angular/router';
import { Question } from '../interfaces/question';
import {Notification} from '../service/notification.service';




@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit, OnDestroy {

  theme!: string ;
  level!: string ;

  question!: Question[] ;
  index!: number ;
  radioSelected: any;
  finQuiz!: boolean;

  nmbrBonneRep!: number;
  score!: any;

  timeLeft: number = 0;
  interval: any;


  constructor(public quiz: Quiz, private route: ActivatedRoute, private notif: Notification) { }

  ngOnInit(): void {
    // on recupere le thme et le niveau passer du quiz-component
    this.theme = this.route.snapshot.params['theme'];
    this.level = this.route.snapshot.params['level'];

    // On recupere les questions
    this.quiz.getQuizByTheme(this.theme, +this.level).subscribe(
      data => {
        this.question = data ;
        console.log(this.question);
        localStorage.setItem('quiz', JSON.stringify(data)) ;
      },
      error => { console.log(error); }
    );

    // On initialise l'indexe et la finQuiz
    this.index = 0 ;
    this.finQuiz = false ;
    this.nmbrBonneRep = 0 ;
    // On declanche le timer
    this.startTimer();
  }

  ngOnDestroy(): void{
    // On arrete le temps
    this.pauseTimer();
  }

  suivant(): void{
    
    // On verifie si la response est vrai
    if(this.question[this.index].reponse === this.radioSelected){
      this.nmbrBonneRep++;
      console.log('vraiii');

      // On affiche le bandeau en vert avec l'anecdote (bonne reponse)
      const message = [1, ' '+ this.question[this.index].anecdote];
      this.notif.emitChange(message);
    }else{
      console.log('Faux');
      // On affiche le bandeau en rouge avec l'anecdote (mauvaise reponse)
      const message = [0, ' '+ this.question[this.index].anecdote];
      this.notif.emitChange(message);
    }
    
    // On passe a la question prochaine
    this.index ++ ;
    console.log(this.radioSelected);
    console.log(this.index);

    // On arrive vers la fin du quiz
    if (this.index === 5){
      this.finQuiz = true ;
      
      // On arrete le temps
      this.pauseTimer();

      // On envoie Une requete pour calculer le Score et inserer dans l'historique
      this.getScore();
    }
  }

  // Elle permet de lancer le timer 
  startTimer(): void{
    this.interval = setInterval(() => {
      this.timeLeft++;
    }, 1000);
  }
  
  // Elle permet d'arreter le timer 
  pauseTimer(): void{
    clearInterval(this.interval);
  }

  // Elle recupere le score renvoié du serveur
  getScore(): void{
    this.quiz.getScore(this.timeLeft, +this.level, this.nmbrBonneRep).subscribe(
      (data: any) => {
          if (data.insert){
            this.score = data.score;
            // On affiche le bandeau en vert succes de MAJ historique
            const message = [1, ' Votre Historique est mis a jour'];
            this.notif.emitChange(message);
          }else{
            this.score = 'error';
            // On affiche le bandeau en rouge problme de MAJ historique
            const message = [0, ' Probleme de MAJ'];
            this.notif.emitChange(message);
          }
      },
      (error: any) => {
        console.log(error);
        const message = [0, ' connexion echoué'];
        this.notif.emitChange(message);
      }
    );
  }

}
