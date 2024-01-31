import { Injectable, TemplateRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";

type StepStatus = "inactive" | "visited" | "completed";

export class Step {
  id: string;
  title: string;
  skippable?: boolean;
  status: StepStatus;
  // active?: boolean;
  // content: TemplateRef<any>;

  constructor(
    title: string,
    // content: TemplateRef<any>,
    skippable?: boolean,
    status: StepStatus = "inactive",
  ) {
    this.title = title;
    this.skippable = skippable;
    this.status = status;
    this.id = this.uid();
    // this.content = content;
  }
  private uid() {
    return "id-" + Date.now().toString(36) +
      Math.random().toString(36).substring(2);
  }
}

@Injectable()
export class StepperService {
  private _steps: Step[] = [];
  private __currentStepIndex: number = 0;
  private _activeStepId = new BehaviorSubject<string | null>(null);
  public readonly activeStepId$ = this._activeStepId.asObservable();
  private _canGoNext = new BehaviorSubject<boolean>(false);
  public readonly canGoNext$ = this._canGoNext.asObservable();

  private updateCanGoNext() {
    this._canGoNext.next(this.canGoTo(this._currentStepIndex + 1));
    console.log("can go next :: ", this._canGoNext.value);
  }

  private get _currentStepIndex() {
    return this.__currentStepIndex;
  }
  private set _currentStepIndex(idx: number) {
    this.__currentStepIndex = idx;
    this._activeStepId.next(this.currentStep.id);
    this.updateCanGoNext();
  }

  get activeStepId() {
    return this.currentStep.id;
  }

  get currentStep() {
    return this._steps[this._currentStepIndex];
  }
  get totalSteps() {
    return this._steps.length;
  }
  linear = true;

  addStep(step: Step) {
    // HACK: to send the changes of activeStepId via rxjs
    if (this.totalSteps === 1) this._currentStepIndex = 0;
    step.status = this.totalSteps ? "inactive" : "visited";
    this._steps.push(step);
  }

  removeStep(stepId: string) {
    this._steps = this._steps.filter((step) => step.id !== stepId);

    this._currentStepIndex = Math.min(
      this._currentStepIndex,
      this.totalSteps - 1,
    );
  }

  completeStep(stepId: string) {
    const stepIndex = this._steps.findIndex((step) => step.id === stepId);
    if (stepIndex === -1) {
      console.warn("cant find index to complete step");
      return;
    }
    this._steps[stepIndex].status = "completed";
    this.updateCanGoNext();
  }

  get steps(): Step[] {
    return this._steps;
  }

  private canGoTo(index: number): boolean {
    if (index < 0 || index >= this.totalSteps) {
      return false;
    }
    if (!this.linear) {
      return true;
    }
    // In a linear stepper, ensure all previous steps are completed
    return this._steps.slice(0, index - 1).every((step) =>
      step.status === "completed" ||
      (step.skippable && step.status === "visited")
    );
  }

  get canGoNext(): boolean {
    return this.canGoTo(this._currentStepIndex + 1);
  }

  get canGoPrevious(): boolean {
    return this.canGoTo(this._currentStepIndex - 1);
  }

  // setActiveStep() {
  //   this._steps.forEach((step) => {
  //     step.active = this.currentStep == step;
  //   });
  // }

  goTo(index: number) {
    if (!this.canGoTo(index)) return;

    this._currentStepIndex = index;
    this.updateStepStatus(index, "visited");
    // this.setActiveStep();
  }

  next() {
    if (!this.canGoNext) return;
    let nextStepIndex = this._currentStepIndex + 1;

    this.updateStepStatus(nextStepIndex, "visited");

    this.goTo(nextStepIndex);
  }

  previous() {
    if (!this.canGoPrevious) return;
    let prevStepIndex = this._currentStepIndex - 1;
    this.goTo(prevStepIndex);
  }

  skip() {
    if (this.currentStep.skippable) {
      this.next();
    }
  }

  get completed(): boolean {
    return this._steps.every((step) =>
      step.status === "completed" ||
      (step.status === "visited" && step.skippable)
    );
  }

  get isFirstStep(): boolean {
    return this._currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this._currentStepIndex === this.totalSteps - 1;
  }

  updateStepStatus(
    index: number,
    status: StepStatus,
  ) {
    if (index < 0 || index >= this.totalSteps) return;
    if (status === "visited" && this._steps[index].status !== "inactive") {
      return;
    }
    this._steps[index].status = status;
  }
}
