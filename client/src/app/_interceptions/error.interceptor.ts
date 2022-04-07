import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private route: Router, private toaster: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if(error){
          switch (error.status) {
          case 400:
            if(error.error.errors){
              const modelStateErrors = [];
              for(const key in error.error.errors){
                if(error.error.errors[key]) {
                  modelStateErrors.push(error.error.errors[key])
                }
              }
              throw modelStateErrors.flat();
            } else {
              this.toaster.error(error.message, error.status)
            }
              break;
            case 401:
              this.toaster.error(error.message, error.status)
              break;
            case 404:
              this.route.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExteas: NavigationExtras = {state: {error: error.error}}
              this.route.navigateByUrl('/server-error', navigationExteas)
              break;
          default:
            this.toaster.error('Something unexpected went wrong');
            console.log(error);
            break;
          }
        }
        return throwError(error);
        
      })
    )
  }
}
