import {
  AfterContentChecked,
  Component,
  Input,
  TemplateRef,
} from "@angular/core";
import { StepperService } from "../../services/stepper.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-step",
  templateUrl: "./step.component.html",
  styleUrls: ["./step.component.scss"],
})
export class StepComponent {
  @Input()
  title!: string;
  @Input()
  headerTemplate!: TemplateRef<any>;

  isActive: boolean = false;

  private _skippable: boolean = false;
  private _id: string = "";
  private subscriptions = new Subscription();

  get id() {
    return this._id;
  }
  set id(newId: string) {
    if (this._id !== "") return;
    this._id = newId;
  }

  @Input()
  set skippable(value: boolean | string) {
    this._skippable = value === "" || value === true || value === "true";
  }

  get skippable(): boolean {
    return this._skippable;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.stepperService.activeStepId$.subscribe((activeStepId) => {
        this.isActive = activeStepId === this.id;
        if (this.isActive) {
          this.completeStep();
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  private completeStep() {
    if (this.id) {
      this.stepperService.completeStep(this.id);
    }
  }

  // @ContentChild("stepContent", { static: true })
  // contentTemplate!: TemplateRef<any>;
  // @ViewChild("contentRef") contentRef!: TemplateRef<any>;

  constructor(private stepperService: StepperService) {
  }
}
