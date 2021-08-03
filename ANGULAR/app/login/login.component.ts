import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import {Authentification} from '../service/authentification.service';
import {Notification} from '../service/notification.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  constructor(private _auth : Authentification,
              private router: Router,
              private notif: Notification){ // Injection du service dans le constructeur du composant
  }

  ngOnInit(): void {
  }


  login(form: NgForm): void {
    // récuperation des info saisi sur le formulaire
    console.log(form.value.identifiant);
    console.log(form.value.password);
    // un tableau qui contient l'etat de notification et le message 
    let message: [number, string];
    this._auth.VerifyId(form.value.identifiant, form.value.password).subscribe(
      data => {
        if (this._auth.IsLogged()){
          // Success
          message = [1, ' Bienvenue ' + form.value.identifiant]; 
          // On affiche la notification 
          this.notif.emitChange(message);
          // On le regerige vers la page du Quiz
          this.router.navigate(['quiz']);
         }else{
          // error 
          message = [0, ' identifiants incorect !']; // OK
          this.notif.emitChange(message);
        }
      },
      error => {
        console.log(error);
        message = [0, 'Connexion echoué !']; // OK
        this.notif.emitChange(message);
      }
      );
  }

}
