import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MusicComponent } from './music/music.component';
import { UserComponent } from './user/user.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'music', component: MusicComponent },
  { path: 'user', component: UserComponent },
];
