import { Injectable } from "@angular/core";

type StepStatus = "inactive" | "visited" | "completed";

export class Step {
  private _id = "";
  title: string;
  skippable?: boolean;
  status: StepStatus;

  constructor(
    title: string,
    skippable?: boolean,
    status: StepStatus = "inactive",
  ) {
    this.title = title;
    this.skippable = skippable;
    this.status = status;
  }
  get id() {
    if (this._id !== "") return this._id;
    return "id-" + Date.now().toString(36) +
      Math.random().toString(36).substring(2);
  }
}

@Injectable()
export class StepperService {
  private _steps: Step[] = [];
  private _currentStepIndex = 0;

  get currentStep() {
    return this._steps[this._currentStepIndex];
  }
  get totalSteps() {
    return this._steps.length;
  }
  linear = true;

  addStep(step: Step) {
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
    if (stepIndex === -1) return;
    this._steps[stepIndex].status = "completed";
  }

  getSteps(): Step[] {
    return this._steps;
  }

  canGoTo(index: number): boolean {
    if (index < 0 || index >= this.totalSteps) {
      return false;
    }
    if (!this.linear) {
      return true;
    }
    // In a linear stepper, ensure all previous steps are completed
    return this._steps.slice(0, index).every((step) =>
      step.status === "completed" ||
      (step.skippable && step.status === "visited")
    );
  }

  goTo(index: number) {
    if (!this.canGoTo(index)) return;

    this._currentStepIndex = index;
    this.updateStepStatus(index, "visited");
  }

  next() {
    let nextStepIndex = this._currentStepIndex + 1;
    if (!this.canGoTo(nextStepIndex)) return;

    this.updateStepStatus(this._currentStepIndex, "completed");
    this.updateStepStatus(nextStepIndex, "visited");

    this.goTo(nextStepIndex);
  }

  previous() {
    let prevStepIndex = this._currentStepIndex - 1;
    if (!this.canGoTo(prevStepIndex)) return;
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

  // private get isFirstStep(): boolean {
  //   return this._currentStepIndex === 0;
  // }
  //
  // private get isLastStep(): boolean {
  //   return this._currentStepIndex === this.totalSteps - 1;
  // }
  //
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
