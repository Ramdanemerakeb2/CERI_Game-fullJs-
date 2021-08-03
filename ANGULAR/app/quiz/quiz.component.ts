import { Component, OnInit } from '@angular/core';
import { Quiz } from '../service/quiz.service';


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  
  selectedTheme!: string;
  selectedNiveau!: string; // car on l'initialise pas
  // tableau de difficulté 
  niveau = [
    { name: 'Facile', value: 1 },
    { name: 'Moyen', value: 2 },
    { name: 'Difficile', value: 3 }
  ];

  constructor(public quiz: Quiz) { }

  ngOnInit(): void {
    this.quiz.getAllThemes();
  }

  print(): void{
    console.log(this.selectedTheme);
    console.log(this.selectedNiveau);
    // this.quiz.getQuizByTheme(this.selectedTheme, +this.selectedNiveau);
  }

}
