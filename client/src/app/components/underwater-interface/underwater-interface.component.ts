import { Component } from '@angular/core';
import { UnderwaterSceneComponent } from '../underwater-scene/underwater-scene.component';

@Component({
  selector: 'app-underwater-interface',
  standalone: true,
  imports: [UnderwaterSceneComponent],
  templateUrl: './underwater-interface.component.html',
  styleUrl: './underwater-interface.component.scss'
})
export class UnderwaterInterfaceComponent {

}
