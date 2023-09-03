import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MusicComponent } from './music/music.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'music', component: MusicComponent },
];
