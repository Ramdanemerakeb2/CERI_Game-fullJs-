import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {SimpleNotificationsModule} from 'angular2-notifications';

import {Authentification} from './service/authentification.service';
import {Notification} from './service/notification.service';
import {Quiz} from './service/quiz.service';

import { QuizComponent } from './quiz/quiz.component';
import { Routes, RouterModule } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { ProfileComponent } from './profile/profile.component';
import { QuestionsComponent } from './questions/questions.component';

const routes: Routes = [
  {path: 'quiz', component: QuizComponent},
  {path: 'quiz/:theme/:level', component: QuestionsComponent},
  {path: 'login', component: LoginComponent},
  {path: 'accueil', component: AccueilComponent},
  {path: 'profile', component: ProfileComponent},
  {path: '', component: AccueilComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    QuizComponent,
    AccueilComponent,
    ProfileComponent,
    QuestionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    SimpleNotificationsModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    Authentification ,
    HttpClientModule,
    Notification,
    Quiz
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
