import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { WildShape } from '../wild-shape.model';
import { WildShapeService } from '../wild-shape.service';

@Component({
  selector: 'app-wild-shape-list',
  templateUrl: './wild-shape-list.html',
  styleUrl: './wild-shape-list.css'
})
export class WildShapeList implements OnInit {
  private wildShapeService = inject(WildShapeService);

  readonly abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

  // Signals hold the screen's state; the template re-renders when they change
  wildShapes = signal<WildShape[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  search = signal('');

  // Recalculated automatically whenever wildShapes or search changes
  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.wildShapes();
    return this.wildShapes().filter((ws) =>
      ws.name.toLowerCase().includes(term) ||
      ws.creatureType.toLowerCase().includes(term) ||
      ws.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  // Ask the service for the data as soon as the component loads
  ngOnInit(): void {
    this.wildShapeService.getWildShapes().subscribe({
      next: (data) => {
        this.wildShapes.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 401
          ? 'Your session has ended. Please log in again.'
          : 'Could not load your Wild Shapes. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  // Ability score -> modifier text, e.g. 15 -> "+2"
  modifier(score: number): string {
    const mod = Math.floor((score - 10) / 2);
    return (mod >= 0 ? '+' : '') + mod;
  }
}