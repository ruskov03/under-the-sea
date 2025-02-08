import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderwaterInterfaceComponent } from './underwater-interface.component';

describe('UnderwaterInterfaceComponent', () => {
  let component: UnderwaterInterfaceComponent;
  let fixture: ComponentFixture<UnderwaterInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderwaterInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderwaterInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
