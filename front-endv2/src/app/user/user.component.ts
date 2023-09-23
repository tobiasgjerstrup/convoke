import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { httpService } from 'src/services/http-service.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  users: any;
  selectedUser: any;
  closeResult = '';

  constructor(
    private httpService: httpService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.httpService
      .get(environment.apiUrl + 'api/v1/user/users')
      .subscribe((response) => {
        this.users = response.data;
        console.log(response);
        console.log(this.users);
      });
  }

  fieldFocused(value: string, event: any) {
    event.target.value = value;
  }

  updateField(type: string, id: number, event: any) {
    console.log(type);
    console.log(id);
    console.log(event);
  }

  addToField(type: string, event: any) {
    if (type === 'nickname') this.selectedUser.nickname = event.target.value;
  }

  open(content: object, user: any) {
    this.selectedUser = user;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'Save click') {
            this.saveFields();
          } else if (result === 'Delete click') {
            // this.deactivatePlaylist();
          } else if (result === 'History click') {
            this.httpService
              .get(
                environment.apiUrl +
                  'api/v1/music/playlists/history?id=' +
                  this.selectedUser.id
              )
              .subscribe((response: any) => {
                if (response.statuscode === 200) {
                }
              });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  saveFields() {
    this.httpService
      .put(environment.apiUrl + 'api/v1/user/users', {
        id: this.selectedUser.id,
        nickname: this.selectedUser.nickname,
      })
      .subscribe((response) => {
        console.log(response);
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
