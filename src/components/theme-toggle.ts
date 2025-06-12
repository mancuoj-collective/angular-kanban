import { Component, computed, effect, signal } from '@angular/core'
import { ButtonModule } from 'primeng/button'

const STORAGE_KEY = 'angular-tmpl-kanban-theme'

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      [icon]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"
      (click)="toggle()"
      rounded="true"
      text="true"
      ariaLabel="Toggle theme"
    />
  `,
})
export class ThemeToggleComponent {
  theme = signal(
    localStorage.getItem(STORAGE_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )
  isDark = computed(() => this.theme() === 'dark')

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this.theme())
      if (this.isDark()) {
        document.documentElement.classList.add('p-dark')
      } else {
        document.documentElement.classList.remove('p-dark')
      }
    })
  }

  toggle() {
    this.theme.set(this.isDark() ? 'light' : 'dark')
  }
}
