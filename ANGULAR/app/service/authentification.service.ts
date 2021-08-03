import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, Subscriber, Subject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { User } from '../interfaces/user';
import { Historique } from '../interfaces/historique';


@Injectable()
export class Authentification{

    isConnected!: boolean ;
    date: any ;
    public dateObservable = new Subject<string>(); // observable pour la date
    public connexionObservable = new Subject<boolean>(); // observable pour la date


    constructor(private _http: HttpClient) {
    }


    IsLogged(): boolean {
        if (localStorage.getItem('user')) {
            return true;
        }
        else {
            return false;
        }
    }

    // Service Authentification : création d’un observable utilisant le service httpClient et la méthode get également observable
    // la méthode renvoie un observable principal et un booléen en données
    VerifyId(user: string, password: string): Observable<boolean> {
        let trueId = false;

        // la méthode renvoie un observable et un booléen en données
        return Observable.create((observer: Subscriber<boolean>) => {
            this._http.post<any>('http://pedago.univ-avignon.fr:3015/login', {username : user, pwd : password}).subscribe(
                data => { // succes de l’observable httpClient
                    if (data.statusResp){
                        this.isConnected = true ;
                        localStorage.setItem('user', JSON.stringify(data));
                        // traitement de la date de derniere connexion
                        if(!localStorage.getItem(user)){
                            this.date = this.dateString(new Date());
                            localStorage.setItem(user, this.dateString(new Date())) ;
                        }else{
                            this.date = localStorage.getItem(user) ;
                            localStorage.setItem(user, this.dateString(new Date())) ;
                        }

                        // emmition de la date pour le appcomponent
                        this.dateObservable.next(this.date);

                        // emmition de l'etat de connexion pour le appcomponent
                        this.connexionObservable.next(this.isConnected);

                        trueId = true;
                    }
                    else{
                        this.isConnected = false ;
                        // emmition de l'etat de connexion pour le appcomponent
                        this.connexionObservable.next(this.isConnected);
                        trueId = false;
                    }
                },
                error => {// erreur de l’observable httpClient
                    console.error('une erreur est survenue!', error);
                    trueId = false;
                },
                () => {// terminaison de l’observable httpClient
                    observer.next(trueId); // renvoi des données pourl’observable principal
                }
            );
        });
    }
    
    // elle permet d'envoyer une requete a fin de changer l'etat de connexion
    logout(): void{
        this._http.get<any>('http://pedago.univ-avignon.fr:3015/logout').subscribe(
            data => {
                // on supprime le user du Local Storage
                localStorage.removeItem('user');
                this.isConnected = false ;
                // emmition de l'etat de connexion pour le appcomponent
                this.connexionObservable.next(this.isConnected);
            },
            error => { console.log(error); }
        );
    }

    // elle permet d'envoyer une requete a fin d'avoir le profile du user connecté
    // elle retourne un objet de type User (inetrface)
    getProfile(): any{
        return this._http.get<User>('http://pedago.univ-avignon.fr:3015/getProfile');
    }

    // elle permet d'envoyer une requete a de mettre a jour le profile (humeur & avatar)
    // elle retourne un objet qui contient le succes ou le non succes de la MAJ
    updateProfile(h: string, a: string): any{
        return this._http.post<any>('http://pedago.univ-avignon.fr:3015/updateProfile', {humeur : h, avatar : a});
    }

    // requetes pour avoir le score selon et  MAJ l'historique
    getHistorique(): any{
        return this._http.get<any>('http://pedago.univ-avignon.fr:3015/getHistorique');
    }

    // elle retourne la date de derniere connexion stocké dans le local storage
    getDateLocalStorgae(): any{
        if(this.IsLogged()){
            const userConnecter = JSON.parse(localStorage.getItem('user') || '{}'); // car getItem elle retourne string ou null
            const id = userConnecter.id;
            return(localStorage.getItem(id));
        }else{
            return '';
        }
    }

    // conversion date en string 
    dateString(date: any): string {
        return date.getFullYear()
                  + '-' + this.leftpad(date.getMonth() + 1, 2)
                  + '-' + this.leftpad(date.getDate(), 2)
                  + ' ' + this.leftpad(date.getHours(), 2)
                  + ':' + this.leftpad(date.getMinutes(), 2)
                  + ':' + this.leftpad(date.getSeconds(), 2);
      }
      
      leftpad(val: any, resultLength = 2, leftpadChar = '0'): string {
        return (String(leftpadChar).repeat(resultLength)
              + String(val)).slice(String(val).length);
      }

}
