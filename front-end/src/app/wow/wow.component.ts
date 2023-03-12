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

  search(event: any) { // without type info
    this.http.get<any>('https://convoke.uk/api/v1/$limit=1000$order=asc$search=' + event.target.value).subscribe(data => {
      this.items = data
      if (this.items.length > 0)
        this.showSuccess("Found " + this.items.length + " Items")
      else
        this.showDanger("Your search gave 0 results")

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
