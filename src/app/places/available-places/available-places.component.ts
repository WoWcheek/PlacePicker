import {
  Component,
  signal,
  inject,
  DestroyRef,
  type OnInit,
} from '@angular/core';

import { PlacesService } from '../places.service';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import type { Place } from '../place.model';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  error = signal('');
  isLoadingPlaces = signal(true);
  places = signal<Place[] | undefined>(undefined);

  ngOnInit() {
    this.isLoadingPlaces.set(true);

    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => {
        this.places.set(places);
      },
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

  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService
      .addPlaceToUserPlaces(selectedPlace)
      .subscribe({});

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
