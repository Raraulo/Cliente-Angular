import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinComponent } from './medicin.component';

describe('MedicinComponent', () => {
  let component: MedicinComponent;
  let fixture: ComponentFixture<MedicinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
