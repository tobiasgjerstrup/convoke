import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from '../services/toast.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-discord',
  templateUrl: './discord.component.html',
  styleUrls: ['./discord.component.scss'],
})
export class DiscordComponent {
  constructor(private http: HttpClient, public toastService: ToastService, private modalService: NgbModal) {}
  closeResult = '';
  playlistUpdate = {
    playlist: '',
    song: '',
  };
  // playlists: AllPropertiesString = <AllPropertiesString>{};
  playlists : any = [];
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.updatePlaylists();
  }

  updatePlaylists() {
    this.http.get<any>(this.apiUrl + 'api/v1/music/playlists?').subscribe((playlists) => {
      this.playlists = playlists.data;
    });
    console.log(this.playlists);
  }

  updateField(value: string, event: any) {
    if (event.key === 'Enter') {
      if (this.playlistUpdate.playlist && this.playlistUpdate.song) {
        this.http.post<any>(this.apiUrl + 'api/v1/discordbot/playlist/post', this.playlistUpdate).subscribe((data) => {
          this.showToast(data.statuscode, data.message);
          this.updatePlaylists();
        });
      }
    } else {
      if (value === 'playlist') this.playlistUpdate.playlist = event.target.value;
      else this.playlistUpdate.song = event.target.value;
    }
  }

  showToast(statuscode: string, message: string) {
    if (statuscode == '200') this.showSuccess(message);
    else this.showDanger(message);
  }

  showSuccess(message: string) {
    this.toastService.show(message, { classname: 'bg-success text-light', delay: 5000 });
  }

  showDanger(message: string) {
    this.toastService.show(message, { classname: 'bg-danger text-light', delay: 5000 });
  }

  ngOnDestroy(): void {
    this.toastService.clear();
  }

  removeSong() {
    if (this.playlistUpdate.playlist && this.playlistUpdate.song) {
      this.http.post<any>(this.apiUrl + 'api/v1/discordbot/playlist/delete', this.playlistUpdate).subscribe((data) => {
        this.showToast(data.statuscode, data.message);
        this.updatePlaylists();
      });
    }
  }

  open(content: any) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result: any) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason: any) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
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
