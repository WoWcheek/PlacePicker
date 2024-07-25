import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

import type { Place } from './place.model';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  private fetchPlaces(url: string, errorMessage?: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((res) => res.places),
      catchError(() => {
        this.errorService.showError(errorMessage || '');
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching available places :('
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places :('
    ).pipe(
      tap({
        next: (places) => this.userPlaces.set(places),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError(() => {
          const errMessage =
            'Something went wrong adding place to favorites :(';
          this.userPlaces.set(prevPlaces);
          this.errorService.showError(errMessage);
          return throwError(() => new Error(errMessage));
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if (prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter((x) => x.id !== place.id));
    }

    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError(() => {
          const errMessage =
            'Something went wrong removing place from favorites :(';
          this.userPlaces.set(prevPlaces);
          this.errorService.showError(errMessage);
          return throwError(() => new Error(errMessage));
        })
      );
  }
}
