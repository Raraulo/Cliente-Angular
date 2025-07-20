import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GranjaComponent } from './granja.component';

describe('GranjaComponent', () => {
  let component: GranjaComponent;
  let fixture: ComponentFixture<GranjaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GranjaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GranjaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
