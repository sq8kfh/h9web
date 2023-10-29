import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntennaSwitchComponent } from './antenna-switch.component';

describe('AntennaSwitchComponent', () => {
  let component: AntennaSwitchComponent;
  let fixture: ComponentFixture<AntennaSwitchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AntennaSwitchComponent]
    });
    fixture = TestBed.createComponent(AntennaSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
