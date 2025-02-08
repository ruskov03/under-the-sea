import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderwaterSceneComponent } from './underwater-scene.component';

describe('UnderwaterSceneComponent', () => {
  let component: UnderwaterSceneComponent;
  let fixture: ComponentFixture<UnderwaterSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderwaterSceneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderwaterSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
