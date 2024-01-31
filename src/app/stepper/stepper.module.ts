import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StepperComponent } from "./components/stepper/stepper.component";
import { StepperService } from "./services/stepper.service";
import { StepComponent } from "./components/step/step.component";

@NgModule({
  declarations: [
    StepperComponent,
    StepComponent,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    StepperService,
  ],
  exports: [
    StepperComponent,
    StepComponent,
  ],
})
export class StepperModule {}
