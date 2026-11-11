import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WildShape } from './wild-shape.model';

// Talks to the Express JSON API. The Angular app is served by the same
// Express server, so a relative URL is enough, and the browser sends the
// Passport session cookie with every request automatically.
@Injectable({ providedIn: 'root' })
export class WildShapeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/wildshapes';

  // HTTP GET /api/wildshapes -> the logged-in user's Wild Shapes
  getWildShapes(): Observable<WildShape[]> {
    return this.http.get<WildShape[]>(this.apiUrl);
  }
}