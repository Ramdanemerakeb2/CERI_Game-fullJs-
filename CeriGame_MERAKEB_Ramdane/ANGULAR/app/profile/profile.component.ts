import { Component, OnInit } from '@angular/core';

import {Authentification} from '../service/authentification.service';
import {Notification} from '../service/notification.service';

import { Historique } from '../interfaces/historique';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  nomPrenom!: string;
  avatar!: string;
  humeur!: string;
  dateNaissance!: string;
  
  constructor(private auth: Authentification, private notif: Notification) { }

  ngOnInit(): void {
    this.auth.getProfile().subscribe(
      (data: any) => {
          this.nomPrenom = data.nom_prenom;
          this.avatar = data.avatar;
          this.humeur = data.humeur ;
          this.dateNaissance = data.date_naissance;
      }
    );
   

  }

  update(): void{
    let message: [number, string];
    this.auth.updateProfile(this.humeur, this.avatar).subscribe(
      (data: any) => { // Succes
          if (data.update){
            // champs update revoié du server true
            message = [1, ' Profile est mis à jour !'];
            // on affiche la notif
            this.notif.emitChange(message);
          }else{
            message = [0, ' Probleme: Profile non mis à jour !'];
            this.notif.emitChange(message);
          }
      },
      (error: any) => {
        console.log(error);
        message = [0, 'Connexion echoué !']; 
        this.notif.emitChange(message);
      }
    );
  }

}


