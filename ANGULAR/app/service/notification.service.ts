
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Ce service grere les nofication car on ne peut pas input des event dans un router-outlet (SPA)
@Injectable()
export class Notification{

    // Observable string sources
    private emitChangeSource = new Subject<any>();
    // Observable string streams
    changeEmitted$ = this.emitChangeSource.asObservable();
    // emission des informations de notification a chaque changement
    emitChange(change: any) {
        this.emitChangeSource.next(change);
    }


}