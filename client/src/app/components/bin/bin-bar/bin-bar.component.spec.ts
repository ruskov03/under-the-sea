import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinBarComponent } from './bin-bar.component';

describe('BinBarComponent', () => {
  let component: BinBarComponent;
  let fixture: ComponentFixture<BinBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
