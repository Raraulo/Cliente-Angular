import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PequenosComponent } from './pequenos.component';

describe('PequenosComponent', () => {
  let component: PequenosComponent;
  let fixture: ComponentFixture<PequenosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PequenosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PequenosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
