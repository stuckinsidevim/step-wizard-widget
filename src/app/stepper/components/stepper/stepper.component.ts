import {
  AfterContentInit,
  Component,
  ContentChildren,
  OnDestroy,
  QueryList,
} from "@angular/core";
import { Step, StepperService } from "../../services/stepper.service";
import { StepComponent } from "../step/step.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-stepper",
  templateUrl: "./stepper.component.html",
  styleUrls: ["./stepper.component.scss"],
})
export class StepperComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(StepComponent)
  stepComponents!: QueryList<StepComponent>;
  private subscriptions = new Subscription();
  canGoNext = false;

  constructor(public stepperService: StepperService) {}

  ngAfterContentInit() {
    this.stepComponents.forEach((stepComponent) => {
      const step = new Step(
        stepComponent.title,
        // stepComponent.contentRef,
        stepComponent.headerTemplate,
        stepComponent.skippable,
      );
      this.stepperService.addStep(step);
      stepComponent.id = step.id;
    });
    this.subscriptions.add(
      this.stepperService.canGoNext$.subscribe((canGoNext) => {
        this.canGoNext = canGoNext;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
