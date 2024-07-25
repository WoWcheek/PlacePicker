import { Component, DestroyRef, inject, signal } from '@angular/core';

import { PlacesService } from '../places.service';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import type { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent {
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  error = signal('');
  isLoadingPlaces = signal(true);
  places = this.placesService.loadedUserPlaces;

  ngOnInit() {
    this.isLoadingPlaces.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({
      error: (error: Error) => {
        this.error.set(error.message);
      },
      complete: () => {
        this.isLoadingPlaces.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onRemoveUserPlace(place: Place) {
    const subscription = this.placesService.removeUserPlace(place).subscribe();

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
