import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-git-history',
  templateUrl: './git-history.component.html',
  styleUrls: ['./git-history.component.scss']
})
export class GitHistoryComponent {
  commits = [{
    name: '',
    date: '',
    message: '',
    url: '',
    additions: '',
    deletions: '',
    changed_files: '',
    type: ''
  }]
  apiUrl = environment.apiUrl

  constructor(private http: HttpClient, public toastService: ToastService) { }

  ngOnInit() {
    this.http.get<any>(this.apiUrl+'api/v2/?table=gitcommits&order=date').subscribe(commits => {
      commits.forEach((commit: ConcatArray<{ name: string; date: string; message: string; url: string; additions: string; deletions: string; changed_files: string; type: string; }>) => {
        this.commits = this.commits.concat(commit)
      });
      this.commits.splice(0, 1)
      this.commits.forEach(element => {
        if (element.message.includes('Merge pull request'))
          element.type = 'pull request';
          else 
          element.type = 'commit'
      });
      console.log(this.commits)
    });
  }
}
