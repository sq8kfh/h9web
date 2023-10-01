import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendframeComponent } from './sendframe.component';

describe('SendframeComponent', () => {
  let component: SendframeComponent;
  let fixture: ComponentFixture<SendframeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendframeComponent]
    });
    fixture = TestBed.createComponent(SendframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
