import { Component } from '@angular/core';
import { UnderwaterSceneComponent } from '@app/components/underwater-scene/underwater-scene.component';

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [UnderwaterSceneComponent],
})
export class GamePageComponent {}
