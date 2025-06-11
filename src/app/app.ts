import { Component } from '@angular/core'
import { ThemeToggleComponent } from '@/components/theme-toggle'
import { GithubLinkComponent } from '@/components/github-link'
import { KanbanComponent } from '@/components/kanban'

@Component({
  selector: 'app-root',
  imports: [ThemeToggleComponent, GithubLinkComponent, KanbanComponent],
  template: `
    <div class="relative font-sans antialiased">
      <div class="flex flex-col gap-8 max-w-5xl mx-auto h-svh p-6 md:p-12">
        <div class="flex gap-3 items-center">
          <app-github-link />
          <app-theme-toggle />
        </div>
        <app-kanban />
      </div>
    </div>
  `,
})
export class AppComponent {}
