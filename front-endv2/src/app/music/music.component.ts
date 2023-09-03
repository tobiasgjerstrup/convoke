import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpService } from '../../services/http-service.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { playlist, song } from 'src/interfaces/music';
import { Obj } from '@popperjs/core';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss'],
})
export class MusicComponent {
  constructor(
    private httpService: httpService,
    private modalService: NgbModal
  ) {}

  closeResult = '';
  playlists = Array();
  selectedPlaylist: playlist = {
    id: 0,
    name: '',
    createdOn: '',
    lastModifiedOn: '',
    lastModifiedBy: '',
    createdBy: '',
    active: 0,
  };
  modalSongs = Array();
  newSong: song = {
    id: 0,
    playlist: 0,
    name: '',
    url: '',
    addedOn: '',
    lastModifiedOn: '',
    lastModifiedBy: '',
    addedBy: '',
    active: 1,
  };

  ngOnInit() {
    this.getPlaylists();
  }

  getPlaylists() {
    this.httpService
      .get(environment.apiUrl + 'api/v1/music/playlists?active=1')
      .subscribe((response) => {
        this.playlists = response.data;
      });
  }

  getSongs(playlistID: number) {
    this.httpService
      .get(
        environment.apiUrl +
          'api/v1/music/songs?active=1&playlist=' +
          playlistID
      )
      .subscribe((response) => {
        if (response.statuscode === 200) {
          this.modalSongs = response.data;
        } else {
          this.modalSongs = Array();
        }
      });
  }

  open(content: object, playlist: playlist) {
    this.selectedPlaylist = playlist;
    this.getSongs(playlist.id);
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'Save click') {
            this.saveFields();
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  saveFields() {
    this.modalSongs.forEach((song) => {
      if (song.id > 0) {
        // if id is over 0 it already exists so put instead of post
        this.httpService
          .put(environment.apiUrl + 'api/v1/music/songs', {
            id: song.id,
            name: song.name,
            url: song.url,
            active: song.active,
          })
          .subscribe((response) => {
            console.log(response);
          });
      } else {
        this.httpService
          .post(environment.apiUrl + 'api/v1/music/songs', {
            name: song.name,
            url: song.url,
            playlist: this.selectedPlaylist.id,
            active: song.active,
          })
          .subscribe((response) => {
            console.log(response);
          });
      }
    });
  }

  updateField(type: string, id: number, event: any) {
    this.modalSongs.forEach((song) => {
      if (song.id === id) {
        if (type === 'name') song.name = event.target.value;
        if (type === 'url') song.url = event.target.value;
      }
    });
  }

  addToField(type: string, event: any) {
    this.newSong.id = Math.floor(Math.random() * 100000000 + 1) * -1;
    if (type === 'name') this.newSong.name = event.target.value;
    if (type === 'url') this.newSong.url = event.target.value;
    if (event.key === 'Enter' || type === 'add') {
      this.modalSongs.push(structuredClone(this.newSong));
      this.newSong.id = 0;
    }
  }

  deactivateSong(song: song) {
    this.modalSongs.forEach((_song) => {
      if (_song.id === song.id) {
        _song.active = 0;
      }
    });
  }

  reactivateSong(song: song) {
    this.modalSongs.forEach((_song) => {
      if (_song.id === song.id) {
        _song.active = 1;
      }
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
