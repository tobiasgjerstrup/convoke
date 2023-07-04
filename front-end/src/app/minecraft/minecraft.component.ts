import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-minecraft',
  templateUrl: './minecraft.component.html',
  styleUrls: ['./minecraft.component.scss'],
})
export class MinecraftComponent {
  players = [
    {
      id: '',
      name: '',
      blocks_mined: '',
      mobs_killed: '',
      time_played: '',
      items_broken: '',
      items_dropped: '',
      items_picked_up: '',
      items_used: '',
      items_crafted: '',
    },
  ];
  chatlog = 'test';
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, public toastService: ToastService) {}

  ngOnInit() {
    this.http.get<any>(this.apiUrl + 'api/v1/minecraft/players?').subscribe((players) => {
      players.data.forEach((player: ConcatArray<{ id: string; name: string; blocks_mined: string; mobs_killed: string; time_played: string; items_broken: string; items_dropped: string; items_picked_up: string; items_used: string; items_crafted: string }>) => {
        this.players = this.players.concat(player);
      });

      console.log(this.players);
    });

    /* this.http.get<any>(this.apiUrl + 'api/v1/minecraft/chatlog?').subscribe((res) => {
      console.log(this.chatlog);
      this.chatlog = res.data
      console.log(this.chatlog);
    }); */
  }
}
