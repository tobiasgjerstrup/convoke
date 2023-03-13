import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-git-history',
  templateUrl: './git-history.component.html',
  styleUrls: ['./git-history.component.scss']
})
export class GitHistoryComponent {
  commits = [{
    name: null,
    date: null,
    message: null,
    url: null,
    additions: null,
    deletions: null,
    changed_files: null
  }]

  constructor(private http: HttpClient, public toastService: ToastService) { }

  ngOnInit() {
    this.http.get<any>('http://localhost:8080/api/v1/$table=gitcommits$order=date').subscribe(commits => {
      commits.forEach((commit: ConcatArray<{ name: null; date: null; message: null; url: null; additions: null; deletions: null; changed_files: null; }>) => {
        this.commits = this.commits.concat(commit)
      });
      this.commits.splice(0, 1)
    });
  }
}