import { Component } from '@angular/core';
import { UnderwaterInterfaceComponent } from '@app/components/underwater-interface/underwater-interface.component';

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [UnderwaterInterfaceComponent],
})
export class GamePageComponent {}
