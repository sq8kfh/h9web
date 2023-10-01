import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawframeComponent } from './rawframe.component';

describe('RawframeComponent', () => {
  let component: RawframeComponent;
  let fixture: ComponentFixture<RawframeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RawframeComponent]
    });
    fixture = TestBed.createComponent(RawframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
