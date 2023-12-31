import { Injectable } from '@angular/core';
import {
    Resolve
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {HttpService} from "../services/http.service";
import { AuthenticationService } from 'app/src/services/authentication.service';
import { tenantResolverModel } from 'app/src/models/resolvers/tenantResolverModel';
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TenantsResolver implements Resolve<boolean> {
  dataModel: tenantResolverModel = new tenantResolverModel();

  constructor(
    private httpService: HttpService,
    private authenticationService: AuthenticationService
  ) {}

  resolve(): Observable<boolean> {
    if (this.authenticationService.session.role === 'admin') {
      return this.httpService.requestTenantsResource().pipe(
        map((response: tenantResolverModel) => {
          this.dataModel = response;
          return true;
        }),
        catchError(() => {
          return of(true);
        })
      );
    }
    return of(true);
  }
}
