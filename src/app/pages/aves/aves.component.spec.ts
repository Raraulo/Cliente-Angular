import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvesComponent } from './aves.component';

describe('AvesComponent', () => {
  let component: AvesComponent;
  let fixture: ComponentFixture<AvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
