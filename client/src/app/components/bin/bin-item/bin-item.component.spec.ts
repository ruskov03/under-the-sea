import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinItemComponent } from './bin-item.component';

describe('BinItemComponent', () => {
  let component: BinItemComponent;
  let fixture: ComponentFixture<BinItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
