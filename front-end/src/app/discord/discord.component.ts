import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from '../services/toast.service';
import { AllPropertiesString } from './interfaces';

@Component({
  selector: 'app-discord',
  templateUrl: './discord.component.html',
  styleUrls: ['./discord.component.scss'],
})
export class DiscordComponent {
  constructor(private http: HttpClient, public toastService: ToastService) {}

  playlistUpdate = {
    playlist: '',
    song: '',
  };
  playlists: AllPropertiesString = <AllPropertiesString>{};
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.updatePlaylists();
  }

  updatePlaylists() {
    this.http.get<any>(this.apiUrl + 'api/v1/discordbot/playlists?').subscribe((playlists) => {
      this.playlists = playlists.data;
    });
  }

  updateField(value: string, event: any) {
    if (event.key === 'Enter') {
      if (this.playlistUpdate.playlist && this.playlistUpdate.song) {
        this.http.post<any>(this.apiUrl + 'api/v1/discordbot/playlist/post', this.playlistUpdate).subscribe((data) => {
          console.log(data);
          this.updatePlaylists();
        });
      }
    } else {
      if (value === 'playlist') this.playlistUpdate.playlist = event.target.value;
      else this.playlistUpdate.song = event.target.value;
    }
  }
}
