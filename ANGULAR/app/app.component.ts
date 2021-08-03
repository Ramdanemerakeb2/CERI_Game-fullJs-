import { Component, OnInit } from '@angular/core';
import {Authentification} from './service/authentification.service';
import {Notification} from './service/notification.service';
import {NotificationsService} from 'angular2-notifications';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'CERIGame';
  dateConnexion: any ;
  etatConnection: boolean;

  constructor(private auth: Authentification,
              private service: NotificationsService,
              private notif: Notification){ // Injection du service dans le constructeur du composant
    
    // subscribe aux observable (date , isConnected)
    this.auth.dateObservable.subscribe(value => {
      this.dateConnexion = value;
    });

    this.auth.connexionObservable.subscribe(value => {
      this.etatConnection = value;
    });

    // la notification change en fonction d'etat de la connection
    notif.changeEmitted$.subscribe(
      text => {
          if (text[0] === 1){ // 1 success
            this.OnSuccess(text[1].substring(1));
          }else if (text[0] === 0){ // 0 error
            this.OnError(text[1].substring(1));
          }
      });

  }

  ngOnInit(): void {

    this.etatConnection = this.auth.IsLogged();
    this.dateConnexion = this.auth.getDateLocalStorgae();
  }

  logout(): void{
    this.auth.logout();
  }

  // elle permet d'aficher la notification Success avec le message passer en argument
  OnSuccess(message: string): void{
    this.service.success('Success', message, {
      position: ['bottom', 'right'],
      timeOut: 5000,
      animate: 'fade',
      showProgressBar: true
    });
  }

  // elle permet d'aficher la notification error avec le message passer en argument
  OnError(message: string): void{
    this.service.error('Error', message, {
      position: ['bottom', 'right'],
      timeOut: 5000,
      animate: 'fade',
      showProgressBar: true
    });
  }

}
