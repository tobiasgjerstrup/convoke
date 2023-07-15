import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { WowComponent } from './wow/wow.component';
import { Toasts } from './toasts.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GitHistoryComponent } from './git-history/git-history.component';
import { LoginComponent } from './login/login.component';
import { MinecraftComponent } from './minecraft/minecraft.component';
import { WowResourcesComponent } from './wow-resources/wow-resources.component';
import { DiscordComponent } from './discord/discord.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WowComponent,
    GitHistoryComponent,
    LoginComponent,
    MinecraftComponent,
    WowResourcesComponent,
    DiscordComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    Toasts

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
