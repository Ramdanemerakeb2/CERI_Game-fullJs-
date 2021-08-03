import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, Subscriber, Subject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Question } from '../interfaces/question';


@Injectable()
export class Quiz{

    listTheme: any ;
    constructor(private http: HttpClient) {
    }

    // requetes pour avoir tout les themes
    getAllThemes(): void{
        this.http.get<any>('http://pedago.univ-avignon.fr:3015/getAllThemes').subscribe(
            data => {
                localStorage.setItem('theme', JSON.stringify(data)) ;
                this.listTheme = data ;
            },
            error => { console.log(error); }
        );
    }

    // requetes pour avoir le quiz selon le theme en prennant en compte le niveau 
    getQuizByTheme(t: string, l: number): Observable<Question[]>{
        return this.http.post<Question[]>('http://pedago.univ-avignon.fr:3015/getQuizByTheme', {theme : t, level : l});
    }
    

    // requetes pour avoir le score selon et  MAJ l'historique
    getScore(temps: number, niveau: number, rep: number): any{
        return this.http.post<any>('http://pedago.univ-avignon.fr:3015/getScore', {time : temps, level : niveau, nbrRep: rep});
    }

}
