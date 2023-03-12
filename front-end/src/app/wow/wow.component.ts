import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-wow',
  templateUrl: './wow.component.html',
  styleUrls: ['./wow.component.scss']
})
export class WowComponent {

  items = [{ id: null, name: null, icon: null }]

  constructor(private http: HttpClient, public toastService: ToastService) { }

  search(event: any) {
    this.http.get<any>('https://convoke.uk/api/v1/$count=true$search=' + event.target.value).subscribe(count => {
      console.log(count[0].count)
      if (count[0].count > 10000) {
        this.showDanger("Found " + count[0].count + " Items" + " Limit is 10000")
        this.showSuccess("Showing 10000 Items")
      } else if (count[0].count > 0)
        this.showSuccess("Found " + count[0].count + " Items")
      else
        this.showDanger("Your search gave 0 results")

      this.http.get<any>('https://convoke.uk/api/v1/$limit=1000$order=asc$search=' + event.target.value).subscribe(data => {
        this.items = data
        if (count[0].count > 1000) {
          this.http.get<any>('https://convoke.uk/api/v1/$limit=9000$order=asc$offset=1000$search=' + event.target.value).subscribe(extraData => {
            this.items = this.items.concat(extraData)
          });
        }
      });
    });
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
}
