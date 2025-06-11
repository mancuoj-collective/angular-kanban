import { Component } from '@angular/core'
import { ButtonModule } from 'primeng/button'

@Component({
  selector: 'app-github-link',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <a
      href="https://github.com/mancuoj-collective/angular-tmpl-kanban"
      target="_blank"
      rel="noopener noreferrer"
      class="p-button"
    >
      <span class="pi pi-github"></span>
      GitHub
    </a>
  `,
})
export class GithubLinkComponent {}
