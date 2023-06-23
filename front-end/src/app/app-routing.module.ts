import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GitHistoryComponent } from './git-history/git-history.component';
import { HomeComponent } from './home/home.component';
import { WowComponent } from './wow/wow.component';
import { LoginComponent } from './login/login.component';
import { MinecraftComponent } from './minecraft/minecraft.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'wow', component: WowComponent },
  { path: 'git', component: GitHistoryComponent },
  { path: 'minecraft', component: MinecraftComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
